import dotenv from 'dotenv';
import { connectDb, disconnectDb } from './config/db.js';
import app from './app.js';
import logger from './config/logger.js';

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception! Shutting down...');
  process.exit(1);
});

dotenv.config();

async function startServer() {
  try {
    await connectDb();

    const PORT = process.env.PORT || 3100;
    const server = app.listen(PORT, () => {
      logger.info(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
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
