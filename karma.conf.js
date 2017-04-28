const merge = require('lodash/merge');
const webpack = require('webpack');

const webpackCfg = require('./webpack.config');

const useIframe = process.argv.includes('--iframe');
const completed = process.argv.includes('--completed');

module.exports = function(config) {
  const customLaunchers = !completed ? {} : {
    // Chrome on Windows
    'SL_Chrome': {
      base: 'SauceLabs',
      browserName: 'chrome',
      version: '49.0',
      platform: 'Windows 10',
    },
  };
  const browsers =
    !completed ? ['SlimerJS'] : Object.keys(customLaunchers);

  config.set({
    basePath: '',
    browsers,
    customLaunchers,
    files: [
      'test/runner.js',
      // Use bluebird as Promise polyfill
      'node_modules/bluebird/js/browser/bluebird.js',
      // Dom 4 polyfill
      'node_modules/dom4/build/dom4.js',
    ],
    port: 8080,
    captureTimeout: 120000,
    frameworks: [
      'mocha',
      'chai-dom',
      'chai',
      'sinon-chai',
      'sinon',
    ],
    client: {
      useIframe,
      mocha: {},
      chai: {
        includeStack: true,
      },
    },
    singleRun: true,
    reporters: !completed ? [
      'mocha',
      'coverage',
    ] : [
      'mocha',
      'saucelabs',
    ],
    preprocessors: {
      'test/runner.js': [
        'webpack',
      ],
    },
    concurrency: 5,
    webpack: merge(webpackCfg, {
      plugins: [
        new webpack.DefinePlugin({
          "process.env": {
            SLIMER: !completed ? JSON.stringify(true) : JSON.stringify(false)
          }
        }),
      ],
    }),
    webpackServer: {
      noInfo: true,
    },
    sauceLabs: !completed ? {} : {
      testName: 'Verpix Viewer Testing',
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
