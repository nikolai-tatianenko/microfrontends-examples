const path = require("node:path");
const { rspack } = require("@rspack/core");
const {
  ModuleFederationPlugin,
} = require("@module-federation/enhanced/rspack");
const { VueLoaderPlugin } = require("vue-loader");

/** Single source of truth for local ports. The API proxy target is `api`. */
const PORTS = {
  shell: 8080,
  marketing: 8081,
  auth: 8082,
  dashboard: 8083,
  landing: 8084,
  api: 4000,
  container: 8090,
  products: 8091,
  cart: 8092,
};

/**
 * Production remotes live under this prefix on the same origin, so a
 * remote's URL space never collides with the shell's client-side routes
 * (e.g. the shell route /auth/signin vs the auth remote's assets).
 */
const REMOTE_PREFIX = "/_remotes";

const REACT_SINGLETONS = [
  "react",
  "react/jsx-runtime",
  "react-dom",
  "react-dom/client",
  "react-router-dom",
  "@mui/material",
  "@emotion/react",
  "@emotion/styled",
  "@apollo/client",
  "@blog/ui",
];

/**
 * Remotes built with Vite publish an ES-module entry. A script-tag entry can't load it, but the
 * Module Federation manifest says which kind a remote is, so these are loaded through the manifest.
 */
const VITE_REMOTES = new Set(["landing"]);

/**
 * Dev origins that may load remotes: the shell and the vanilla container, by port, or either behind
 * `pnpm dev:portless` (https://mfe.localhost). Keep in sync with apps/landing/vite.config.ts.
 */
const HOST_ORIGIN =
  /^(http:\/\/(localhost|127\.0\.0\.1):(8080|8090)|https?:\/\/([a-z0-9-]+\.)*mfe\.localhost(:\d+)?)$/;

const remoteUrl = (name, isProd) => {
  const file = VITE_REMOTES.has(name) ? "mf-manifest.json" : "remoteEntry.js";
  return isProd
    ? `${REMOTE_PREFIX}/${name}/${file}`
    : `http://localhost:${PORTS[name]}/${file}`;
};
const remoteEntry = (name, isProd) => `${name}@${remoteUrl(name, isProd)}`;

/**
 * @param {object} options
 * @param {keyof typeof PORTS} options.name Federation name, also the port key.
 * @param {string} options.dir Absolute app directory (`__dirname` of the caller).
 * @param {Record<string,string>} [options.exposes] Modules this app exposes (remotes).
 * @param {string[]} [options.remotes] Names of remotes this app consumes (the shell).
 * @param {boolean} [options.vue] Enable vue-loader.
 * @param {boolean} [options.react] Share the React singletons (default true).
 * @param {string[]} [options.share] Which singletons to share (default: all of REACT_SINGLETONS).
 * @param {string} [options.title] HTML <title>.
 * @param {string} [options.template] Absolute path to a custom HTML template (default: a bare #root page).
 */
function createConfig({
  name,
  dir,
  exposes,
  remotes = [],
  vue = false,
  react = true,
  share = REACT_SINGLETONS,
  title = name,
  template = path.join(__dirname, "template.html"),
}) {
  const isShell = remotes.length > 0;
  const port = PORTS[name];
  const deps = require(path.join(dir, "package.json")).dependencies ?? {};

  // Explicit versions: some packages (e.g. @mui/material's esm/) ship no version for MF to detect.
  // Workspace packages are single-copy by construction, so they skip the version check.
  // "react/jsx-runtime" is versioned by its package, "react".
  const basePackage = (pkg) =>
    pkg
      .split("/")
      .slice(0, pkg.startsWith("@") ? 2 : 1)
      .join("/");
  const installed = (pkg) => {
    pkg = basePackage(pkg);
    try {
      return require(require.resolve(`${pkg}/package.json`, { paths: [dir] }))
        .version;
    } catch {
      return undefined; // package.json not exported; MF falls back to its own detection
    }
  };
  const shared = Object.fromEntries(
    share.map((pkg) => {
      const range = deps[basePackage(pkg)];
      const workspace = !range || range.startsWith("workspace:");
      return [
        pkg,
        {
          singleton: true,
          version: workspace ? undefined : installed(pkg),
          requiredVersion: workspace ? false : range,
        },
      ];
    }),
  );

  return (_env, argv) => {
    const isProd = argv.mode === "production";

    return {
      mode: isProd ? "production" : "development",
      entry: path.join(dir, "src/index.ts"),
      output: {
        path: path.join(dir, "dist"),
        filename: isProd ? "[name].[contenthash].js" : "[name].js",
        // Remotes resolve chunks relative to their own remoteEntry.js, never to a hard-coded domain.
        publicPath: isShell
          ? "/"
          : isProd
            ? "auto"
            : `http://localhost:${port}/`,
        clean: true,
      },
      devtool: isProd ? "source-map" : "eval-cheap-module-source-map",
      resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".vue"],
        // `@/x` is `src/x`, the alias shadcn/ui components are written against.
        alias: { "@": path.join(dir, "src") },
      },
      module: {
        rules: [
          {
            test: /\.(ts|tsx|js|jsx)$/,
            exclude: /node_modules/,
            loader: "builtin:swc-loader",
            options: {
              jsc: {
                target: "es2022",
                parser: { syntax: "typescript", tsx: true },
                transform: {
                  react: { runtime: "automatic", development: !isProd },
                },
              },
            },
          },
          {
            test: /\.css$/,
            use: [
              require.resolve("style-loader"),
              require.resolve("css-loader"),
            ],
          },
          ...(vue
            ? [{ test: /\.vue$/, loader: require.resolve("vue-loader") }]
            : []),
        ],
      },
      plugins: [
        new ModuleFederationPlugin({
          name,
          filename: "remoteEntry.js",
          exposes,
          remotes: Object.fromEntries(
            remotes.map((r) => [r, remoteEntry(r, isProd)]),
          ),
          shared: react ? shared : {},
          // "version-first" (the default) loads every remote's entry at startup to compare shared versions.
          // "loaded-first" negotiates with what is already loaded, so a remote is fetched only when used.
          shareStrategy: "loaded-first",
          dts: false,
        }),
        new rspack.HtmlRspackPlugin({ template, title }),
        ...(vue
          ? [
              new VueLoaderPlugin(),
              new rspack.DefinePlugin({
                __VUE_OPTIONS_API__: false,
                __VUE_PROD_DEVTOOLS__: false,
                __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
              }),
            ]
          : []),
      ],
      devServer: {
        port,
        hot: true,
        historyApiFallback: isShell,
        // Only the hosts that load a remote may read it; "*" would let any website read the dev sources.
        headers: (req) =>
          HOST_ORIGIN.test(req.headers.origin ?? "")
            ? { "Access-Control-Allow-Origin": req.headers.origin }
            : {},
        proxy: [
          { context: ["/graphql"], target: `http://localhost:${PORTS.api}` },
        ],
      },
      performance: { hints: false },
    };
  };
}

module.exports = { createConfig, PORTS, REMOTE_PREFIX, HOST_ORIGIN };
