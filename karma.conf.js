const webpackCfg = require('./webpack.config');

const CUTSOM_BROWSERS = [{
  os: 'ios',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_2_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13D15 Safari/601.1',
}, {
  os: 'android',
  userAgent: 'Mozilla/5.0 (Linux; Android 6.0.1; ASUS_Z00UD Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Mobile Safari/537.36',
}];

module.exports = function(config) {
  const browsers = ['PhantomJS'];
  const customLaunchers = {};

  CUTSOM_BROWSERS.forEach((customBrowser) => {
    const browser = `PhantomJS_${customBrowser.os}`;

    browsers.push(browser);
    customLaunchers[browser] = {
      base: 'PhantomJS',
      options: {
        settings: {
          userAgent: customBrowser.userAgent,
        },
      },
    };
  });

  config.set({
    basePath: '',
    browsers,
    customLaunchers,
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
