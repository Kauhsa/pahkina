const webpackConfig = require('./webpack.config.js');

module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    files: [
      {pattern: 'src/**/*.spec.ts', watched: false}
    ],

    preprocessors: {
      'src/**/*.spec.ts': ['webpack']
    },

    webpack: Object.assign(webpackConfig, {entry: ''}),

    webpackMiddleware: {
      stats: 'errors-only'
    },

    reporters: ["progress"],

    browsers: ["PhantomJS"]
  });
};
