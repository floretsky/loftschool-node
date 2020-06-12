const fs = require('fs');
const path = require('path');
const Watcher = require('./watcher');
const program = require('./utils/commander');
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
  await fs.access(program.folder, fs.constants.R_OK, async (error) => {
    // не уверен, что нужна асинхронная проверка существования пути ?
    // и нужны ли тут .then и .catch, если обработка ошибок происходит по сути внутри коллбэка?
    if (error) {
      console.log(
        `Input folder is not found. Start command 'node ${path.basename(
          process.argv[1]
        )} -h' for help`
      );
    } else {
      await fs.access(program.output, async (error) => {
        if (error) {
          await fs.mkdir(program.output, (error) => {
            if (error) {
              console.log(`Can't create folder ${program.output}`);
              return;
            } else {
              console.log(`New folder ${program.output} created!`);
            }
          });
        }
        copyFolder(program.folder);
      });
    }
  });
})();
