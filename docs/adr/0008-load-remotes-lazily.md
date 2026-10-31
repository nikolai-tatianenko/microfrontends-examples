# 0008 · Fetch a remote only when its route is used

**Status:** accepted · found by a test that stopped one container

## Context

With the default `shareStrategy: "version-first"`, Module Federation loads **every** declared remote's
`remoteEntry.js` at startup so it can pick the highest shared-dependency version. A marketing page therefore
downloaded the auth and dashboard entries, and a dead remote produced failed requests (and console errors) on
every page, including pages that never use it.

## Decision

Set `shareStrategy: "loaded-first"` in `packages/build-config`. The shell negotiates shared singletons with what
is already loaded and fetches a remote's entry on the first `loadRemote()` for it.

## Consequences

- ➕ Fewer requests on first load; a remote you never visit costs nothing.
- ➕ A down remote affects only the routes that use it (E2E: `a page only fetches the remotes it uses`).
- ➖ Shared-version negotiation is "first loaded wins" instead of "highest wins". Safe here because
  `react`, `react-dom`, MUI and Apollo are `singleton` with `requiredVersion` pinned from each app's
  `package.json`, and the lockfile resolves one copy of each.

## Revisit when

Remotes are owned by teams that upgrade shared libraries independently; then explicit version negotiation
(`version-first`) is worth the startup cost.
