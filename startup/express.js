const path = require('path');
const express = require('express');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const auth = require('../routes/auth');
const bootcamps = require('../routes/bootcamps');
const courses = require('../routes/courses');
const reviews = require('../routes/reviews');
const users = require('../routes/users');
const globalError = require('../middlewares/global-error');

module.exports = function (app) {
  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  }

  app.use(express.json({ limit: '10kb' }));
  app.use(fileupload());
  app.use(cookieParser());

  app.use('/api/v1/auth', auth);
  app.use('/api/v1/bootcamps', bootcamps);
  app.use('/api/v1/courses', courses);
  app.use('/api/v1/reviews', reviews);
  app.use('/api/v1/users', users);
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.use(globalError);
};
