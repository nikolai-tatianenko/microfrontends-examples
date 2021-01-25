const { merge } = require("webpack-merge");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const packageJson = require("../package.json");
const commonConfig = require("./webpack.common");

const COMPONENT_NAME = process.env.COMPONENT_NAME || "DashboardApp";
const MACHINE_NAME = process.env.MACHINE_NAME || "dashboard";

const prodConfig = {
  mode: "production",
  output: {
    filename: "[name].[contenthash].js",
    publicPath: "/dashboard/latest/",
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
  ],
};

module.exports = merge(commonConfig, prodConfig);
