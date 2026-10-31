const { createConfig } = require("@blog/build-config");

module.exports = createConfig({
  name: "dashboard",
  dir: __dirname,
  exposes: { "./mount": "./src/mount" },
  vue: true,
  react: false,
  title: "Dashboard remote",
});
