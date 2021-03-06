require('dotenv').config();
require('colors');
const express = require('express');
const log = require('./utils/log');

const app = express();

require('./startup/db');
require('./startup/express')(app);

const PORT = process.env.PORT || 3100;
const server = app.listen(PORT, () =>
  log('info', `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
require('./startup/error-handling')(server);
