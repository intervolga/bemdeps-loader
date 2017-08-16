const path = require('path');
const dirExist = require('./dir-exist');

/**
 * Check if dirs exist, all at once
 * @param {Array} dirs
 * @return {Promise} {dir: exist}
 */
function stupidDirsExist(dirs) {
  const check = [];
  dirs.forEach((dir) => {
    check.push(dirExist(dir));
  });

  return Promise.all(check).then((results) => {
    // Combine to single object
    return dirs.reduce(function(prev, item, i) {
      prev[item] = !!results[i];

      return prev;
    }, {});
  });
}

/**
 * Check if directories exist. Step by step. From root to leaves.
 *
 * @param {Array} dirs
 * @return {Promise} {dir: exist}
 */
function dirsExist(dirs) {
  if (0 === dirs.length) {
    return new Promise((resolve) => {
      resolve({});
    });
  }

  // Group dirs by '/' count
  const dirsByDepth = dirs.reduce(function(prev, curItem) {
    const depth = curItem.split(path.sep).length;
    (prev[depth] = prev[depth] || []).push(curItem);

    return prev;
  }, {});

  // Extract min depth dirs
  const allDepths = Object.keys(dirsByDepth).map(Number);
  const currDepth = Math.min(...allDepths);
  const currDirs = dirsByDepth[currDepth];

  // Prepare result object
  const result = dirs.reduce(function(prev, item) {
    prev[item] = null;

    return prev;
  }, {});

  // Check if min depth dirs exist
  return stupidDirsExist(currDirs).then((localResult) => {
    Object.keys(result).forEach((dir) => {
      if (null !== result[dir]) {
        return;
      }

      Object.keys(localResult).forEach((localDir) => {
        // Transfer local check result to global "as is"
        result[localDir] = localResult[localDir];

        // Additionally check if we can mark more deeper directories
        // as non-existing
        if (false === localResult[localDir] &&
          dir.slice(0, localDir.length + 1) === localDir + path.sep) {
          result[dir] = false;
        }
      });
    });

    // Extract not checked dirs
    const restDirs = dirs.filter((dir) => {
      return null === result[dir];
    });

    return dirsExist(restDirs);
  }).then((finalResult) => {
    // Transfer local check result to global "as is"
    Object.keys(finalResult).forEach((finalDir) => {
      result[finalDir] = finalResult[finalDir];
    });

    return result;
  });
}

module.exports = dirsExist;
