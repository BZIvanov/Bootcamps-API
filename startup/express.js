const path = require('path');
const express = require('express');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const globalErrorMiddleware = require('../controllers/error');

module.exports = function (app) {
  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  }
  app.use(express.json({ limit: '10kb' }));
  app.use(fileupload());
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.use(globalErrorMiddleware);
};
