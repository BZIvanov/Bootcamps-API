import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import startDb from './startup/db.js';
import configureApp from './startup/express.js';
import logger from './config/logger.js';

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception! Shutting down...');
  process.exit(1);
});

dotenv.config();

const app = express();

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

configureApp(app);

async function startServer() {
  try {
    await startDb();

    const PORT = process.env.PORT || 3100;
    const server = app.listen(PORT, () => {
      logger.info(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
    });

    process.on('unhandledRejection', (err) => {
      logger.fatal({ err }, 'Unhandled rejection! Shutting down...');
      server.close(async () => {
        await mongoose.connection.close(false);
        process.exit(1);
      });
    });
  } catch (err) {
    logger.fatal({ err }, 'Failed to start server or connect to DB!');
    process.exit(1);
  }
}

startServer();
