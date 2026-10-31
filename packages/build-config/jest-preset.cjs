const fs = require("node:fs");
const path = require("node:path");

/**
 * Shared Jest preset.
 *
 * One run = one kind of test, chosen by TEST_KIND (default "unit"):
 *   unit         *.test.ts(x)           -> coverage + reports/unit/<module>/
 *   integration  *.int.test.ts(x)       -> reports/integration/<module>/
 *
 * Reports land in <repo>/reports/<kind>/<module>/junit.xml, the layout
 * scripts/ci/report.mjs reads to build the PR table.
 *
 * Usage in a package's jest.config.cjs:
 *   module.exports = require("@blog/build-config/jest-preset").createJestConfig(__dirname);
 */
function createJestConfig(dir, { env = "jsdom", coverageExclude = [] } = {}) {
  const kind = process.env.TEST_KIND === "integration" ? "integration" : "unit";
  const module = path.basename(dir);
  const reports = path.join(__dirname, "../../reports", kind, module);

  return {
    rootDir: dir,
    testEnvironment: env,
    watchman: false,
    testMatch:
      kind === "integration"
        ? ["<rootDir>/src/**/*.int.test.{ts,tsx}"]
        : ["<rootDir>/src/**/*.test.{ts,tsx}"],
    testPathIgnorePatterns:
      kind === "unit"
        ? ["\\.int\\.test\\.[jt]sx?$", "/node_modules/"]
        : ["/node_modules/"],
    transform: {
      "^.+\\.(t|j)sx?$": [
        "@swc/jest",
        {
          jsc: {
            parser: { syntax: "typescript", tsx: true },
            transform: { react: { runtime: "automatic" } },
          },
        },
      ],
    },
    moduleNameMapper: {
      "\\.css$": path.join(__dirname, "jest-empty.cjs"),
      "^@/(.*)$": path.join(dir, "src/$1"),
    },
    setupFilesAfterEnv: [path.join(__dirname, "jest-setup.cjs")],
    reporters: [
      "default",
      [
        "jest-junit",
        {
          outputDirectory: reports,
          outputName: "junit.xml",
          classNameTemplate: "{classname}",
          titleTemplate: "{title}",
        },
      ],
    ],
    collectCoverage: process.env.COVERAGE !== "off",
    collectCoverageFrom: [
      "src/**/*.{ts,tsx}",
      "!src/**/*.{test,int.test,stories}.{ts,tsx}",
      "!src/gql/**",
      "!src/__fixtures__/**",
      "!src/test-utils.tsx",
      "!src/standalone.{ts,tsx}",
      "!src/bootstrap.tsx",
      "!src/mount.{ts,tsx}", // three-line glue (createReactRemote / createApp); covered by E2E
      "!src/server.ts",
      "!**/*.d.ts",
      // A package with a bundler config is an app: its src/index.ts is the one-line async-boundary entry.
      ...(["rspack.config.cjs", "vite.config.ts"].some((f) =>
        fs.existsSync(path.join(dir, f)),
      )
        ? ["!src/index.ts"]
        : []),
      ...coverageExclude.map((glob) => `!${glob}`),
    ],
    coverageDirectory: reports,
    // "json" (coverage-final.json) lets scripts/coverage-gate.mjs merge unit + integration coverage per file.
    coverageReporters: ["json-summary", "json", "text-summary"],
  };
}

module.exports = { createJestConfig };
