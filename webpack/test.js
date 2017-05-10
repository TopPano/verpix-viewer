/* eslint-disable global-require */

const path = require('path');
const webpack = require('webpack');
const merge = require('lodash/merge');

const pkg = require('../package.json');
const baseConfig = require('./base');

const babelConfig = Object.assign({}, pkg.babel, {
  babelrc: false
});

// Webpack configuration
// http://webpack.github.io/docs/configuration.html
const config = {
  // Options affecting the normal modules
  module: {
    rules: [
      {
        test: /\.js?$/,
        include: [
          path.resolve(__dirname, '../test'),
        ],
        enforce: 'pre',
        loader: 'eslint-loader',
      },
      {
        test: /\.js?$/,
        include: [
          path.resolve(__dirname, '../src'),
          path.resolve(__dirname, '../test'),
          path.resolve(__dirname, '../config'),
        ],
        loader: `babel-loader?${JSON.stringify(babelConfig)}`,
      },
    ],
  },
};

module.exports = merge(baseConfig, config);
