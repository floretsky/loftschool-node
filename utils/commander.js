const { program } = require('commander')

module.exports = program
  .version('0.0.1')
  .option('-f, --folder <type>', 'Input folder has been set', './files')
  .option('-o, --output <type>', 'Output folder has been set', './dist')
  .option('-d, --delete', 'Orifinal folder has been deleted');
