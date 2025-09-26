import httpStatus from 'http-status';
import AppError from '../utils/appError.js';

export default (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'User is not authorized to access this route',
          httpStatus.FORBIDDEN
        )
      );
    }

    next();
  };
