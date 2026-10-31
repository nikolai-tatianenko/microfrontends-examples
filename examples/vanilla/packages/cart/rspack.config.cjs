const { createConfig } = require("@blog/build-config");

module.exports = createConfig({
  name: "cart",
  dir: __dirname,
  exposes: { "./mount": "./src/mount" },
  react: false,
  title: "Cart remote",
});
