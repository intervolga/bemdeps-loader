const loaderUtils = require('loader-utils');
const nodeEval = require('node-eval');
const resolveFS = require('./lib/resolve-fs');

/**
 * BemDeps loader
 *
 * @param {String} source
 */
function bemDepsLoader(source) {
  const callback = this.async();
  const options = {
    levels: [],
    techMap: {},
  };
  Object.assign(options, loaderUtils.getOptions(this));

  const bemDeps = nodeEval(source);

  const self = this;
  resolveFS(bemDeps, options.techMap, options.levels).then((result) => {
    result.dependecies.forEach((dirName) => {
      self.addContextDependency(dirName);
    });

    callback(null, 'module.exports = ' + JSON.stringify(result.found) + ';');
  }).catch(callback);
}

module.exports = bemDepsLoader;
