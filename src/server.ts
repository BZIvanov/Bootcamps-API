import ENV from '@/config/env.config.js';
import { connectDb, disconnectDb } from '@/config/db.config.js';
import logger from '@/config/logger.config.js';
import app from '@/app.js';

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception! Shutting down...');
  process.exit(1);
});

async function startServer() {
  try {
    await connectDb();

    const PORT = ENV.PORT || 3100;
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${ENV.NODE_ENV} mode on port ${PORT}`);
    });

    process.on('unhandledRejection', (err) => {
      logger.fatal({ err }, 'Unhandled rejection! Shutting down...');
      server.close(async () => {
        await disconnectDb();
        process.exit(1);
      });
    });
  } catch (err) {
    logger.fatal({ err }, 'Failed to start server or connect to DB!');
    process.exit(1);
  }
}

startServer();
