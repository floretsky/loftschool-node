const fs = require('fs').promises;
const path = require('path');
const Watcher = require('./watcher');
const program = require('./utils/commander');
const isAccessible = require('./helpers/checkAccess');

program.parse(process.argv);
const del = require('del');

const copyFolder = require('./utils/copy')(
  program.output,
  new Watcher(() => {
    console.log('Sorting is completed!');
    if (program.delete) {
      del(program.folder).then(() => {
        console.log('Folder is removed');
      });
    }
  })
);

(async () => {
  if (await isAccessible(program.folder)) {
    if (!(await isAccessible(program.output))) {
      await fs.mkdir(program.output);
      console.log(`Folder ${program.output} is created`);
    }
    await copyFolder(program.folder);
  } else {
    console.log(
      `Input folder is not found. Start command 'node ${path.basename(
        process.argv[1]
      )} -h' for help`
    );
  }
})();
