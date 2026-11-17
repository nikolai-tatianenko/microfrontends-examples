import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { check, measure } from "./bundle-budget.mjs";

test("measure sums the gzip size of every .js file, nested ones included, and ignores the rest", () => {
  const dir = mkdtempSync(join(tmpdir(), "budget-"));
  try {
    mkdirSync(join(dir, "chunks"));
    writeFileSync(join(dir, "a.js"), "x".repeat(50_000));
    writeFileSync(join(dir, "chunks", "b.js"), "y".repeat(50_000));
    writeFileSync(join(dir, "style.css"), "z".repeat(50_000));
    const one = measure(join(dir, "chunks"));
    assert.ok(
      one > 0 && one < 1024,
      "a repeated character compresses to well under 1 KiB",
    );
    assert.equal(measure(dir), 2 * one);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("check flags only the apps above their budget", () => {
  const sizes = { shell: 100 * 1024, auth: 300 * 1024 };
  const rows = check({ shell: 120, auth: 250 }, (app) => sizes[app]);
  assert.deepEqual(
    rows.map((r) => [r.app, r.over]),
    [
      ["shell", false],
      ["auth", true],
    ],
  );
});
