# 0003 · One origin; remotes under `/_remotes/<name>/`; only entry points are mutable

**Status:** accepted

## Context

Independent deployment only works if a deploy of one remote is visible immediately without the shell being
rebuilt, and if browsers never serve a stale entry. The original setup hard-coded a production domain and a
`/latest/` path in the shell's bundler config.

## Decision

- **Same origin** behind one gateway: no CORS, no cookies across domains, no hard-coded domain in any bundle.
- Remotes are served under **`/_remotes/<name>/`** so their file URLs can never collide with the shell's
  client-side routes (`/auth/signin` is a shell route; `/_remotes/auth/…` is a file).
- Remotes build with `publicPath: "auto"`, so chunks resolve relative to wherever `remoteEntry.js` was loaded from.
- **Caching rule**, enforced in `infra/nginx/app.conf` and mirrored by `e2e/serve.mjs`: content-hashed files are
  `immutable`; `remoteEntry.js`, `mf-manifest.json`, `mf-stats.json` and `index.html` are `no-cache`.
- The gateway resolves upstreams per request, so a remote that is down returns 502 for _its_ URLs only and the
  gateway keeps serving everything else.

## Consequences

- ➕ A remote deploy is "upload new hashed files, then replace `remoteEntry.js`": atomic from the browser's side.
- ➕ Source maps are stripped from images and belong in the error tracker.
- ➖ Same-origin means one security boundary: a compromised remote can read the shell's storage. Acceptable for a
  single organisation; revisit for third-party remotes (iframe or separate origin).
- ➖ A breaking `Services` change still needs the shell and remotes deployed in a compatible order.
