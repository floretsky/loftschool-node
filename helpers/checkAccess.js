const fs = require('fs').promises;

module.exports = function (path) {
  return fs
    .access(path)
    .then(() => true)
    .catch(() => false);
};