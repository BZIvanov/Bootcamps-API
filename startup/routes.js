const auth = require('../routes/auth');
const bootcamps = require('../routes/bootcamps');
const courses = require('../routes/courses');
const reviews = require('../routes/reviews');
const users = require('../routes/users');

module.exports = function (app) {
  app.use('/api/v1/auth', auth);
  app.use('/api/v1/bootcamps', bootcamps);
  app.use('/api/v1/courses', courses);
  app.use('/api/v1/reviews', reviews);
  app.use('/api/v1/users', users);
};
