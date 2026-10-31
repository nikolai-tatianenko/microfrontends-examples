# Vanilla microfrontends

The smallest possible Module Federation setup: no React, no Vue, no router. A container loads two remotes
(`products`, `cart`) that each expose a plain `mount(el)` function.

| Package     | Port | Exposes                                 |
| ----------- | ---- | --------------------------------------- |
| `container` | 8090 | consumes `products/mount`, `cart/mount` |
| `products`  | 8091 | `./mount`                               |
| `cart`      | 8092 | `./mount`                               |

```bash
pnpm install
pnpm --filter "@vanilla/*" dev     # then open http://localhost:8090
pnpm --filter "@vanilla/*" test
```

Read this first if Module Federation is new to you; the [blog example](../../README.md) adds a typed
contract, routing, auth and GraphQL on top of the same idea.
