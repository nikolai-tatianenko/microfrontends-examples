#!/usr/bin/env node
/**
 * Resolves the @playwright/test version so the e2e/visual jobs can pick the
 * matching `mcr.microsoft.com/playwright` image (browser builds must match).
 * Prints the version and, in Actions, writes `version=` to $GITHUB_OUTPUT.
 *
 * It must be the version that gets *installed*, so the lockfile wins. A range such as `^1.55.0` in package.json
 * says only the minimum; the lockfile may resolve a much newer release, and this job runs before any install.
 */
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const FALLBACK = "1.64.1";

/** "^1.50.1" -> "1.50.1"; non-semver specs (workspace:, catalog:) -> null */
export function cleanVersion(spec) {
  const m = /^[~^>=\s]*(\d+\.\d+\.\d+)/.exec(spec ?? "");
  return m ? m[1] : null;
}

/** The version pnpm-lock.yaml resolved for the workspace root, e.g. "1.64.1" (peer suffixes dropped). */
export function lockedVersion(lockText) {
  const m =
    /'?@playwright\/test'?:\s*\n\s+specifier:[^\n]*\n\s+version:\s*(\d+\.\d+\.\d+)/.exec(
      lockText ?? "",
    );
  return m ? m[1] : null;
}

export function findPlaywrightVersion(
  root = ".",
  files = ["package.json", "e2e/package.json"],
) {
  const lock = resolve(root, "pnpm-lock.yaml");
  if (existsSync(lock)) {
    const locked = lockedVersion(readFileSync(lock, "utf8"));
    if (locked) return locked;
  }
  for (const f of files) {
    const path = resolve(root, f);
    if (!existsSync(path)) continue;
    const pkg = JSON.parse(readFileSync(path, "utf8"));
    const spec =
      pkg.devDependencies?.["@playwright/test"] ??
      pkg.dependencies?.["@playwright/test"];
    const v = cleanVersion(spec);
    if (v) return v;
  }
  return null;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const found = findPlaywrightVersion();
  if (!found)
    console.error(
      `::warning::@playwright/test not found in package.json, using ${FALLBACK}`,
    );
  const version = found ?? FALLBACK;
  console.log(version);
  if (process.env.GITHUB_OUTPUT)
    appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\n`);
}
