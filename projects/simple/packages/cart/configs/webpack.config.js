const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const Dotenv = require("dotenv-webpack");
/**
 * Webpack settings for cart - runtime module federation component
 * @type {{mode: string, devServer: {port: (*|number)}, plugins: (ModuleFederationPlugin|HtmlWebpackPlugin)[]}}
 */
module.exports = {
  mode: "development",
  devServer: {
    port: process.env.PORT || 8082,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "cart",
      filename: "remoteEntry.js",
      exposes: {
        "./CartShow": "./src/bootstrap",
      },
      // Shared component between products and cart
      shared: ["faker"],
    }),
    new HtmlWebpackPlugin({
      template: "public/index.html",
    }),
  ],
};
