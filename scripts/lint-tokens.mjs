// Keeps the design system the only place that decides a color: fails on a color literal in app or package source,
// and on a use of a token that tokens.json marks `$deprecated`.
//   node scripts/lint-tokens.mjs
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { cssName, flatten } from "./build-tokens.mjs";

const SCANNED = /\.(ts|tsx|vue|css|html|mdx|svg|mjs)$/;
const SKIPPED_DIRS = new Set([
  "node_modules",
  "dist",
  "storybook-static",
  "gql",
  "generated",
  "coverage",
]);
/** Files whose colors are data, not styling, each with the reason. */
export const ALLOWED = [
  [
    /\.(test|int\.test|stories)\.tsx?$/,
    "tests and stories assert or show literal values",
  ],
  [/packages\/tokens\//, "this is where colors are defined"],
  [/__fixtures__\//, "placeholder cover images for demos"],
  [/apps\/api\//, "the API generates cover images; it is not UI"],
];

const COLOR =
  /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b|\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)\(/g;

/** `{ file, line, message }` for every problem in the given files. */
export function findViolations(files, deprecated = new Map()) {
  const found = [];
  for (const { path, text } of files) {
    if (ALLOWED.some(([pattern]) => pattern.test(path))) continue;
    text.split("\n").forEach((line, index) => {
      for (const match of line.matchAll(COLOR))
        found.push({
          file: path,
          line: index + 1,
          message: `color literal ${match[0]} (use a design token)`,
        });
      for (const [name, reason] of deprecated)
        if (new RegExp(`${name}(?![\\w-])`).test(line))
          found.push({
            file: path,
            line: index + 1,
            message: `${name} is deprecated: ${reason}`,
          });
    });
  }
  return found;
}

/** CSS variable name -> reason, for every deprecated token. */
export function deprecatedVars(source) {
  return new Map(
    flatten(source)
      .filter(({ token }) => token.$deprecated)
      .map(({ path, token }) => [
        cssName(path),
        typeof token.$deprecated === "string"
          ? token.$deprecated
          : "see tokens.json",
      ]),
  );
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIPPED_DIRS.has(entry.name)) walk(join(dir, entry.name), out);
    } else if (SCANNED.test(entry.name)) out.push(join(dir, entry.name));
  }
  return out;
}

function main() {
  const root = join(import.meta.dirname, "..");
  const files = ["apps", "packages"]
    .flatMap((dir) => walk(join(root, dir)))
    .map((file) => ({
      path: relative(root, file),
      text: readFileSync(file, "utf8"),
    }));
  const source = JSON.parse(
    readFileSync(join(root, "packages/tokens/tokens.json"), "utf8"),
  );
  const violations = findViolations(files, deprecatedVars(source));
  for (const v of violations)
    console.error(`${v.file}:${v.line}  ${v.message}`);
  if (violations.length) process.exitCode = 1;
  else console.log(`tokens: no color literals in ${files.length} files`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
