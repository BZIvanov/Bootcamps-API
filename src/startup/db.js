import mongoose from 'mongoose';
import logger from '../config/logger.js';

export default function startDb() {
  mongoose.connect(process.env.DB_URI).then((connection) => {
    logger.info(
      `DB connection successful and ready for ${connection.connections[0].host}`
    );
  });
  // don't catch errors here, so the error-handling can catch the error and also shut down the server in case of unhandledRejection
}
