// Production-like static server for E2E and visual tests (zero dependencies).
// Serves the *built* apps with the same URL layout nginx uses (infra/nginx/gateway.conf):
//   /                  -> shell (SPA fallback to index.html)
//   /_remotes/<name>/  -> apps/<name>/dist
//   /_storybook/       -> packages/ui/storybook-static (visual tests only)
//   /graphql           -> API on :4000
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";

const root = resolve(import.meta.dirname, "..");
const port = Number(process.env.PORT ?? 8080);
const apiOrigin = process.env.API_ORIGIN ?? "http://localhost:4000";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".map": "application/json",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
};

async function file(dir, rel) {
  const full = normalize(join(dir, rel));
  if (full !== dir && !full.startsWith(dir + sep)) return null; // path traversal (incl. sibling dirs like dist-evil)
  try {
    return (await stat(full)).isFile() ? full : null;
  } catch {
    return null;
  }
}

async function send(res, path, status = 200) {
  const body = await readFile(path);
  // Same caching rule as production: only remoteEntry.js (and html) may change under a stable URL.
  const mutable = path.endsWith("remoteEntry.js") || path.endsWith(".html");
  res.writeHead(status, {
    "content-type": TYPES[extname(path)] ?? "application/octet-stream",
    "cache-control": mutable
      ? "no-cache"
      : "public, max-age=31536000, immutable",
  });
  res.end(body);
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  try {
    const path = decodeURIComponent(url.pathname); // inside try: a malformed %-escape must not crash the server
    if (path === "/graphql" || path === "/healthz") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const hasBody = !["GET", "HEAD"].includes(req.method ?? "GET");
      const upstream = await fetch(apiOrigin + req.url, {
        method: req.method,
        headers: {
          "content-type": req.headers["content-type"] ?? "application/json",
        },
        body: hasBody ? Buffer.concat(chunks) : undefined,
      });
      res.writeHead(upstream.status, {
        "content-type": upstream.headers.get("content-type") ?? "text/plain",
      });
      res.end(Buffer.from(await upstream.arrayBuffer()));
      return;
    }

    const remote = path.match(
      /^\/_remotes\/(marketing|auth|dashboard|landing)\/(.*)$/,
    );
    if (remote) {
      const found = await file(
        join(root, "apps", remote[1], "dist"),
        remote[2],
      );
      return found ? send(res, found) : res.writeHead(404).end("not found");
    }

    if (path.startsWith("/_storybook/")) {
      const dir = join(root, "packages/ui/storybook-static");
      const found = await file(
        dir,
        path.slice("/_storybook/".length) || "index.html",
      );
      return found ? send(res, found) : res.writeHead(404).end("not found");
    }

    const shell = join(root, "apps/shell/dist");
    const found = await file(shell, path.slice(1));
    if (found) return send(res, found);
    return send(res, join(shell, "index.html")); // SPA fallback
  } catch (error) {
    res.writeHead(502).end(String(error));
  }
}).listen(port, () => console.log(`preview on http://localhost:${port}`));
