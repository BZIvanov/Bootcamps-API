import dotenv from 'dotenv';
import express from 'express';
import startDb from './startup/db.js';
import startApp from './startup/express.js';
import appErrorsHandler from './startup/error-handling.js';
import logger from './config/logger.js';

dotenv.config();

const app = express();

startApp(app);
startDb();

const PORT = process.env.PORT || 3100;
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
appErrorsHandler(server);
