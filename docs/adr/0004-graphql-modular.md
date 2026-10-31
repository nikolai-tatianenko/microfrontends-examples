# 0004 · GraphQL: modular schema, per-remote operations, one shared client

**Status:** accepted

## Context

Several remotes need data. The risks are a monolithic schema file nobody can own, remotes depending on each
other's queries, and several Apollo clients with separate caches.

## Decision

- **Server:** one folder per domain under `apps/api/src/modules` (`posts`, `billing`, `analytics`, `auth`), each
  exporting `{ typeDefs, resolvers }`. `schema.ts` merges the list. Modules do not import each other.
- **Client:** each remote declares only the operations it needs in its own `graphql/` folder. `pnpm codegen`
  (client preset) generates a typed `gql/` folder **per app** from the assembled schema, so a remote only
  sees types for its own operations.
- **Cache:** `createApolloClient()` is called once by the shell and passed down as `services.apollo`. The Vue
  remote calls `apollo.query()` on the same client.
- **Tests:** integration tests execute the real operations against the real schema with Apollo's `SchemaLink`,
  with no network and no hand-written mocks.

## Consequences

- ➕ Renaming a field fails codegen/tests in exactly the remotes that use it.
- ➕ Adding a domain is one folder and one line.
- ➖ Codegen is a build step (`//#codegen` in Turborepo, cached; gitignored output).
- ➖ The demo `auth` module keeps users in memory (scrypt-hashed, but not persisted). The seam is the module
  boundary; a real store replaces it without touching consumers.

## Revisit when

Teams own domains independently enough to want schema federation (Apollo Federation / schema stitching).
Until then a single in-process schema is simpler and faster.
