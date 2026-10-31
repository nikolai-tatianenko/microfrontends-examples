import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  buildReport,
  firstLine,
  formatTime,
  parseJunit,
  parsePlaywright,
  groupByFile,
  overallStatus,
} from "./report.mjs";

const fixture = (name) =>
  fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));
const env = {
  GITHUB_SHA: "abcdef1234567890",
  GITHUB_SERVER_URL: "https://github.com",
  GITHUB_REPOSITORY: "o/r",
  GITHUB_RUN_ID: "42",
};

test("parseJunit counts passed / failed / skipped from test cases", () => {
  const xml = `<testsuites><testsuite>
    <testcase classname="a" name="ok" time="0.5"/>
    <testcase classname="a" name="skip" time="0"><skipped/></testcase>
    <testcase classname="a" name="bad" time="0.25"><failure message="boom">stack</failure></testcase>
  </testsuite></testsuites>`;
  const r = parseJunit(xml);
  assert.deepEqual(
    {
      tests: r.tests,
      passed: r.passed,
      failed: r.failed,
      skipped: r.skipped,
      time: r.time,
    },
    { tests: 3, passed: 1, failed: 1, skipped: 1, time: 0.75 },
  );
  assert.deepEqual(r.failures, [{ name: "bad", message: "boom" }]);
});

test("parseJunit decodes XML entities and falls back to the failure body", () => {
  const r = parseJunit(
    '<testcase name="a &amp; &quot;b&quot;" time="1"><error>Error: x &lt; y&#10;at z</error></testcase>',
  );
  assert.equal(r.failures[0].name, 'a & "b"');
  assert.equal(r.failures[0].message, "Error: x < y");
});

test("parseJunit tolerates empty input", () => {
  assert.equal(parseJunit("").tests, 0);
});

test("parsePlaywright flattens nested suites and maps statuses", () => {
  const tests = parsePlaywright(
    JSON.parse(
      JSON.stringify({
        suites: [
          {
            title: "a.spec.ts",
            file: "a.spec.ts",
            specs: [],
            suites: [
              {
                title: "x",
                specs: [
                  {
                    title: "t1",
                    tests: [
                      {
                        projectName: "chromium",
                        status: "flaky",
                        results: [{ duration: 500 }, { duration: 1500 }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }),
    ),
  );
  assert.equal(tests.length, 1);
  assert.equal(tests[0].file, "a.spec.ts");
  assert.equal(tests[0].status, "flaky");
  assert.equal(tests[0].duration, 2);
  assert.equal(groupByFile(tests)[0].flaky, 1);
});

test("helpers: firstLine strips ANSI and truncates, formatTime is readable", () => {
  assert.equal(firstLine("\u001b[31mred\u001b[39m\nsecond"), "red");
  assert.ok(firstLine("x".repeat(500)).length <= 200);
  assert.equal(formatTime(0.25), "250ms");
  assert.equal(formatTime(3), "3.0s");
  assert.equal(formatTime(125), "2m 5s");
});

test("all-pass fixture: grouped unit table, totals, coverage, e2e, visual, footer", () => {
  const md = buildReport(fixture("pass"), env);

  assert.match(
    md,
    /^## ✅ CI report — Passing, but some stages did not report|^## ✅ CI report — All checks passing/,
  );
  assert.match(md, /### 🧪 Unit tests/);
  assert.match(
    md,
    /\| Module \| Tests \| ✅ Passed \| ❌ Failed \| ⏭️ Skipped \| ⏱️ Time \| 📈 Lines cov\. \(unit\) \|/,
  );
  assert.match(md, /\| ✅ `shell` \| 2 \| 2 \| 0 \| 0 \| 1\.0s \| 80\.0% \|/);
  assert.match(md, /\| ✅ `ui` \| 4 \| 3 \| 0 \| 1 \| 1\.0s \| 91\.5% \|/);
  // weighted: (183 + 80) / (200 + 100)
  assert.match(
    md,
    /\| \*\*Total\*\* \| 6 \| 5 \| 0 \| 1 \| 2\.0s \| 87\.7% \|/,
  );
  assert.ok(
    md.indexOf("`shell`") < md.indexOf("`ui`"),
    "modules sorted alphabetically",
  );

  assert.match(md, /### 🔗 Integration tests[\s\S]*\| ✅ `api` \| 2 \| 2 \|/);
  assert.match(
    md,
    /\| ✅ `smoke\.spec\.ts` \| 2 \| 2 \| 0 \| 0 \| 0 \| 3\.0s \|/,
  );
  assert.match(
    md,
    /\| ✅ `nav\.spec\.ts` \| 1 \| 1 \| 0 \| 0 \| 0 \| 500ms \|/,
  );
  assert.match(
    md,
    /\| `home\.spec\.ts` \| home light _\(chromium\)_ \| ✅ match \|/,
  );
  assert.doesNotMatch(md, /<details>/);
  assert.match(
    md,
    /🔖 `abcdef1` · 🔗 \[workflow run\]\(https:\/\/github\.com\/o\/r\/actions\/runs\/42\) · 🕒 \d{4}-\d\d-\d\dT/,
  );
});

test("failing fixture: failures surface in collapsed details with first-line messages", () => {
  const dir = fixture("fail");
  const md = buildReport(dir, env);

  assert.match(md, /^## ❌ CI report — Failing/);
  assert.match(md, /\| ❌ `auth` \| 3 \| 2 \| 1 \| 0 \|/);
  assert.match(md, /<details><summary>❌ <b>auth<\/b> — 1 failed<\/summary>/);
  assert.match(md, /`rejects "bad" email & empty` — expected 1 to be 2/);

  assert.match(md, /\| ❌ `login\.spec\.ts` \| 3 \| 0 \| 1 \| 1 \| 1 \|/);
  assert.match(
    md,
    /`login\.spec\.ts › signs in` \[chromium\] — Error: expect\(locator\)\.toBeVisible\(\) failed/,
  );
  assert.match(md, /⚠️ 1 flaky \(passed on retry\)/);

  assert.match(
    md,
    /\| `home\.spec\.ts` \| home light _\(chromium\)_ \| ❌ diff \|/,
  );
  assert.match(md, /Diff images \(1\)[\s\S]*home-light-diff\.png/);
  assert.match(md, /\/update-snapshots/);
});

test("missing report dirs never crash and render as not run", () => {
  const empty = mkdtempSync(join(tmpdir(), "ci-report-"));
  const md = buildReport(empty, {});
  assert.match(md, /^## ⚠️ CI report — No test reports found/);
  assert.equal(md.match(/not run — no report found/g).length, 4);
  assert.doesNotMatch(md, /actions\/runs/);

  assert.doesNotThrow(() => buildReport(join(empty, "does-not-exist"), {}));
});

test("partial reports are a warning, not a pass", () => {
  assert.equal(
    overallStatus({
      unit: [{ failed: 0 }],
      integration: null,
      e2e: null,
      visual: null,
    }).emoji,
    "⚠️",
  );
  assert.equal(
    overallStatus({
      unit: [{ failed: 1 }],
      integration: null,
      e2e: null,
      visual: null,
    }).emoji,
    "❌",
  );
});
