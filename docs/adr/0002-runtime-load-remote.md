# 0002 · Load remotes with the Module Federation runtime, not `import()`

**Status:** accepted · found by a failing E2E test

## Context

The first implementation used `import("auth/mount")`. When the auth remote's files were unreachable the shell
correctly showed a contained error, but **"Try again" never recovered**: webpack's built-in remote handler
replaces the module factory with one that rethrows the original error, permanently, until a full page reload.
A fresh `React.lazy` does not help because it re-runs the same cached factory.

## Decision

`apps/shell/src/remotes/registry.ts` loads remotes with `loadRemote("<name>/mount")` from
`@module-federation/enhanced/runtime`, which keeps its own entry cache and can retry. `RemoteRoute` creates a
new `lazy()` per attempt, and each remote route is keyed so error state cannot leak between remotes.

## Consequences

- ➕ A user recovers from a transient outage in place; verified by a Playwright test that aborts and then
  restores the remote's requests (the full 15-test suite passed 10 repeats in a row, after fixing a race in the test itself).
- ➕ The registry is a plain `Record<name, loader>`, so Jest injects fake remotes and never resolves a
  federated module.
- ➖ Remote names are strings, so the compiler cannot check them against the bundler config. Mitigated by the
  `RemoteName` union and the E2E suite.
- ➖ Couples the shell to the federation runtime package (already a build dependency).

## Revisit when

The federation runtime ships an official retry plugin we trust; then add automatic retries with backoff in
front of the manual button.
