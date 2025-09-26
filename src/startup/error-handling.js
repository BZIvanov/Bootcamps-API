import log from '../utils/log.js';

export default function appErrorsHandler(server) {
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
}
