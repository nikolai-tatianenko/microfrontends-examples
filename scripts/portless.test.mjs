import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";

const require_ = createRequire(import.meta.url);
import { routesFor } from "./portless.mjs";

const ports = {
  shell: 8080,
  marketing: 8081,
  auth: 8082,
  dashboard: 8083,
  landing: 8084,
  api: 4000,
};

test("dev gives the shell the bare name and every other app a subdomain", () => {
  assert.deepEqual(routesFor("dev", ports), [
    ["mfe", 8080],
    ["marketing.mfe", 8081],
    ["auth.mfe", 8082],
    ["dashboard.mfe", 8083],
    ["landing.mfe", 8084],
    ["api.mfe", 4000],
  ]);
});

test("ui routes only Storybook", () => {
  assert.deepEqual(routesFor("ui", ports), [["ui.mfe", 6006]]);
});

test("the remotes' CORS rule admits the portless host and still refuses other sites", async () => {
  const { createRequire } = await import("node:module");
  const { HOST_ORIGIN } = createRequire(import.meta.url)(
    "../packages/build-config/index.cjs",
  );
  for (const origin of [
    "http://localhost:8080",
    "https://mfe.localhost",
    "https://fix-ui.mfe.localhost",
  ])
    assert.ok(HOST_ORIGIN.test(origin), origin);
  for (const origin of [
    "https://evil.example",
    "https://mfe.localhost.evil.example",
    "http://localhost:9999",
  ])
    assert.ok(!HOST_ORIGIN.test(origin), origin);
});

test("the landing dev server uses the same allow-list as the Rspack remotes", async () => {
  const { createRequire } = await import("node:module");
  const { HOST_ORIGIN } = createRequire(import.meta.url)(
    "../packages/build-config/index.cjs",
  );
  const landing = await import("../apps/landing/src/devCors.ts");
  assert.equal(landing.HOST_ORIGIN.source, HOST_ORIGIN.source);
});

test("the Rspack dev servers accept the portless host names", () => {
  const { createConfig } = require_("../packages/build-config/index.cjs");
  const config = createConfig({
    name: "marketing",
    dir: new URL("../apps/marketing", import.meta.url).pathname,
  })({}, { mode: "development" });
  assert.ok(config.devServer.allowedHosts.includes(".localhost"));
});
