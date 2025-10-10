import type { LoggerOptions } from 'pino';
import pino from 'pino';
import ENV from '@/config/env.config.js';

const baseConfig: LoggerOptions = {
  level: ENV.LOG_LEVEL || (ENV.isProd ? 'info' : 'debug'),
};

const devTransport: LoggerOptions = !ENV.isProd
  ? {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    }
  : {};

const logger = pino({
  ...baseConfig,
  ...devTransport,
});

export default logger;
