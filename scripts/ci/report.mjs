#!/usr/bin/env node
/**
 * Turns the test reports produced by CI into one GitHub-flavoured markdown
 * document (job summary + the auto-updated block of the PR description).
 *
 * Zero dependencies on purpose: it must run with plain `node` before / without
 * `pnpm install`.
 *
 * Input contract (everything is optional, missing = "not run"):
 *   <reports>/unit/<module>/junit.xml + coverage-summary.json
 *   <reports>/integration/<module>/junit.xml
 *   <reports>/e2e/results.json            (Playwright JSON reporter)
 *   <reports>/visual/results.json         (Playwright JSON reporter)
 *   <reports>/visual/diffs/*              (diff images, listed when present)
 *
 * Usage: node scripts/ci/report.mjs [--reports-dir reports] [--out report.md]
 */
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

/** Max failure details listed per section, keeps the PR body under GitHub's 65k limit. */
const MAX_DETAILS = 20;
const MAX_MESSAGE = 200;
const MAX_REPORT_CHARS = 50_000;

// ---------------------------------------------------------------- helpers

const decodeXml = (s) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
      String.fromCodePoint(parseInt(n, 16)),
    )
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&");

/** @param {string} s */
// eslint-disable-next-line no-control-regex -- matching the ESC byte is the point: this strips ANSI colour codes
const stripAnsi = (s) => s.replace(/\u001b\[[0-9;]*m/g, "");

/** First non-empty line, ANSI-free and truncated. */
export function firstLine(text) {
  const line =
    stripAnsi(String(text ?? ""))
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find(Boolean) ?? "";
  return line.length > MAX_MESSAGE
    ? `${line.slice(0, MAX_MESSAGE - 1)}…`
    : line;
}

/** Escape a value for use inside a markdown table cell. */
const cell = (s) => String(s).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");

/** @param {number} seconds */
export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0s";
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const m = Math.floor(seconds / 60);
  return `${m}m ${Math.round(seconds - m * 60)}s`;
}

const readText = (path) =>
  existsSync(path) ? readFileSync(path, "utf8") : null;

function readJson(path) {
  const text = readText(path);
  if (text === null) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

const subdirs = (dir) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((n) => statSync(join(dir, n)).isDirectory())
        .sort()
    : [];

// ------------------------------------------------------------------ junit

function parseAttrs(str) {
  const attrs = {};
  for (const m of str.matchAll(/([\w:.-]+)\s*=\s*"([^"]*)"/g))
    attrs[m[1]] = decodeXml(m[2]);
  return attrs;
}

/**
 * Minimal JUnit parser (jest-junit shape). Counts come from the test cases, not
 * the suite headers, because headers are often wrong when suites are nested.
 * @param {string} xml
 */
export function parseJunit(xml) {
  const failures = [];
  let tests = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let time = 0;

  for (const m of xml.matchAll(
    /<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g,
  )) {
    const attrs = parseAttrs(m[1] ?? "");
    const body = m[2] ?? "";
    tests += 1;
    time += Number(attrs.time) || 0;

    const fail = /<(failure|error)\b([^>]*?)(?:\/>|>([\s\S]*?)<\/\1>)/.exec(
      body,
    );
    if (fail) {
      failed += 1;
      const failAttrs = parseAttrs(fail[2] ?? "");
      const text = decodeXml(
        (fail[3] ?? "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1"),
      );
      failures.push({
        name: attrs.name || attrs.classname || "(unnamed test)",
        message: firstLine(failAttrs.message || text),
      });
    } else if (/<skipped\b/.test(body)) {
      skipped += 1;
    } else {
      passed += 1;
    }
  }
  return { tests, passed, failed, skipped, time, failures };
}

/**
 * One row per module under `<reports>/<kind>/`.
 * @returns {Array<ReturnType<typeof parseJunit> & {module: string, coverage: {total:number, covered:number}|null}>|null}
 *   null when nothing was reported at all.
 */
export function loadJunitModules(reportsDir, kind) {
  const root = join(reportsDir, kind);
  const rows = [];
  for (const module of subdirs(root)) {
    const xml = readText(join(root, module, "junit.xml"));
    if (xml === null) continue;
    const summary = readJson(join(root, module, "coverage-summary.json"));
    const lines = summary?.total?.lines;
    rows.push({
      module,
      ...parseJunit(xml),
      coverage:
        lines && Number.isFinite(lines.total) && Number.isFinite(lines.covered)
          ? { total: lines.total, covered: lines.covered }
          : null,
    });
  }
  return rows.length ? rows : null;
}

// ------------------------------------------------------------- playwright

function* walkSuite(suite, file) {
  const f = suite.file || file || suite.title;
  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests ?? []) {
      const results = t.results ?? [];
      const errored = [...results]
        .reverse()
        .find((r) => r.error || r.errors?.length);
      const err = errored?.error ?? errored?.errors?.[0];
      yield {
        file: f,
        title: spec.title,
        project: t.projectName ?? "",
        status:
          t.status === "expected"
            ? "passed"
            : t.status === "unexpected"
              ? "failed"
              : t.status === "flaky"
                ? "flaky"
                : "skipped",
        duration: results.reduce((s, r) => s + (r.duration || 0), 0) / 1000,
        error: err ? firstLine(err.message ?? err.stack ?? "") : "",
      };
    }
  }
  for (const child of suite.suites ?? []) yield* walkSuite(child, f);
}

/** Flatten a Playwright JSON report into one record per test. */
export function parsePlaywright(json) {
  return (json?.suites ?? []).flatMap((s) => [...walkSuite(s)]);
}

const emptyCounts = () => ({
  tests: 0,
  passed: 0,
  failed: 0,
  flaky: 0,
  skipped: 0,
  time: 0,
});

function addTest(counts, t) {
  counts.tests += 1;
  counts[t.status] += 1;
  counts.time += t.duration;
}

/** Group tests by spec file. */
export function groupByFile(tests) {
  const map = new Map();
  for (const t of tests) {
    if (!map.has(t.file))
      map.set(t.file, { file: t.file, ...emptyCounts(), items: [] });
    const g = map.get(t.file);
    addTest(g, t);
    g.items.push(t);
  }
  return [...map.values()].sort((a, b) => a.file.localeCompare(b.file));
}

/** @returns {Array|null} null when the report is missing or unreadable. */
export function loadPlaywright(reportsDir, kind) {
  const json = readJson(join(reportsDir, kind, "results.json"));
  return json ? parsePlaywright(json) : null;
}

// ----------------------------------------------------------------- render

const NOT_RUN = "_⏳ not run — no report found_";

function sum(rows, key) {
  return rows.reduce((s, r) => s + r[key], 0);
}

function coverageCell(c) {
  return c && c.total > 0
    ? `${((c.covered / c.total) * 100).toFixed(1)}%`
    : "—";
}

function totalCoverage(rows) {
  if (!rows.every((r) => r.coverage)) return null;
  return {
    total: rows.reduce((s, r) => s + r.coverage.total, 0),
    covered: rows.reduce((s, r) => s + r.coverage.covered, 0),
  };
}

function moreLine(shown, total) {
  return total > shown ? `\n- …and ${total - shown} more` : "";
}

function renderJunitSection(title, rows, { withCoverage }) {
  if (!rows) return `### ${title}\n\n${NOT_RUN}\n`;
  const head = withCoverage
    ? "| Module | Tests | ✅ Passed | ❌ Failed | ⏭️ Skipped | ⏱️ Time | 📈 Lines cov. (unit) |\n|---|--:|--:|--:|--:|--:|--:|"
    : "| Module | Tests | ✅ Passed | ❌ Failed | ⏭️ Skipped | ⏱️ Time |\n|---|--:|--:|--:|--:|--:|";
  const line = (name, r, cov) =>
    `| ${name} | ${r.tests} | ${r.passed} | ${r.failed || 0} | ${r.skipped} | ${formatTime(r.time)} |` +
    (withCoverage ? ` ${cov} |` : "");
  const body = rows
    .map((r) =>
      line(
        `${r.failed ? "❌" : "✅"} \`${cell(r.module)}\``,
        r,
        coverageCell(r.coverage),
      ),
    )
    .join("\n");
  const totals = line(
    "**Total**",
    {
      tests: sum(rows, "tests"),
      passed: sum(rows, "passed"),
      failed: sum(rows, "failed"),
      skipped: sum(rows, "skipped"),
      time: sum(rows, "time"),
    },
    coverageCell(totalCoverage(rows)),
  );

  const details = rows
    .filter((r) => r.failed)
    .map((r) => {
      const items = r.failures
        .slice(0, MAX_DETAILS)
        .map((f) => `- \`${f.name}\` — ${f.message || "no message"}`)
        .join("\n");
      return `<details><summary>❌ <b>${r.module}</b> — ${r.failed} failed</summary>\n\n${items}${moreLine(MAX_DETAILS, r.failures.length)}\n\n</details>`;
    })
    .join("\n\n");

  return `### ${title}\n\n${head}\n${body}\n${totals}\n${details ? `\n${details}\n` : ""}`;
}

function renderE2eSection(tests) {
  const title = "🎭 End-to-end (Playwright)";
  if (!tests) return `### ${title}\n\n${NOT_RUN}\n`;
  const groups = groupByFile(tests);
  const total = groups.reduce((acc, g) => {
    for (const k of ["tests", "passed", "failed", "flaky", "skipped", "time"])
      acc[k] += g[k];
    return acc;
  }, emptyCounts());
  const row = (name, g) =>
    `| ${name} | ${g.tests} | ${g.passed} | ${g.failed} | ${g.flaky} | ${g.skipped} | ${formatTime(g.time)} |`;
  const body = groups
    .map((g) =>
      row(`${g.failed ? "❌" : g.flaky ? "⚠️" : "✅"} \`${cell(g.file)}\``, g),
    )
    .join("\n");

  const failed = tests.filter((t) => t.status === "failed");
  const flaky = tests.filter((t) => t.status === "flaky");
  const list = (arr) =>
    arr
      .slice(0, MAX_DETAILS)
      .map(
        (t) =>
          `- \`${t.file} › ${t.title}\`${t.project ? ` [${t.project}]` : ""}${t.error ? ` — ${t.error}` : ""}`,
      )
      .join("\n") + moreLine(MAX_DETAILS, arr.length);
  const details = [
    failed.length &&
      `<details><summary>❌ ${failed.length} failed</summary>\n\n${list(failed)}\n\n</details>`,
    flaky.length &&
      `<details><summary>⚠️ ${flaky.length} flaky (passed on retry)</summary>\n\n${list(flaky)}\n\n</details>`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    `### ${title}\n\n| Spec | Tests | ✅ Passed | ❌ Failed | 🔁 Flaky | ⏭️ Skipped | ⏱️ Time |\n|---|--:|--:|--:|--:|--:|--:|\n` +
    `${body}\n${row("**Total**", total)}\n${details ? `\n${details}\n` : ""}`
  );
}

const isDiffError = (t) =>
  /screenshot comparison|toHaveScreenshot|pixels? .*differ|snapshot/i.test(
    t.error,
  );

function renderVisualSection(tests, diffFiles) {
  const title = "👁️ Visual regression";
  if (!tests) return `### ${title}\n\n${NOT_RUN}\n`;
  const verdict = (t) =>
    t.status === "passed"
      ? "✅ match"
      : t.status === "flaky"
        ? "⚠️ flaky"
        : t.status === "skipped"
          ? "⏭️ skipped"
          : isDiffError(t)
            ? "❌ diff"
            : "❌ error";
  const rows = tests
    .map(
      (t) =>
        `| \`${cell(t.file)}\` | ${cell(t.title)}${t.project ? ` _(${cell(t.project)})_` : ""} | ${verdict(t)} |`,
    )
    .join("\n");
  const diffs = tests.filter((t) => t.status === "failed").length;
  const files = diffFiles.length
    ? `\n<details><summary>🖼️ Diff images (${diffFiles.length})</summary>\n\n${diffFiles
        .slice(0, MAX_DETAILS)
        .map((f) => `- \`${f}\``)
        .join(
          "\n",
        )}${moreLine(MAX_DETAILS, diffFiles.length)}\n\nDownload them from the \`reports-visual\` artifact of this run.\n\n</details>\n`
    : "";
  const hint = diffs
    ? "\n> 🔄 Intended change? Comment `/update-snapshots` on this PR (or run the **Update visual baselines** workflow). Locally: `pnpm visual:update` — baselines must be generated on Linux (Playwright container).\n"
    : "";
  return `### ${title}\n\n| Spec | Screenshot | Result |\n|---|---|---|\n${rows}\n${files}${hint}`;
}

/** Overall verdict emoji. */
export function overallStatus({ unit, integration, e2e, visual }) {
  const failed =
    (unit ?? []).some((r) => r.failed) ||
    (integration ?? []).some((r) => r.failed) ||
    (e2e ?? []).some((t) => t.status === "failed") ||
    (visual ?? []).some((t) => t.status === "failed");
  if (failed) return { emoji: "❌", text: "Failing" };
  const ran = [unit, integration, e2e, visual].filter(Boolean).length;
  if (ran === 0) return { emoji: "⚠️", text: "No test reports found" };
  const flaky = [...(e2e ?? []), ...(visual ?? [])].some(
    (t) => t.status === "flaky",
  );
  if (flaky || ran < 4)
    return {
      emoji: "⚠️",
      text: flaky
        ? "Passing, with flaky tests"
        : "Passing, but some stages did not report",
    };
  return { emoji: "✅", text: "All checks passing" };
}

/**
 * @param {{unit:any, integration:any, e2e:any, visual:any, diffFiles?:string[]}} data
 * @param {Record<string,string|undefined>} [env]
 */
export function renderReport(data, env = process.env) {
  const { emoji, text } = overallStatus(data);
  const sha = env.GITHUB_SHA ? env.GITHUB_SHA.slice(0, 7) : null;
  const run =
    env.GITHUB_SERVER_URL && env.GITHUB_REPOSITORY && env.GITHUB_RUN_ID
      ? `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`
      : null;

  const footer = [
    sha ? `🔖 \`${sha}\`` : null,
    run ? `🔗 [workflow run](${run})` : null,
    `🕒 ${new Date().toISOString().replace(/\.\d+Z$/, "Z")}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const out = [
    `## ${emoji} CI report — ${text}\n`,
    renderJunitSection("🧪 Unit tests", data.unit, { withCoverage: true }),
    renderJunitSection("🔗 Integration tests", data.integration, {
      withCoverage: false,
    }),
    renderE2eSection(data.e2e),
    renderVisualSection(data.visual, data.diffFiles ?? []),
    `<sub>${footer}</sub>`,
  ].join("\n");

  return out.length > MAX_REPORT_CHARS
    ? `${out.slice(0, MAX_REPORT_CHARS)}\n\n_…report truncated, see the workflow run for the full output._\n`
    : out;
}

/** Load every report under `reportsDir` and render it. */
export function buildReport(reportsDir, env = process.env) {
  const diffDir = join(reportsDir, "visual", "diffs");
  return renderReport(
    {
      unit: loadJunitModules(reportsDir, "unit"),
      integration: loadJunitModules(reportsDir, "integration"),
      e2e: loadPlaywright(reportsDir, "e2e"),
      visual: loadPlaywright(reportsDir, "visual"),
      diffFiles: existsSync(diffDir) ? readdirSync(diffDir).sort() : [],
    },
    env,
  );
}

// -------------------------------------------------------------------- cli

function arg(argv, name, fallback) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const reportsDir = arg(process.argv, "--reports-dir", "reports");
  const out = arg(process.argv, "--out", null);
  const markdown = buildReport(reportsDir);
  if (out) writeFileSync(out, markdown);
  else process.stdout.write(markdown);
}
