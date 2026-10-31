# 0009 · Rspack builds the apps; one remote is built with Vite

**Status:** accepted (supersedes [0006](0006-pin-webpack.md))

## Context

The apps were built with webpack 5, and `@module-federation/enhanced@2.9.2` only worked with webpack 5.101.3
([ADR 0006](0006-pin-webpack.md)), so the repo carried a version pin and an override. A reviewer reading a
microfrontends example in 2026 also expects a current toolchain, and a microfrontend contract should not care
which bundler a remote used.

## Decision

1. **Rspack builds the shell and the marketing, auth and dashboard remotes** through one config factory
   (`packages/build-config`). It keeps webpack's configuration model and loader ecosystem, so the migration was
   the factory plus file renames. `@module-federation/enhanced/rspack` replaces the webpack plugin;
   `loadRemote`, `shareStrategy: "loaded-first"` ([ADR 0002](0002-runtime-load-remote.md),
   [0008](0008-load-remotes-lazily.md)) and the manifest are unchanged. The webpack pin is deleted.
2. **Vite 8 builds the `landing` remote** (`@module-federation/vite`, `@vitejs/plugin-react`,
   `@tailwindcss/vite`). The shell, built by Rspack, loads it through the same `mount()` contract.

## What it took to load a Vite remote from an Rspack host

Verified by running it, not assumed; each of these failed first.

- **The entry is an ES module.** A script-tag `remoteEntry.js` cannot load it. The host lists the remote by its
  **manifest** (`mf-manifest.json`, which declares `type: "module"`), see `VITE_REMOTES` in the factory.
- **The host must share `react/jsx-runtime` and `react-dom/client`.** The Vite plugin treats those sub-paths as
  separate shared modules. When the host did not publish them, the remote shipped its own copy of React next to
  the host's `react-router-dom`, and every hook threw React error 321. The factory now shares them. The e2e test
  "the Vite-built landing remote shares the host's React" fails if a second copy of React is downloaded.
- **Dev needs two small fixes in `vite.config.ts`:** an absolute `publicPath` (the host is on another origin) and
  the React Fast Refresh preamble, which normally comes from an HTML page Vite does not serve here.
- **Dev servers only answer the hosts.** CORS is limited to the shell and the vanilla container (`localhost` and
  `127.0.0.1` on 8080 and 8090) instead of `*`, so a website open in the same browser cannot read the dev sources.
  `@module-federation/vite` still answers `*` for `mf-manifest.json` itself (names and asset lists, no code).
- **Unmounting a root during the host's commit** logged a React error in dev with the shared React. The contract
  now defers `root.unmount()` by one microtask.

## Consequences

- ➕ No version pin; the contract is shown to be bundler-independent: the e2e suite (including retry after an
  outage of the Vite remote, axe in both color schemes, and "only the remotes a page uses are fetched") passes
  with a mixed Rspack and Vite build, and the visual baselines of the other pages did not change.
- ➖ **No hot module replacement for the Vite remote while it is hosted by the Rspack shell.** The page renders in
  dev, but editing a file does not update it until a reload; the Vite dev client is not on the host page. Work on
  it standalone (`pnpm --filter @blog/landing dev`, then open http://localhost:8084) to get HMR.
- ➖ Two bundlers, two configs, two plugin ecosystems. That is what this demo is for; a product would pick one.
- ➖ Rspack 2 ships its dev server as a separate package, so each Rspack app declares `@rspack/dev-server`.
- ➖ Storybook is also Vite (`@storybook/react-vite`), a third Vite configuration.

## Revisit when

All remotes move to Vite (then delete the Rspack factory and the host-side sharing of React sub-paths), or the
Vite plugin gains dev-mode HMR inside a foreign host.
