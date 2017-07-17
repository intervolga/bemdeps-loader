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
  let flatRelations = [];

  Object.keys(relations).forEach((tech) => {
    const techRelations = relations[tech];
    flatRelations = flatRelations.concat(techRelations);
  });

  let files = [];
  flatRelations.forEach((dep) => {
    files.push(bemPath(dep, 'deps.js'));
  });

  let directories = [];
  files.forEach((file) => {
    let dir = path.dirname(file);
    do {
      directories.push(dir);
      dir = path.dirname(dir);
    } while (path.dirname(dir) !== dir);
  });

  let absLevelPaths = levels.map((level) => {
    return path.resolve(level);
  });

  const result = [].concat(absLevelPaths);
  files.concat(directories).forEach((item) => {
    absLevelPaths.forEach((level) => {
      result.push(path.join(level, item));
    });
  });

  return result.filter(function(elem, pos) {
    return result.indexOf(elem) == pos; // unique values
  });
}

module.exports = depsForDeps;
