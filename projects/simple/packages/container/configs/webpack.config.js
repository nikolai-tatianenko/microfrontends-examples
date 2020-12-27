const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const Dotenv = require("dotenv-webpack");

module.exports = (env) => {
  console.log("(process.env:", process.env.PORT);

  return {
    mode: "development",
    devServer: {
      port: process.env.PORT || 3005,
      open: true,
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
      // To use .env file
      new Dotenv({ path: `./.env` }),
      // To use Module Federation Plugin
      new ModuleFederationPlugin({
        name: "container",
        remotes: {
          products: "products@http://localhost:8081/remoteEntry.js",
          cart: "cart@http://localhost:8082/remoteEntry.js",
        },
      }),
      new HtmlWebpackPlugin({
        template: "./public/index.html",
      }),
    ],
  };
};
