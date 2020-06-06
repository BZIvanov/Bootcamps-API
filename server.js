require('dotenv').config();
const express = require('express');
require('./db');
const morgan = require('morgan');
require('colors');
const bootcamps = require('./routes/bootcamps');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/bootcamps', bootcamps);

const PORT = process.env.PORT || 3100;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.cyan
      .underline.bold
  )
);

process.on('unhandledRejection', (err) => {
  console.log(
    'Unhandled rejection! Shutting down server and node...'.red.underline.bold
  );
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});
