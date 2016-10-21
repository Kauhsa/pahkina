module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    files: [
      {pattern: 'src/**/*.spec.ts', watched: false}
    ],

    preprocessors: {
      'src/**/*.spec.ts': ['webpack']
    },

    webpack: {
      module: {
        loaders: [
          {test: /\.tsx?$/, loader: "awesome-typescript-loader"}
        ]
      },

      resolve: {
        extensions: ["", ".ts", ".webpack.js", ".web.js", ".js"]
      },

      node: {
        fs: "empty" // webpacking babyparse complains otherwise
      }
    },

    webpackMiddleware: {
      stats: 'errors-only'
    },

    reporters: ["progress"],

    browsers: ["PhantomJS"]
  });
};
