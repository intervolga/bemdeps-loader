const path = require('path');
const BemCell = require('@bem/cell');
const BemEntityName = require('@bem/entity-name');
const bemFS = require('@bem/fs-scheme')('nested');

/**
 * Transforms BemDeps to list of dependent files and directories
 *
 * @param {Array} relations
 * @param {Array} levels
 * @return {Array}
 */
function depsForDeps(relations, levels) {
  let flatRelations = [];
  Object.values(relations).forEach((techRelations) => {
    flatRelations = flatRelations.concat(techRelations);
  });

  let files = [];
  flatRelations.forEach((dep) => {
    const entity = new BemEntityName(dep);
    const cell = new BemCell({
      entity: entity,
      tech: 'deps.js',
    });
    files.push(bemFS.path(cell, {naming: 'origin'}));
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
