import logger from '../config/logger.js';

export default function appErrorsHandler(server) {
  process.on('uncaughtException', (err) => {
    logger.fatal(
      { err },
      'Uncaught exception! Shutting down server and node...'
    );

    server.close(() => process.exit(1));
  });

  process.on('unhandledRejection', (err) => {
    logger.fatal(
      { err },
      'Unhandled rejection! Shutting down server and node...'
    );

    server.close(() => process.exit(1));
  });
}
