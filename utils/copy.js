const fs = require('fs');
const path = require('path');
const handleError = require('../helper/handler');

module.exports = function (dist, watcher) {
  async function copyFile(file, cb) {
    const indexLetter = 0;
    const firstLetter = file.name[indexLetter].toLowerCase();
    const dir = path.join(dist, firstLetter);

    await fs.access(dir, async (err) => {
      if (err) {
        await fs.mkdir(dir, (err) => {
          if (err) {
            // folder already exists
          }
        });
      }
      await fs.copyFile(file.path, path.join(dir, file.name), (err) => {
        if (err) {
          handleError(err);
        }
        cb();
      });
    });
  }
  watcher.started();
  return async function readFolder(base) {
    watcher.startProccess(base);
    await fs.readdir(base, (err, files) => {
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
