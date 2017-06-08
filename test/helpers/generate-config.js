const path = require('path');
const bemDepsLoader = path.join(__dirname, '..', '..', 'index.js');

module.exports = (entry, stringify = null) => {
  let config = {
    entry: entry,

    output: {
      path: path.dirname(entry),
      filename: 'produced.bundle.js',
      libraryTarget: 'commonjs2',
    },

    module: {
      loaders: [],
    },

    target: 'node',
  };

  let loaderConfig = {
    test: /\.bemjson\.js$/,
    use: [
      {
        loader: bemDepsLoader,
        options: {
          levels: [
            'test/levels/blocks.base',
            'test/levels/blocks.plugins',
            'test/levels/blocks.common',
          ],
          techMap: {
            styles: ['css', 'scss'],
            scripts: ['js', 'babel.js'],
            html: ['bh.js'],
          },
        },
      },
      {
        loader: 'intervolga-bemjson-loader',
        options: {},
      },
    ],
  };
  if (null !== stringify) {
    loaderConfig.use[1].options = {stringify: stringify};
  }

  config.module.loaders.push(loaderConfig);

  return config;
};
