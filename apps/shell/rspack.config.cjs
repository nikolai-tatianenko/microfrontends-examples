const { createConfig } = require("@blog/build-config");

module.exports = createConfig({
  name: "shell",
  dir: __dirname,
  remotes: ["marketing", "auth", "dashboard", "landing"],
  title: "Blog",
});
