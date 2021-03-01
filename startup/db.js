const mongoose = require('mongoose');
const log = require('../utils/log');

mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((connection) => {
    log(
      'info',
      `DB connection successful and ready for ${connection.connections[0].host}`
    );
  });
// don't catch errors here, so the error-handling can catch the error and also shut down the server in case of unhandledRejection
