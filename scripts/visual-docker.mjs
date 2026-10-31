// Runs the visual project inside the official Playwright image, so baselines are byte-stable
// across machines (fonts and anti-aliasing differ between macOS and Linux).
//
//   node scripts/visual-docker.mjs            compare against committed baselines
//   node scripts/visual-docker.mjs --update   regenerate baselines
//
// The repo is mounted read-only and copied inside the container, so the host's node_modules
// (macOS binaries) are never touched. Only baselines and reports are written back.
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const version = createRequire(import.meta.url)(
  "@playwright/test/package.json",
).version;
const update = process.argv.includes("--update");
const root = resolve(import.meta.dirname, "..");
const shots = resolve(root, "e2e/visual/__screenshots__");
const reports = resolve(root, "reports");
mkdirSync(shots, { recursive: true });
mkdirSync(reports, { recursive: true });

const inner = [
  "mkdir -p /work",
  "tar -C /src --exclude=node_modules --exclude=dist --exclude=.git --exclude=storybook-static --exclude=reports -cf - . | tar -C /work -xf -",
  "cd /work",
  "corepack enable",
  "pnpm install --frozen-lockfile",
  "pnpm codegen",
  "pnpm build",
  `(pnpm visual${update ? " --update-snapshots" : ""}; status=$?; cp -r e2e/visual/__screenshots__/. /out/shots/ 2>/dev/null; cp -r reports/. /out/reports/ 2>/dev/null; cp -r test-results /out/reports/visual-diffs 2>/dev/null; exit $status)`,
].join(" && ");

const result = spawnSync(
  "docker",
  [
    "run",
    "--rm",
    "--ipc=host",
    "-e",
    "CI=1",
    "-v",
    `${root}:/src:ro`,
    "-v",
    `${shots}:/out/shots`,
    "-v",
    `${reports}:/out/reports`,
    `mcr.microsoft.com/playwright:v${version}-noble`,
    "sh",
    "-c",
    inner,
  ],
  { stdio: "inherit" },
);
process.exit(result.status ?? 1);
