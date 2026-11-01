import { federation } from "@module-federation/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";

const PORT = 8084;

/**
 * In dev the host page is not served by Vite, so the HTML that normally carries React Fast Refresh's
 * preamble never exists. A virtual module with the preamble is imported first by the exposed module;
 * ES module imports run in order, so it is in place before any component module checks for it.
 */
const PREAMBLE_ID = "virtual:react-preamble";
const reactPreamble = (): Plugin => ({
  name: "landing:react-preamble",
  apply: "serve",
  enforce: "pre",
  resolveId: (id) => (id === PREAMBLE_ID ? `\0${PREAMBLE_ID}` : undefined),
  load: (id) =>
    id === `\0${PREAMBLE_ID}`
      ? [
          `import RefreshRuntime from "http://localhost:${PORT}/@react-refresh";`,
          "RefreshRuntime.injectIntoGlobalHook(window);",
          "window.$RefreshReg$ = () => {};",
          "window.$RefreshSig$ = () => (type) => type;",
          "window.__vite_plugin_react_preamble_installed__ = true;",
        ].join("\n")
      : undefined,
  transform: (code, id) =>
    id.endsWith("/src/mount.ts")
      ? { code: `import "${PREAMBLE_ID}";\n${code}`, map: null }
      : undefined,
});

export default defineConfig(({ command }) => ({
  // Relative asset URLs: the remote resolves chunks next to its own remoteEntry.js.
  base: command === "build" ? "./" : `http://localhost:${PORT}/`,
  resolve: { alias: { "@": resolve(__dirname, "src") } },
  server: {
    port: PORT,
    strictPort: true,
    // Only the hosts that load this remote may read it; `cors: true` would let any website read the sources.
    cors: {
      origin:
        /^(http:\/\/(localhost|127\.0\.0\.1):(8080|8090)|https?:\/\/([a-z0-9-]+\.)*mfe\.localhost(:\d+)?)$/,
    },
    proxy: { "/graphql": "http://localhost:4000" },
  },
  build: { target: "es2022", outDir: "dist" },
  plugins: [
    reactPreamble(),
    react(),
    tailwindcss(),
    federation({
      name: "landing",
      filename: "remoteEntry.js",
      manifest: true,
      // Dev: absolute, because the host is on another origin. Build: resolved from the manifest's own URL.
      publicPath: command === "build" ? "auto" : `http://localhost:${PORT}/`,
      dts: false,
      exposes: { "./mount": "./src/mount.ts" },
      shared: {
        react: { singleton: true, requiredVersion: "^19.1.0" },
        "react-dom": { singleton: true, requiredVersion: "^19.1.0" },
        "react-router-dom": { singleton: true, requiredVersion: "^7.6.0" },
        "@apollo/client": { singleton: true, requiredVersion: "^3.13.8" },
      },
    }),
  ],
}));
