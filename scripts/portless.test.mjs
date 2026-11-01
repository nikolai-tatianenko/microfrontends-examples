import assert from "node:assert/strict";
import { test } from "node:test";
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
