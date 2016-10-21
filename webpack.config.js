var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = {
  entry: './src/frontend/main.tsx',

  module: {
    loaders: [
      {test: /\.tsx?$/, loader: "awesome-typescript-loader"},
      {test: /\.scss$/, loaders: ["style", "css", "sass"]}
    ]
  },

  resolve: {
    extensions: ["", ".ts", ".tsx", ".webpack.js", ".web.js", ".js"]
  },

  sassLoader: {
    includePaths: [
      path.resolve(__dirname, "./node_modules/normalize-scss/sass")
    ]
  },

  node: {
    fs: "empty" // webpacking babyparse complains otherwise
  },

  plugins: [new HtmlWebpackPlugin({
    title: "MUH WAGES"
  })]
};
