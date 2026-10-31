# 0001 · The host injects services through `mount()`

**Status:** accepted

## Context

The shell and its remotes need to share a session (who is signed in) and a GraphQL client (so queries share a
cache). The usual shortcuts all couple the remotes: importing a store from another remote, a window-level
global, or a shared singleton module that every remote must agree on.

## Decision

A remote exposes exactly one thing, `mount(el, { initialPath, services, onNavigate })`, and receives everything
it may use in `services` (`session`, `apollo`). It reports navigation through `onNavigate`. The type lives in
`@blog/contract`, which is framework-agnostic: the React remotes use `createReactRemote(App)`, the Vue remote
implements the same function by hand.

## Consequences

- ➕ A remote can be run standalone, in a test, or in Storybook by passing fake services.
- ➕ The host is the only place real implementations are chosen (`apps/shell/src/services.ts`), so swapping the
  auth mechanism touches one file.
- ➕ React and Vue remotes are interchangeable from the host's point of view.
- ➖ Adding a capability means changing the contract and every remote that wants it. Intentional friction.
- ➖ `Services` is a type shared at build time; a breaking change needs coordinated deploys (see ADR 0003 for
  how the cached entry points keep that window small).

## Revisit when

Remotes need capabilities the host cannot know about in advance. Then consider a registry/event bus rather
than a bigger `Services` object.
