const fs = require('fs');

/**
 * Promisified "directory exist" check
 *
 * @param {String} dirName
 * @return {Promise} resolves to dirName if exist, false otherwise
 */
function dirExist(dirName) {
  return new Promise((resolve, reject) => {
    fs.stat(dirName, (err, stats) => {
      if (err === null && stats.isDirectory()) {
        resolve(dirName);
      } else {
        resolve(false);
      }
    });
  });
}

module.exports = dirExist;
