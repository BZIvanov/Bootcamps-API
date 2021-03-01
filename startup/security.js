const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

module.exports = function (app) {
  app.use(mongoSanitize());
  app.use(helmet());
  app.use(xss());
  app.use(limiter);
  app.use(hpp());
  app.use(cors());
};
