const path = require('path');
const depToFS = require('./dep-to-fs');
const firstExist = require('./first-exist');
const dirsExist = require('./dirs-exist');
const bemDirs = require('../lib/bem-dirs');

/**
 * Generate list of non-existing directories in BEM FS
 *
 * @param {Array} bemdeps
 * @param {Array} levels
 * @return {Promise}
 */
function dirsToSkip(bemdeps, levels) {
  // Get dirs from BemDeps
  const dirs = bemDirs(bemdeps); // TODO: all subdirs

  // Join dirs with levels
  const paths = levels.slice();
  levels.forEach((level) => {
    dirs.forEach((dir) => {
      paths.push(path.join(level, dir));
    });
  });

  return dirsExist(paths).then((result) => {
    const skip = [];
    Object.keys(result).forEach((dir) => {
      if (false === result[dir]) {
        skip.push(dir);
      }
    });

    return skip;
  });
}

/**
 *
 * @param {Array} bemdeps
 * @param {Object} techMap
 * @param {Array} levels
 * @return {Promise}
 */
function resolveFS(bemdeps, techMap, levels) {
  let checked = [];
  let skipped;

  return dirsToSkip(bemdeps, levels).then((skip) => {
    skipped = skip;
    const implementations = [];

    levels.forEach((level) => {
      bemdeps.forEach((dep) => {
        // Don't generate implementations for non-existing paths
        const dir = path.join(level, bemDirs([dep])[0]);
        if (-1 !== skip.indexOf(dir)) {
          return;
        }

        // Search for prioritized implementations
        Object.keys(techMap).forEach((techs) => {
          const candidates = depToFS(dep, techMap[techs], level);

          const firstOf = firstExist(candidates).then((first) => {
            if (first) {
              const firstPos = candidates.indexOf(first);
              const head = candidates.slice(0, firstPos);
              checked = checked.concat(head);
            } else {
              checked = checked.concat(candidates);
            }

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
      'checked': checked,
      'skipped': skipped,
    };
  });
}

module.exports = resolveFS;
