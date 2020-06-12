const fs = require('fs');
const path = require('path');
const handleError = require('../helper/handler');

module.exports = function (dist, watcher) {
  function copyFile(file, cb) {
    const indexLetter = 0;
    const firstLetter = file.name[indexLetter].toLowerCase();
    const dir = path.join(dist, firstLetter);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    fs.copyFile(file.path, path.join(dir, file.name), (err) => {
      if (err) {
        handleError(err);
      }
      cb();
    });
  }
  watcher.started();
  return function readFolder(base) {
    watcher.startProccess(base);
    fs.readdir(base, (err, files) => {
      if (err) {
        handleError(err);
      }
      for (const item of files) {
        const localBase = path.join(base, item);
        const state = fs.statSync(localBase);
        if (state.isDirectory()) {
          readFolder(localBase);
        } else {
          watcher.startProccess(localBase);
          copyFile({ name: item, path: localBase }, () => {
            watcher.endProccess(localBase);
          });
        }
      }
      watcher.endProccess(base);
    });
  };
};
