/* eslint-disable global-require */

const path = require('path');
const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const JavaScriptObfuscator = require('webpack-obfuscator');
const ConcatFilesPlugin = require('./ConcatFilesPlugin');
const mergeWith = require('lodash/mergeWith');
const isArray = require('lodash/isArray');

const pkg = require('../package.json');
const baseConfig = require('./base');

const isDebug = global.DEBUG === false ? false : !process.argv.includes('--release');
const isVerbose = process.argv.includes('--verbose') || process.argv.includes('-v');
const useHMR = !!global.HMR; // Hot Module Replacement (HMR)
const babelConfig = Object.assign({}, pkg.babel, {
  babelrc: false,
  cacheDirectory: useHMR,
});

// Webpack configuration (main.js => public/dist/main.{hash}.js)
// http://webpack.github.io/docs/configuration.html
const config = {
  // The entry point for the bundle
  entry: {
    'sdk': '../src/main.js',
    'sdk-livephoto': ['../src/livephoto.js'],
    'sdk-panophoto': ['../src/panophoto.js'],
    demo: '../demo/main.js'
  },

  // Options affecting the output of the compilation
  output: {
    path: path.resolve(__dirname, '../public/dist'),
    publicPath: isDebug ? '/dist/' : '',
    filename: isDebug ? '[name].js?[hash]' : '[name].js',
    chunkFilename: isDebug ? '[id].js?[chunkhash]' : '[id].[chunkhash].js',
    sourcePrefix: '  ',
  },

  // The list of plugins for Webpack compiler
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV':
        process.env.NODE_ENV === 'production' ?
        '"production"' :
        '"development"',
      __DEV__: isDebug,
    }),
    // Emit a JSON file with assets paths
    // https://github.com/sporto/assets-webpack-plugin#options
    new AssetsPlugin({
      path: path.resolve(__dirname, '../public/dist'),
      filename: 'assets.json',
      prettyPrint: true,
    }),
  ],

  // Options affecting the normal modules
  module: {
    rules: [
      {
        test: /\.js?$/,
        include: [
          path.resolve(__dirname, '../src'),
          path.resolve(__dirname, '../demo')
        ],
        enforce: 'pre',
        loader: 'eslint-loader',
      },
      {
        test: /\.js?$/,
        include: [
          path.resolve(__dirname, '../src'),
          path.resolve(__dirname, '../demo'),
          path.resolve(__dirname, '../config')
        ],
        loader: `babel-loader?${JSON.stringify(babelConfig)}`,
      },
      {
        test: /\.css/,
        loaders: [
          'style-loader',
          `css-loader?${JSON.stringify({
            sourceMap: isDebug,
            // CSS Modules https://github.com/css-modules/css-modules
            modules: true,
            localIdentName: isDebug ? '[name]_[local]_[hash:base64:3]' : '[hash:base64:4]',
            // CSS Nano http://cssnano.co/options/
            minimize: !isDebug,
          })}`,
          'postcss-loader',
        ],
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.md$/,
        loader: path.resolve(__dirname, './utils/markdown-loader.js'),
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
        loader: 'url-loader?limit=10000',
      },
      {
        test: /\.(eot|ttf|wav|mp3)$/,
        loader: 'file-loader',
      },
    ],
  },
};

// Optimize the bundle in release (production) mode
if (!isDebug) {
  const extractVendorPlugins = (chunkNames) => chunkNames.map((chunkName) => (
    new webpack.optimize.CommonsChunkPlugin({
      name: `${chunkName}-vendor`,
      chunks: [chunkName],
      minChunks: ({ resource }) => (
        resource &&
        (resource.indexOf('node_modules') >= 0 || resource.indexOf('external') >= 0) &&
        resource.match(/\.js$/)
      ),
    })
  ));

  const concatVendorPlugins = (chunkNames) => chunkNames.map((chunkName) => (
    new ConcatFilesPlugin({
      from: `${chunkName}-vendor.js`,
      to: `${chunkName}.js`,
    })
  ));

  // Get all output bundle names.
  // For example, if our entry is: {
  //   'sdk': '../src/main',
  //   'sdk-panophoto: '../src/api/panophoto',
  // }, then the outpus will be:
  // [ 'sdk', 'sdk-panophoto' ]
  const outputs = Object.keys(config.entry);

  // Optimize bundles
  config.plugins.push(new webpack.optimize.DedupePlugin());
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({ compress: { warnings: isVerbose } }));
  config.plugins.push(new webpack.optimize.AggressiveMergingPlugin());

  // Extract the vendor parts (dependecies in node_modules) from bundles.
  // For example, if we have bundles "sdk" and "sdk-panophoto", the plugins will extract the vendor
  // parts from them, and store in others bundles named "sdk-vendor" and "sdk-panophoto-vendor".
  config.plugins = config.plugins.concat(extractVendorPlugins(outputs));

  // Add plugin to obfuscate JS code.
  // 1. We only obfuscate the code in our project, i.e., we don't obfuscate the vendor code.
  // 2. According the following FAQ link, it should be added after UglifyJSPlugin to prevent the code
  // from breaking.
  // https://javascriptobfuscator.herokuapp.com/#FAQ
  // 3. The options are used for low obfuscation and high performance code.
  // The combination is recommended from the author of javascript-obfuscator:
  // https://github.com/javascript-obfuscator/javascript-obfuscator#low-obfuscation-high-performance
  config.plugins.push(new JavaScriptObfuscator({
    // Low obfuscation, high performance
    sourceMap: false,
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: false,
    debugProtectionInterval: false,
    disableConsoleOutput: true,
    mangle: true,
    rotateStringArray: true,
    selfDefending: true,
    stringArray: true,
    stringArrayEncoding: false,
    stringArrayThreshold: 0.75,
    unicodeEscapeSequence: false,
  }, ['**-vendor.js']));

  // Concatenate the vendor parts to bundles that belong to them.
  // For exmaple, "sdk-vendor" will be concatenated to "sdk" and "sdk-panophoto-vendor" will be
  // concatenated to "sdk-panophoto".
  config.plugins = config.plugins.concat(concatVendorPlugins(outputs));

  // Compress output js files by gzip
  config.plugins.push(new CompressionPlugin({
    asset: "[path]",
    algorithm: "gzip",
    test: /\.js$/,
    deleteOriginalAssets: true,
  }));
}

// Hot Module Replacement (HMR)
if (isDebug && useHMR) {
  config.entry.hmr = 'webpack-hot-middleware/client';
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  config.plugins.push(new webpack.NoErrorsPlugin());
}

module.exports = mergeWith(baseConfig, config, (objValue, srcValue) => {
  if (isArray(objValue)) {
    return objValue.concat(srcValue);
  }
});
