import type { IncomingMessage, ServerResponse } from 'http';
import type { Options as PinoHttpOptions } from 'pino-http';
import { requireCJS } from '@/utils/cjsRequire.util.js';
import logger from '@/config/logger.config.js';

const pinoHttp = requireCJS('pino-http');

// Define serializers to reduce noisy output
const serializers: PinoHttpOptions['serializers'] = {
  req: (req: IncomingMessage) => {
    return {
      method: req.method,
      url: req.url,
    };
  },
  res: (res: ServerResponse) => {
    return {
      statusCode: res.statusCode,
    };
  },
  err: (err: Error) => {
    return {
      type: err.name,
      message: err.message,
      stack: err.stack,
    };
  },
};

const httpLogger = pinoHttp({
  logger,
  serializers,
});

export default httpLogger;
