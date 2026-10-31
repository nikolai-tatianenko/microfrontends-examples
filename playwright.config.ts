import { defineConfig, devices } from "@playwright/test";

const CI = !!process.env.CI;
// Point the suite at an already-running deployment (e.g. the docker compose stack) instead of the local preview server.
const EXTERNAL = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: CI ? 2 : undefined,
  // `list` for humans; `json` is what scripts/ci/report.mjs turns into the PR table.
  // The output file comes from PLAYWRIGHT_JSON_OUTPUT_FILE (set per stage by the scripts/workflows).
  reporter: CI
    ? [
        ["list"],
        ["json"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
      ]
    : [["list"], ["json"]],
  snapshotPathTemplate: "e2e/visual/__screenshots__/{testFileName}/{arg}{ext}",
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002 } },
  use: {
    baseURL: EXTERNAL ?? "http://localhost:8080",
    testIdAttribute: "data-test-id",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      testDir: "e2e/tests",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "visual",
      testDir: "e2e/visual",
      // Fixed viewport + light scheme + no motion, so a pixel diff means a real change.
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
        colorScheme: "light",
        reducedMotion: "reduce",
      },
    },
  ],
  webServer: EXTERNAL
    ? undefined
    : [
        {
          command: "node apps/api/dist/server.cjs",
          url: "http://localhost:4000/healthz",
          reuseExistingServer: !CI,
          timeout: 30_000,
        },
        {
          command: "node e2e/serve.mjs",
          url: "http://localhost:8080/healthz",
          reuseExistingServer: !CI,
          timeout: 30_000,
        },
      ],
});
