const loaderUtils = require('loader-utils');
const nodeEval = require('node-eval');
const bemDeps = require('@bem/deps');
const resolveDeps = require('./resolve-deps');
const depsForDeps = require('./deps-for-deps');

/**
 * BemDeps loader
 *
 * @param {String|Object} source
 */
function bemDepsLoader(source) {
  const callback = this.async();
  const options = {
    stringify: true,
    levels: [],
    techMap: {},
  };
  Object.assign(options, loaderUtils.getOptions(this));

  const result = typeof source === 'string'
    ? nodeEval(source)
    : source;

  if (!('bemjson' in result) || !('bemdecl' in result)) {
    callback(new Error('Wrong argument supplied'));
    return;
  }

  const self = this;
  bemDeps.load({levels: options.levels}).then((relations) => {
    return resolveDeps(result.bemdecl, relations, options.techMap);
  }).then((relations) => {
    result.bemdeps = relations;

    depsForDeps(relations, options.levels).forEach((fileName) => {
      self.addDependency(fileName);
    });

    if (options.stringify) {
      callback(null, 'module.exports = ' + JSON.stringify(result) + ';');
    } else {
      callback(null, result);
    }
  }).catch(callback);
}

module.exports = bemDepsLoader;
