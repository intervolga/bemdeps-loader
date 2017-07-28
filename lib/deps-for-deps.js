const path = require('path');
const bemPath = require('./bem-path');

/**
 * Transforms BemDeps to list of dependent files and directories
 *
 * @param {Array} relations
 * @param {Array} levels
 * @return {Array}
 */
function depsForDeps(relations, levels) {
  const flatRelations = {};
  Object.keys(relations).forEach((tech) => {
    relations[tech].forEach((relation) => {
      const key = JSON.stringify(relation);
      flatRelations[key] = relation;
    });
  });

  let files = [];
  Object.keys(flatRelations).forEach((key) => {
    const dep = flatRelations[key];
    files.push(bemPath(dep, 'deps.js'));
  });
  files = files.filter(function(elem, pos) {
    return files.indexOf(elem) == pos;
  });

  let directories = [];
  files.forEach((file) => {
    let dir = path.dirname(file);
    do {
      directories.push(dir);
      dir = path.dirname(dir);
    } while (path.dirname(dir) !== dir);
  });
  directories = directories.filter(function(elem, pos) {
    return directories.indexOf(elem) == pos;
  });

  let absLevelPaths = levels.filter(function(elem, pos) {
    return levels.indexOf(elem) == pos;
  }).map((level) => {
    return path.resolve(level);
  });

  const result = [].concat(absLevelPaths);
  files.concat(directories).forEach((item) => {
    absLevelPaths.forEach((level) => {
      result.push(path.join(level, item));
    });
  });

  return result;
}

module.exports = depsForDeps;
