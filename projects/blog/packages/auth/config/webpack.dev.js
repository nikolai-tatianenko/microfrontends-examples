const { merge } = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const commonConfig = require("./webpack.common");
const packageJson = require("../package.json");

const PORT = process.env.PORT || 8082;
const COMPONENT_NAME = process.env.COMPONENT_NAME || "AuthApp";
const MACHINE_NAME = process.env.MACHINE_NAME || "auth";

const devConfig = {
  mode: "development",
  output: {
    publicPath: `http://localhost:${PORT}/`,
  },
  devServer: {
    port: PORT,
    historyApiFallback: {
      index: "index.html",
    },
  },
  plugins: [
    new ModuleFederationPlugin({
      name: MACHINE_NAME,
      filename: "remoteEntry.js",
      exposes: {
        [`./${COMPONENT_NAME}`]: "./src/bootstrap",
      },
      shared: packageJson.dependencies,
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};

module.exports = merge(commonConfig, devConfig);
