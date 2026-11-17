// Fails when an app's built JavaScript grows past its budget (gzip, summed over every .js file in its dist).
// The budgets sit about 15% above the sizes at the time they were set, so a dependency that quietly doubles a
// bundle is caught, while normal feature work is not. Raise a number in the same commit that justifies it.
//   node scripts/bundle-budget.mjs
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

/** Gzip size in bytes of every `.js` file under `dir`. */
export function measure(dir) {
  let bytes = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) bytes += measure(path);
    else if (entry.name.endsWith(".js"))
      bytes += gzipSync(readFileSync(path)).length;
  }
  return bytes;
}

/** One line per app, with `over` set when the size is above its budget. */
export function check(budgets, sizeOf) {
  return Object.entries(budgets).map(([app, budgetKiB]) => {
    const sizeKiB = sizeOf(app) / 1024;
    return { app, sizeKiB, budgetKiB, over: sizeKiB > budgetKiB };
  });
}

function main() {
  const flag = process.argv.indexOf("--budgets");
  const file =
    flag > -1 ? process.argv[flag + 1] : "scripts/bundle-budgets.json";
  const budgets = JSON.parse(readFileSync(file, "utf8"));
  const rows = check(budgets, (app) => measure(join("apps", app, "dist")));
  for (const { app, sizeKiB, budgetKiB, over } of rows) {
    console.log(
      `${over ? "FAIL" : "ok  "} ${app.padEnd(10)} ${sizeKiB.toFixed(1).padStart(6)} KiB gzip of ${budgetKiB} KiB`,
    );
  }
  if (rows.some((row) => row.over)) process.exitCode = 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
