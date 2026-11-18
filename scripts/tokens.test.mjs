import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { cssName, flatten, generate, resolve } from "./build-tokens.mjs";
import { deprecatedVars, findViolations } from "./lint-tokens.mjs";

const source = {
  color: {
    $type: "color",
    surface: {
      $value: "#ffffff",
      $extensions: {
        "com.blog.mode": { dark: "#121212" },
        "com.blog.forced": "Canvas",
      },
    },
    text: { onPrimary: { $value: "#ffffff" } },
    focus: { $value: "{color.surface}" },
  },
  size: { $type: "dimension", target: { $value: "44px" } },
};

test("flatten gives every leaf its dotted path and inherited type", () => {
  assert.deepEqual(
    flatten(source).map(({ path, type }) => [path, type]),
    [
      ["color.surface", "color"],
      ["color.text.onPrimary", "color"],
      ["color.focus", "color"],
      ["size.target", "dimension"],
    ],
  );
});

test("a token without a type is an error", () => {
  assert.throws(() => flatten({ lonely: { $value: "1px" } }), /no \$type/);
});

test("css names are kebab-case with the bd prefix", () => {
  assert.equal(cssName("color.text.onPrimary"), "--bd-color-text-on-primary");
});

test("an alias follows its target in each mode", () => {
  const tokens = new Map(flatten(source).map((e) => [e.path, e]));
  assert.equal(resolve(tokens, "color.focus", "light"), "#ffffff");
  assert.equal(resolve(tokens, "color.focus", "dark"), "#121212");
});

test("an unknown alias and an alias cycle are errors", () => {
  const broken = (value) =>
    new Map(
      flatten({
        a: { $type: "color", $value: value },
        b: { $type: "color", $value: "{a}" },
      }).map((e) => [e.path, e]),
    );
  assert.throws(
    () => resolve(broken("{nope}"), "a", "light"),
    /unknown token nope/,
  );
  assert.throws(() => resolve(broken("{b}"), "a", "light"), /alias cycle/);
});

test("generate writes light as the default and only what differs for dark and forced colors", () => {
  const { css, ts } = generate(source);
  assert.match(
    css,
    /:root \{\n {2}color-scheme: light;\n {2}--bd-color-surface: #ffffff;/,
  );
  assert.match(
    css,
    /:root\[data-theme="dark"\] \{\n {2}color-scheme: dark;\n {2}--bd-color-surface: #121212;\n {2}--bd-color-focus: #121212;\n\}/,
  );
  assert.match(
    css,
    /prefers-color-scheme: dark\) \{\n {2}:root:not\(\[data-theme\]\)/,
  );
  assert.match(
    css,
    /forced-colors: active\) \{\n {2}:root, :root\[data-theme\], :root:not\(\[data-theme\]\) \{\n {4}--bd-color-surface: Canvas;/,
  );
  assert.doesNotMatch(
    css.split("forced-colors")[0].split('data-theme="dark"')[1],
    /on-primary|size-target/,
  );
  assert.match(ts, /"dark": \{\n {4}"color": \{\n {6}"surface": "#121212"/);
  assert.match(ts, /\| "color\.text\.onPrimary"/);
});

test("two tokens that become the same CSS variable are an error", () => {
  assert.throws(
    () =>
      generate({
        a: {
          $type: "color",
          bB: { $value: "#000000" },
          "b-b": { $value: "#ffffff" },
        },
      }),
    /both become --bd-a-b-b/,
  );
});

test("the committed generated files match tokens.json", () => {
  const root = new URL("..", import.meta.url).pathname;
  const out = generate(
    JSON.parse(readFileSync(`${root}packages/tokens/tokens.json`, "utf8")),
  );
  assert.equal(
    readFileSync(`${root}packages/tokens/src/generated/tokens.css`, "utf8"),
    out.css,
  );
  assert.equal(
    readFileSync(`${root}packages/tokens/src/generated/tokens.ts`, "utf8"),
    out.ts,
  );
});

test("the lint flags hex, functional colors and deprecated tokens", () => {
  const deprecated = deprecatedVars({
    color: {
      $type: "color",
      old: { $value: "#000000", $deprecated: "use color.new" },
    },
  });
  const found = findViolations(
    [
      {
        path: "apps/x/a.css",
        text: "a { color: #fff; }\nb { background: rgb(0 0 0); }\nc { color: var(--bd-color-old); }",
      },
      {
        path: "apps/x/b.tsx",
        text: 'const ok = "#content"; const bad = "#0d47a1";',
      },
    ],
    deprecated,
  );
  assert.deepEqual(
    found.map((v) => [v.file, v.line, v.message.split(" ")[0]]),
    [
      ["apps/x/a.css", 1, "color"],
      ["apps/x/a.css", 2, "color"],
      ["apps/x/a.css", 3, "--bd-color-old"],
      ["apps/x/b.tsx", 1, "color"],
    ],
  );
});

test("deprecating a token does not flag a longer name that starts with it", () => {
  const deprecated = deprecatedVars({
    color: { $type: "color", text: { $value: "#000000", $deprecated: true } },
  });
  const found = findViolations(
    [
      {
        path: "apps/x/a.css",
        text: "a { color: var(--bd-color-text-muted); }\nb { color: var(--bd-color-text); }",
      },
    ],
    deprecated,
  );
  assert.deepEqual(
    found.map((v) => v.line),
    [2],
  );
});

test("the lint leaves tokens, tests and stories alone", () => {
  const text = "const c = '#123456';";
  const found = findViolations(
    [
      "packages/tokens/src/x.ts",
      "apps/x/a.test.tsx",
      "apps/x/a.stories.tsx",
      "packages/ui/src/__fixtures__/data.ts",
    ].map((path) => ({ path, text })),
  );
  assert.deepEqual(found, []);
});
