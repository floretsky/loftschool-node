const fs = require('fs').promises;
const path = require('path');
const handleError = require('../helpers/handler');
const isAccessible = require('../helpers/checkAccess');

module.exports = function (dist, watcher) {
  const copyFile = async (file) => {
    const indexLetter = 0;
    const firstLetter = file.name[indexLetter].toLowerCase();
    const dir = path.join(dist, firstLetter);
    if (!(await isAccessible(dir))) {
      await fs.mkdir(dir);
      /* Folder is created */
    }
    try {
      await fs.copyFile(file.path, path.join(dir, file.name));
    } catch (e) {
      handleError(e);
    }
  };

  watcher.started();

  return async function readFolder(base) {
    watcher.startProccess(base);

    try {
      const files = await fs.readdir(base);
      for (const item of files) {
        const localBase = path.join(base, item);
        const state = await fs.stat(localBase);
        if (state.isDirectory()) {
          await readFolder(localBase);
        } else {
          watcher.startProccess(localBase);
          await copyFile({ name: item, path: localBase });
          watcher.endProccess(localBase);
        }
      }
    } catch (e) {
      handleError(e);
    }

    watcher.endProccess(base);
  };
};
