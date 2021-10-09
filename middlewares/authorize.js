const status = require('http-status');
const AppError = require('../utils/appError');

module.exports =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'User is not authorized to access this route',
          status.FORBIDDEN
        )
      );
    }

    next();
  };
