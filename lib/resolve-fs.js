const path = require('path');
const depToFS = require('./dep-to-fs');
const firstExist = require('@intervolga/bem-utils').firstExist;
const dirsExist = require('@intervolga/bem-utils').dirsExist;
const bemDirs = require('@intervolga/bem-utils').bemDirs;

/**
 *
 * @param {Array} bemdeps
 * @param {Object} techMap
 * @param {Array} levels
 * @return {Promise}
 */
function resolveFS(bemdeps, techMap, levels) {
  // Get directories from BemDeps
  const dirs = bemDirs(bemdeps);

  // Get all (with sub-) directories
  let allDirs = {};
  dirs.forEach((targetDir) => {
    allDirs[targetDir] = true;

    let subDir = path.dirname(targetDir);
    do {
      allDirs[subDir] = true;
      subDir = path.dirname(subDir);
    } while (path.dirname(subDir) !== subDir);
  });
  allDirs = Object.keys(allDirs);

  // Join dirs with levels
  const paths = levels.slice();
  levels.forEach((level) => {
    allDirs.forEach((dir) => {
      paths.push(path.join(level, dir));
    });
  });

  let dependecies;

  // Search for existing directories
  return dirsExist(paths).then((result) => {
    return Object.keys(result).filter((dir) => {
      return true === result[dir];
    });
  }).then((existingDirs)=> {
    const implementations = [];
    dependecies = existingDirs;

    levels.forEach((level) => {
      bemdeps.forEach((dep) => {
        // Don't generate implementations for non-existing paths
        const dir = path.join(level, bemDirs([dep])[0]);
        if (0 > existingDirs.indexOf(dir)) {
          return;
        }

        // Search for prioritized implementations
        Object.keys(techMap).forEach((techs) => {
          const candidates = depToFS(dep, techMap[techs], level);

          const firstOf = firstExist(candidates).then((first) => {
            return first;
          });

          implementations.push(firstOf);
        });
      });
    });

    return Promise.all(implementations);
  }).then((results) => {
    return {
      'found': results.filter((r) => {
        return !!r;
      }),
      'dependecies': dependecies,
    };
  });
}

module.exports = resolveFS;
