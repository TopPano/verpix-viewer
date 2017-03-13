var webpackCfg = require('./webpack.config');

module.exports = function(config) {
  config.set({
    basePath: '',
    browsers: [
      'PhantomJS',
    ],
    files: [
      'test/runner.js'
    ],
    port: 8080,
    captureTimeout: 60000,
    frameworks: [
      'mocha',
      'chai',
      'sinon',
    ],
    client: {
      mocha: {},
    },
    singleRun: true,
    reporters: [
      'mocha',
      'coverage',
    ],
    preprocessors: {
      'test/runner.js': [
        'webpack',
      ],
    },
    webpack: webpackCfg,
    webpackServer: {
      noInfo: true,
    },
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'html' },
        { type: 'text' },
      ],
    },
  });
};
