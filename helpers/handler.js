const ExitCode = {
  success: 0,
  error: 1,
};

module.exports = function (err) {
  console.log(err);
  process.exit(ExitCode.error);
};