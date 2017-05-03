/* eslint-disable global-require */

const path = require('path');
const webpack = require('webpack');
const pkg = require('../package.json');

const isDebug = global.DEBUG === false ? false : !process.argv.includes('--release');
const isVerbose = process.argv.includes('--verbose') || process.argv.includes('-v');

// Webpack configuration
// http://webpack.github.io/docs/configuration.html
const config = {
  // The base directory for resolving the entry option
  context: __dirname,

  // The list of plugins for Webpack compiler
  plugins: [
    // Switch loaders to debug or release mode
    new webpack.LoaderOptionsPlugin({
      debug: isDebug,
    }),
  ],

  // Developer tool to enhance debugging, source maps
  // http://webpack.github.io/docs/configuration.html#devtool
  devtool: isDebug ? 'source-map' : false,

  // What information should be printed to the console
  stats: {
    colors: true,
    reasons: isDebug,
    hash: isVerbose,
    version: isVerbose,
    timings: true,
    chunks: isVerbose,
    chunkModules: isVerbose,
    cached: isVerbose,
    cachedAssets: isVerbose,
  },

  // Modules Paths resolving
  resolve: {
    alias: {
      constants: path.resolve(__dirname, '../src/constants'),
      lib: path.resolve(__dirname, '../src/lib'),
      api: path.resolve(__dirname, '../src/api'),
      external: path.resolve(__dirname, '../external'),
      config: path.resolve(__dirname, '../config'),
      test: path.resolve(__dirname, '../test'),
    },
  },
};

module.exports = config;
