# Architecture Decision Records

Short, dated records of decisions that a reviewer is likely to question. Each one states the context, the
decision, what we gave up, and when to revisit it.

| #                                              | Decision                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------- |
| [0001](0001-host-injects-services.md)          | The host injects services through `mount()`; no cross-remote imports, no global store |
| [0002](0002-runtime-load-remote.md)            | Load remotes through the Module Federation runtime API, not a static `import()`       |
| [0003](0003-same-origin-remote-prefix.md)      | One origin; remotes under `/_remotes/<name>/`; only the entry points are mutable      |
| [0004](0004-graphql-modular.md)                | GraphQL: modular schema, per-remote operations, one shared Apollo client              |
| [0005](0005-testing-strategy.md)               | Four test layers; visual baselines generated only in a Linux container                |
| [0006](0006-pin-webpack.md)                    | ~~Pin webpack 5.101.3~~ (superseded by 0009)                                          |
| [0007](0007-when-not-to-use-microfrontends.md) | When _not_ to use microfrontends                                                      |
| [0009](0009-rspack.md)                         | Rspack builds the apps; one remote is built with Vite, and what that took             |
| [0010](0010-shadcn-tailwind-remote.md)         | A remote may use its own styling stack (shadcn/ui + Tailwind v4) if it stays scoped   |
| [0011](0011-guided-tour-in-the-shell.md)       | The guided tour lives in the shell; steps point at `data-test-id`s                    |
