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
    await fs
      .copyFile(file.path, path.join(dir, file.name))
      .then(() => {
        /* File created */
      })
      .catch((e) => handleError(e));
  };

  watcher.started();

  return async function readFolder(base) {
    watcher.startProccess(base);

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

    watcher.endProccess(base);
  };
};
