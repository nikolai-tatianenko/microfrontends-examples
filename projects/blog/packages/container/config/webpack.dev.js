const { merge } = require("webpack-merge");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const commonConfig = require("./webpack.common");
const packageJson = require("../package.json");

// PORT is the port number that the dev server will run on
const PORT = process.env.PORT || 8080;

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
    /**
     * Get the remoteEntry.js file from each of the remote apps.
     */
    new ModuleFederationPlugin({
      name: "container",
      remotes: {
        landingPage: "landingPage@http://localhost:8081/remoteEntry.js",
        auth: "auth@http://localhost:8082/remoteEntry.js",
        dashboard: "dashboard@http://localhost:8083/remoteEntry.js",
      },
      shared: packageJson.dependencies,
    }),
  ],
};

module.exports = merge(commonConfig, devConfig);
