// Husky self-check: the hooks exist, call the gates they promise, and the commit rules say what we think.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const root = new URL("..", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const pkg = JSON.parse(read("package.json"));

/** Runs commitlint on a message the way the commit-msg hook does. */
const lint = (message) =>
  spawnSync("pnpm", ["exec", "commitlint"], {
    cwd: root,
    input: message,
    encoding: "utf8",
  });

test("installing the repo wires Husky, and `pnpm commit` opens Commitizen", () => {
  assert.equal(pkg.scripts.prepare, "husky");
  assert.equal(pkg.scripts.commit, "cz");
  assert.equal(pkg.config.commitizen.path, "cz-conventional-changelog");
});

test("pre-commit formats and lints what is staged, then type-checks", () => {
  const hook = read(".husky/pre-commit");
  assert.match(hook, /lint-staged/);
  assert.match(hook, /pnpm typecheck/);
  assert.ok(pkg["lint-staged"], "lint-staged is configured");
});

test("commit-msg runs commitlint on the message file", () => {
  assert.match(read(".husky/commit-msg"), /commitlint --edit "\$1"/);
});

test("pre-push runs unit, integration, coverage and end-to-end tests", () => {
  const hook = read(".husky/pre-push");
  for (const gate of ["test:all", "coverage:check", "pnpm build", "pnpm e2e"])
    assert.ok(hook.includes(gate), `pre-push runs ${gate}`);
});

test("a Conventional Commit passes", () => {
  const result = lint("feat(dev): add named URLs\n\nWhy this matters.\n");
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test("a message without a type is refused", () => {
  assert.notEqual(lint("Added some stuff\n").status, 0);
});

test("an unknown type is refused", () => {
  assert.notEqual(lint("wip: stuff\n").status, 0);
});

test("Cyrillic is refused", () => {
  assert.notEqual(
    lint("docs: \u043f\u0440\u0438\u0432\u0435\u0442\n").status,
    0,
  );
});

test("an AI-tool trailer is refused", () => {
  const message =
    "fix: a bug\n\nCo-Authored-By: Claude <noreply@anthropic.com>\n";
  assert.notEqual(lint(message).status, 0);
});
