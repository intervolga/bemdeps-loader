const path = require('path');
const bemPath = require('./bem-path');

/**
 * Convert BemDeps to directory names
 *
 * @param {Array} bemdeps
 * @return {Array}
 */
function bemDirs(bemdeps) {
  const dirFilter = {};
  bemdeps.forEach((dep) => {
    const depPath = bemPath(dep);
    const depDir = path.dirname(depPath);
    dirFilter[depDir] = true;
  });

  return Object.keys(dirFilter);
}

module.exports = bemDirs;
