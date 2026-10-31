const path = require("node:path");
const { createConfig } = require("@blog/build-config");

module.exports = createConfig({
  name: "container",
  dir: __dirname,
  remotes: ["products", "cart"],
  react: false,
  title: "Vanilla microfrontends",
  template: path.join(__dirname, "template.html"),
});
