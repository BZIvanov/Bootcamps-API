export const ENVIRONMENTS = Object.freeze({
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
});

export const NODE_ENV = (
  process.env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT
).toLowerCase();

export const isDev = NODE_ENV === ENVIRONMENTS.DEVELOPMENT;
export const isProd = NODE_ENV === ENVIRONMENTS.PRODUCTION;
export const isTest = NODE_ENV === ENVIRONMENTS.TEST;
