// Runs a dev command behind named .localhost URLs (https://mfe.localhost) instead of port numbers.
//
//   node scripts/portless.mjs dev    pnpm dev       -> https://mfe.localhost (+ one name per remote and the API)
//   node scripts/portless.mjs ui     pnpm storybook -> https://ui.mfe.localhost
//
// The apps keep their fixed ports: the remote URLs inside the shell and the API proxy target are built
// from them (see packages/build-config). portless only adds names in front, as static aliases that are
// removed again when the command exits. Needs the `portless` CLI (Node 24+) on the PATH; see the README.
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";

/** Storybook's port is set by `packages/ui`'s `storybook` script. */
const STORYBOOK_PORT = 6006;
const BASE = "mfe";

/**
 * The names to register for a mode, as `[name, port]` pairs.
 * @param {"dev" | "ui"} mode
 * @param {Record<string, number>} ports Local ports by app, as in `@blog/build-config`.
 */
export function routesFor(mode, ports) {
  if (mode === "ui") return [[`ui.${BASE}`, STORYBOOK_PORT]];
  return [
    [BASE, ports.shell],
    ...["marketing", "auth", "dashboard", "landing", "api"].map((app) => [
      `${app}.${BASE}`,
      ports[app],
    ]),
  ];
}

const COMMANDS = { dev: ["pnpm", "dev"], ui: ["pnpm", "storybook"] };

function portless(...args) {
  const result = spawnSync("portless", args, { stdio: "inherit" });
  if (result.error || result.status !== 0) {
    console.error(
      `\n"portless ${args.join(" ")}" failed. It needs the portless CLI on Node 24+ (npm i -g portless).`,
    );
    process.exit(result.status ?? 1);
  }
}

function main(mode) {
  if (!(mode in COMMANDS)) {
    console.error("usage: node scripts/portless.mjs <dev|ui>");
    process.exit(2);
  }
  const { PORTS } = createRequire(import.meta.url)(
    "../packages/build-config/index.cjs",
  );
  const routes = routesFor(mode, PORTS);

  portless("proxy", "start");
  for (const [name, port] of routes) portless("alias", name, String(port));

  const [cmd, ...args] = COMMANDS[mode];
  const child = spawn(cmd, args, { stdio: "inherit" });
  // Ctrl+C reaches the child through the terminal; a plain SIGTERM has to be passed on. Either way, wait, then clean up.
  process.on("SIGINT", () => {});
  process.on("SIGTERM", () => child.kill("SIGTERM"));
  child.on("exit", (code) => {
    for (const [name] of routes)
      spawnSync("portless", ["alias", "--remove", name], { stdio: "ignore" });
    process.exit(code ?? 0);
  });
}

if (import.meta.filename === process.argv[1]) main(process.argv[2]);
