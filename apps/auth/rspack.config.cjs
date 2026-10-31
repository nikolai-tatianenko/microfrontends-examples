const { createConfig } = require("@blog/build-config");

module.exports = createConfig({
  name: "auth",
  dir: __dirname,
  exposes: { "./mount": "./src/mount" },
  title: "Auth remote",
});
