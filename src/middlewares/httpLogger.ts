import { requireCJS } from '@/utils/cjsRequire.js';
import logger from '@/config/logger.js';

const pinoHttp = requireCJS('pino-http');

const httpLogger = pinoHttp({
  logger,
});

export default httpLogger;
