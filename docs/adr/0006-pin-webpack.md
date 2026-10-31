# 0006 · Pin webpack 5.101.3

**Status:** superseded by [0009](0009-rspack.md) (the pin is gone with webpack)

## Context

`@module-federation/enhanced@2.9.2` requires `webpack/lib/util/extractUrlAndGlobal`. Webpack 5.112 moved that
file to `lib/externals/`, so every build fails with "Cannot find module".

## Decision

Pin `webpack` to **5.101.3** (verified to ship the old path) in `package.json` and enforce it with a
`pnpm.overrides` entry so no transitive dependency resolves a newer one.

## Revisit when

A newer `@module-federation/enhanced` supports the new path. Remove the override and run `pnpm build`.
