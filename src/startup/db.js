import mongoose from 'mongoose';
import logger from '../config/logger.js';

export default async function startDb() {
  try {
    const connection = await mongoose.connect(process.env.DB_URI);
    logger.info(`DB connected to ${connection.connection.host}`);
  } catch (err) {
    logger.fatal({ err }, 'DB connection failed!');
    throw err; // let the caller handle exit
  }
}
