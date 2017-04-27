const RawSource = require('webpack-sources').RawSource;

class ConcatFilesPlugin {
  constructor(options = {}) {
    this.from = options.from;
    this.to = options.to;
  }

  apply(compiler) {
    compiler.plugin('this-compilation', (compilation) => {
      compilation.plugin('optimize-assets', (assets, callback) => {
        const fromAsset = assets[this.from];
        const toAsset = assets[this.to];

        if (!fromAsset) {
          console.warn(`The file ${this.from} does not exist`);
        } else if (!toAsset) {
          console.warn(`The file ${this.to} does not exist`);
        } else {
          // Concat the source from "fromAsset" to "toAsset"
          assets[this.to] = new RawSource(`${fromAsset.source()}${toAsset.source()}`);
          // Delete "toAsset"
          delete assets[this.from];
        }

        callback();
      });
    });
  }
}

module.exports = ConcatFilesPlugin;
