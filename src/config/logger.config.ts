import type { LoggerOptions } from 'pino';
import pino from 'pino';
import { isProd } from '@/config/env.config.js';

const baseConfig: LoggerOptions = {
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
};

const devTransport: LoggerOptions = !isProd
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
