const fileExist = require('./file-exist');

/**
 * Search for first existing file
 *
 * @param {Array} fileNames
 * @return {Promise}
 */
function firstExist(fileNames) {
  const head = fileNames.slice(0, 1);
  if (head.length === 0) {
    return new Promise((resolve, reject) => {
      resolve(false);
    });
  }

  const tail = fileNames.slice(1);
  return fileExist(head[0]).then((result) => {
    if (false === result) {
      return firstExist(tail);
    }

    return result;
  });
}

module.exports = firstExist;
