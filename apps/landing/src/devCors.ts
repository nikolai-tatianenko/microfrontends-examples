import type { Plugin } from "vite";

/**
 * Dev origins that may load this remote: the shell and the vanilla container, by port, or either behind
 * `pnpm dev:portless` (`mfe.localhost`). Keep in sync with `packages/build-config`.
 */
export const HOST_ORIGIN =
  /^(http:\/\/(localhost|127\.0\.0\.1):(8080|8090)|https?:\/\/([a-z0-9-]+\.)*mfe\.localhost(:\d+)?)$/;

/**
 * `@module-federation/vite` answers its manifest and entry with `Access-Control-Allow-Origin: *`, which would let
 * any website read the dev sources. This wraps `setHeader` for the request, so that header is only ever set to the
 * caller's own origin, and only when it is an allowed host. It must be the first plugin to see the request.
 */
export function restrictCors(allowed: RegExp = HOST_ORIGIN): Plugin {
  return {
    name: "landing:restrict-cors",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const origin = req.headers.origin ?? "";
        const setHeader = res.setHeader.bind(res);
        res.setHeader = (name, value) => {
          if (name.toLowerCase() !== "access-control-allow-origin")
            return setHeader(name, value);
          return allowed.test(origin) ? setHeader(name, origin) : res;
        };
        next();
      });
    },
  };
}
