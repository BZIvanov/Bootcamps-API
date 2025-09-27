import pinoHttp from 'pino-http';
import logger from '../config/logger.js';

const httpLogger = pinoHttp({
  logger,
});

export default httpLogger;
