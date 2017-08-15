const fs = require('fs');

/**
 * Promisified "file exist" check
 *
 * @param {String} fileName
 * @return {Promise} resolves to fileName if exist, false otherwise
 */
function fileExist(fileName) {
  return new Promise((resolve, reject) => {
    fs.stat(fileName, (err, stats) => {
      if (err === null && stats.isFile()) {
        resolve(fileName);
      } else {
        resolve(false);
      }
    });
  });
}

module.exports = fileExist;
