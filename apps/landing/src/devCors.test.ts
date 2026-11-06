import type { ViteDevServer } from "vite";
import { restrictCors } from "./devCors";

/** Runs a request through the plugin's middleware, then lets "the federation plugin" set its wildcard header. */
function respond(origin: string | undefined) {
  let middleware!: (req: unknown, res: unknown, next: () => void) => void;
  const hook = restrictCors().configureServer as (s: ViteDevServer) => void;
  hook({
    middlewares: { use: (fn: typeof middleware) => (middleware = fn) },
  } as unknown as ViteDevServer);

  const headers: Record<string, unknown> = {};
  const res = {
    setHeader(name: string, value: unknown) {
      headers[name] = value;
      return res;
    },
  };
  middleware({ headers: { origin } }, res, () => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
  });
  return headers;
}

describe("restrictCors", () => {
  it.each([
    "http://localhost:8080",
    "http://mfe.localhost:1355",
    "https://mfe.localhost",
    "https://fix-ui.mfe.localhost",
  ])("echoes the allowed host %s instead of a wildcard", (origin) => {
    expect(respond(origin)["Access-Control-Allow-Origin"]).toBe(origin);
  });

  it.each([
    "http://evil.example",
    "https://mfe.localhost.evil.example",
    "http://localhost:9999",
    undefined,
  ])("sets no CORS header for %s", (origin) => {
    expect(respond(origin)).not.toHaveProperty("Access-Control-Allow-Origin");
  });

  it("leaves every other header alone", () => {
    expect(respond("http://evil.example")["Content-Type"]).toBe(
      "application/json",
    );
  });
});
