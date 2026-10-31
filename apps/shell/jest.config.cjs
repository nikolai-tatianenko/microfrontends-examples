// Production wiring (federated imports, real storage and Apollo) cannot run under Jest; E2E covers it.
module.exports = require("@blog/build-config/jest-preset").createJestConfig(
  __dirname,
  {
    coverageExclude: ["src/remotes/registry.ts", "src/services.ts"],
  },
);
