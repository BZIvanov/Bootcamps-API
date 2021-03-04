const AppError = require('../utils/appError');

module.exports = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`User is not authorized to access this route`, 403)
      );
    }

    next();
  };
};
