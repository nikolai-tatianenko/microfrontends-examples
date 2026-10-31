// Fails when any source file has < THRESHOLD% line coverage, counting unit AND integration tests together.
// The PR table shows unit-only coverage per module; this gate answers the question that matters:
// "is every file exercised by some test?".
//   node scripts/coverage-gate.mjs [--threshold 80] [--reports-dir reports]
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import libCoverage from "istanbul-lib-coverage";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const threshold = Number(arg("threshold", 80));
const reports = arg("reports-dir", "reports");
const root = process.cwd();

const modules = existsSync(join(reports, "unit"))
  ? readdirSync(join(reports, "unit"))
  : [];
const failures = [];
const files = [];
let checked = 0;

for (const module of modules) {
  const map = libCoverage.createCoverageMap({});
  for (const kind of ["unit", "integration"]) {
    const file = join(reports, kind, module, "coverage-final.json");
    if (existsSync(file)) map.merge(JSON.parse(readFileSync(file, "utf8")));
  }
  for (const file of map.files()) {
    const lines = map.fileCoverageFor(file).toSummary().lines;
    if (lines.total === 0) continue;
    checked += 1;
    files.push({ module, file: relative(root, file), lines: lines.pct });
    if (lines.pct < threshold)
      failures.push({ module, file: relative(root, file), pct: lines.pct });
  }
}

if (checked === 0) {
  console.error(
    `coverage-gate: no coverage-final.json under ${reports}/. Run pnpm test && pnpm test:integration first.`,
  );
  process.exit(2);
}
// Durable evidence for the quality gate: every file, merged unit + integration, lowest first.
const out = join(reports, "coverage-gate.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(
  out,
  JSON.stringify(
    {
      threshold,
      checked,
      failed: failures.length,
      files: files.sort((a, b) => a.lines - b.lines),
    },
    null,
    2,
  ),
);

for (const f of failures.sort((a, b) => a.pct - b.pct))
  console.log(
    `${f.pct.toFixed(1).padStart(5)}%  ${f.module.padEnd(10)} ${f.file}`,
  );
console.log(
  failures.length
    ? `\n✘ ${failures.length}/${checked} files below ${threshold}% line coverage (unit + integration)`
    : `✔ all ${checked} files at or above ${threshold}% line coverage (unit + integration)`,
);
process.exit(failures.length ? 1 : 0);
