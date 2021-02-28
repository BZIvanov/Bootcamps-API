const log = require('../utils/log');

module.exports = function (server) {
  process.on('uncaughtException', (err) => {
    log('warning', 'Uncaught exception! Shutting down server and node...', err);

    server.close(() => process.exit(1));
  });

  process.on('unhandledRejection', (err) => {
    log(
      'warning',
      'Unhandled rejection! Shutting down server and node...',
      err
    );

    server.close(() => process.exit(1));
  });
};
