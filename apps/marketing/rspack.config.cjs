const { createConfig } = require("@blog/build-config");

module.exports = createConfig({
  name: "marketing",
  dir: __dirname,
  exposes: { "./mount": "./src/mount" },
  title: "Marketing remote",
});
