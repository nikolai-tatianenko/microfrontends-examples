const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
/**
 * Products webpack config.
 * @type {{mode: string, devServer: {port: (*|number)}, plugins: (ModuleFederationPlugin|HtmlWebpackPlugin)[]}}
 */
module.exports = {
  mode: "development",
  devServer: {
    port: process.env.PORT || 8081,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "products",
      filename: "remoteEntry.js",
      exposes: {
        "./ProductsIndex": "./src/bootstrap",
      },
      shared: ["faker"],
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};
