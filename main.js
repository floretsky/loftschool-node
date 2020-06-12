const fs = require('fs');
const path = require('path');
const Watcher = require('./watcher');
const commander = require('./utils/commander');
commander.parse(process.argv);
const del = require('del');

const copyFolder = require('./utils/copy')(
  commander.output,
  new Watcher(() => {
    console.log('Sorting is completed!');
    if (commander.delete) {
      del(commander.folder).then(() => {
        console.log('Folder is removed');
      });
    }
  })
);

if (!fs.existsSync(commander.folder)) {
  console.log(
    `Not found input folder. Start command 'node ${path.basename(
      process.argv[1]
    )} -h' for help`
  );
} else {
  if (!fs.existsSync(commander.output)) {
    fs.mkdirSync(commander.output);
  }
  copyFolder(commander.folder);
}
