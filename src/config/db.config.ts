import mongoose from 'mongoose';
import ENV from '@/config/env.config.js';
import logger from '@/config/logger.config.js';

export async function connectDb() {
  try {
    const connection = await mongoose.connect(ENV.DB_URI);
    logger.info(`DB connected to ${connection.connection.host}`);
  } catch (err) {
    logger.fatal({ err }, 'DB connection failed!');
    throw err; // let the caller handle exit
  }
}

export async function disconnectDb() {
  try {
    await mongoose.connection.close(false);
    logger.info('MongoDB connection closed');
  } catch (err) {
    logger.error({ err }, 'Error closing MongoDB connection');
  }
}
