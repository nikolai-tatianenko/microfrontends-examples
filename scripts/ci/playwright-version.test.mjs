import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import {
  cleanVersion,
  findPlaywrightVersion,
  lockedVersion,
} from "./playwright-version.mjs";

test("cleanVersion strips range operators and rejects non-semver specs", () => {
  assert.equal(cleanVersion("^1.50.1"), "1.50.1");
  assert.equal(cleanVersion("~1.2.3"), "1.2.3");
  assert.equal(cleanVersion("1.0.0"), "1.0.0");
  assert.equal(cleanVersion("catalog:"), null);
  assert.equal(cleanVersion("workspace:*"), null);
  assert.equal(cleanVersion(undefined), null);
});

test("findPlaywrightVersion checks root then e2e/package.json", () => {
  const root = mkdtempSync(join(tmpdir(), "pw-"));
  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({ devDependencies: {} }),
  );
  assert.equal(findPlaywrightVersion(root), null);

  mkdirSync(join(root, "e2e"));
  writeFileSync(
    join(root, "e2e/package.json"),
    JSON.stringify({ devDependencies: { "@playwright/test": "^1.60.0" } }),
  );
  assert.equal(findPlaywrightVersion(root), "1.60.0");

  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({ devDependencies: { "@playwright/test": "1.61.2" } }),
  );
  assert.equal(findPlaywrightVersion(root), "1.61.2");
});

const LOCK = `importers:

  .:
    devDependencies:
      '@playwright/test':
        specifier: ^1.55.0
        version: 1.64.1
      '@swc/core':
        specifier: ^1.13.0
        version: 1.16.20
`;

test("lockedVersion reads the version the lockfile resolved", () => {
  assert.equal(lockedVersion(LOCK), "1.64.1");
  assert.equal(
    lockedVersion(
      LOCK.replace("version: 1.64.1", "version: 1.64.1(extra@2.0.0)"),
    ),
    "1.64.1",
  );
  assert.equal(
    lockedVersion("importers:\n  .:\n    devDependencies: {}\n"),
    null,
  );
  assert.equal(lockedVersion(undefined), null);
});

test("the lockfile beats the range: ^1.55.0 must not pick the 1.55.0 image when 1.64.1 is installed", () => {
  const root = mkdtempSync(join(tmpdir(), "pw-"));
  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({ devDependencies: { "@playwright/test": "^1.55.0" } }),
  );
  writeFileSync(join(root, "pnpm-lock.yaml"), LOCK);
  assert.equal(findPlaywrightVersion(root), "1.64.1");
});

test("without a usable lockfile entry it falls back to package.json", () => {
  const root = mkdtempSync(join(tmpdir(), "pw-"));
  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({ devDependencies: { "@playwright/test": "^1.55.0" } }),
  );
  writeFileSync(join(root, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
  assert.equal(findPlaywrightVersion(root), "1.55.0");
});
