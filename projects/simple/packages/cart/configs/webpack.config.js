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
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
        },
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "cart",
      filename: "remoteEntry.js",
      exposes: {
        "./CartApp": "./src/bootstrap",
      },
      // Shared component between products and cart
      shared: ["faker"],
    }),
    new HtmlWebpackPlugin({
      template: "public/index.html",
    }),
  ],
};
