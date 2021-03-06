const path = require('path');
const express = require('express');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const xss = require('xss-clean');
const auth = require('../routes/auth');
const bootcamps = require('../routes/bootcamps');
const courses = require('../routes/courses');
const reviews = require('../routes/reviews');
const users = require('../routes/users');
const globalError = require('../middlewares/global-error');

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

module.exports = function (app) {
  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  }

  app.use(express.json({ limit: '10kb' }));
  app.use(fileupload());
  app.use(cookieParser());

  // mongo-sanitize, xss-clean and hpp must be included after the json parse middleware
  app.use(mongoSanitize());
  app.use(xss());
  app.use(hpp());
  app.use(helmet());
  app.use(limiter);
  app.use(cors());

  app.use('/api/v1/auth', auth);
  app.use('/api/v1/bootcamps', bootcamps);
  app.use('/api/v1/courses', courses);
  app.use('/api/v1/reviews', reviews);
  app.use('/api/v1/users', users);
  app.use(express.static(path.join(__dirname, '..', 'public')));
  // globalError has to be the last route
  app.use(globalError);
};
