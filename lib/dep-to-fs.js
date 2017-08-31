const bemPath = require('@intervolga/bem-utils').bemPath;

/**
 * Build full paths to bem-deps entity implementations
 *
 * @param {Object} dep
 * @param {Array} techs
 * @param {String} level
 * @return {Array}
 */
function depToFS(dep, techs, level) {
  const result = [];

  techs.forEach((tech) => {
    const p = bemPath(dep, tech, level);
    result.push(p);
  });

  return result;
}

module.exports = depToFS;
