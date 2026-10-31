import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import {
  END,
  START,
  main,
  replaceBlock,
  resolvePrNumber,
} from "./update-pr-body.mjs";

const hand =
  "## 🎯 Summary\nHand-written text with $& and $1 specials.\n\n## ✅ Checklist\n- [ ] done\n";

test("appends a marker block when markers are missing, keeping the original text", () => {
  const out = replaceBlock(hand, "REPORT");
  assert.ok(out.startsWith(hand));
  assert.equal(out, `${hand}\n${START}\nREPORT\n${END}\n`);
});

test("empty / null body gets just the block", () => {
  assert.equal(replaceBlock("", "R"), `${START}\nR\n${END}\n`);
  assert.equal(replaceBlock(null, "R"), `${START}\nR\n${END}\n`);
});

test("replaces only the span between the markers, outside text is byte-identical", () => {
  const before = `top $1 text\n\n${START}\nOLD\nOLD\n${END}\n\nbottom text  \n`;
  const out = replaceBlock(before, "NEW $& block");
  assert.equal(
    out,
    `top $1 text\n\n${START}\nNEW $& block\n${END}\n\nbottom text  \n`,
  );
});

test("is idempotent", () => {
  const once = replaceBlock(hand, "REPORT");
  assert.equal(replaceBlock(once, "REPORT"), once);
  const twice = replaceBlock(replaceBlock(once, "OTHER"), "REPORT");
  assert.equal(twice, once);
});

test("CRLF bodies keep CRLF and untouched text stays byte-identical", () => {
  const body = `intro\r\n\r\n${START}\r\nold\r\n${END}\r\n\r\noutro\r\n`;
  const out = replaceBlock(body, "line1\nline2");
  assert.equal(
    out,
    `intro\r\n\r\n${START}\r\nline1\r\nline2\r\n${END}\r\n\r\noutro\r\n`,
  );
  assert.equal(replaceBlock(out, "line1\nline2"), out);
  assert.ok(
    !/[^\r]\n/.test(replaceBlock("a\r\nb", "x\ny")),
    "no bare LF introduced",
  );
});

test("a lone start marker is repaired instead of duplicated", () => {
  const out = replaceBlock(`hello\n${START}\nhalf written`, "R");
  assert.equal(out, `hello\n${START}\nR\n${END}`);
  assert.equal(out.split(START).length, 2);
});

test("resolvePrNumber prefers --pr, then PR_NUMBER, then the event payload", () => {
  assert.equal(resolvePrNumber({ pr: "7" }, { PR_NUMBER: "8" }), 7);
  assert.equal(resolvePrNumber({}, { PR_NUMBER: "8" }), 8);
  const dir = mkdtempSync(join(tmpdir(), "ev-"));
  const path = join(dir, "event.json");
  writeFileSync(path, JSON.stringify({ pull_request: { number: 9 } }));
  assert.equal(resolvePrNumber({}, { GITHUB_EVENT_PATH: path }), 9);
  assert.equal(resolvePrNumber({}, {}), null);
});

function fakeFetch(responses) {
  const calls = [];
  const fn = async (url, init = {}) => {
    calls.push({ url, method: init.method ?? "GET", body: init.body });
    const r = responses.shift();
    return { ok: r.status < 300, status: r.status, json: async () => r.json };
  };
  fn.calls = calls;
  return fn;
}

const reportFile = () => {
  const p = join(mkdtempSync(join(tmpdir(), "rep-")), "report.md");
  writeFileSync(p, "REPORT");
  return p;
};
const env = { GITHUB_TOKEN: "t", GITHUB_REPOSITORY: "o/r", PR_NUMBER: "5" };

test("main GETs the body then PATCHes only the replaced body", async () => {
  const f = fakeFetch([{ status: 200, json: { body: hand } }, { status: 200 }]);
  assert.equal(await main(["--file", reportFile()], env, f), 0);
  assert.deepEqual(
    f.calls.map((c) => c.method),
    ["GET", "PATCH"],
  );
  assert.equal(JSON.parse(f.calls[1].body).body, replaceBlock(hand, "REPORT"));
  assert.match(f.calls[1].url, /repos\/o\/r\/pulls\/5$/);
});

test("main skips the PATCH when nothing changed", async () => {
  const f = fakeFetch([
    { status: 200, json: { body: replaceBlock(hand, "REPORT") } },
  ]);
  assert.equal(await main(["--file", reportFile()], env, f), 0);
  assert.equal(f.calls.length, 1);
});

test("fork PRs (read-only token) degrade to a warning and exit 0", async () => {
  const f = fakeFetch([{ status: 200, json: { body: hand } }, { status: 403 }]);
  assert.equal(await main(["--file", reportFile()], env, f), 0);
  const noToken = fakeFetch([]);
  assert.equal(
    await main(["--file", reportFile()], { PR_NUMBER: "5" }, noToken),
    0,
  );
  assert.equal(noToken.calls.length, 0);
});

test("unexpected API errors fail the step", async () => {
  const f = fakeFetch([{ status: 500 }]);
  assert.equal(await main(["--file", reportFile()], env, f), 1);
});
