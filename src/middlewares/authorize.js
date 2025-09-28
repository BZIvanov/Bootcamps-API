import httpStatus from 'http-status';
import { HttpError } from '../utils/httpError.js';

export default (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new HttpError(
          httpStatus.FORBIDDEN,
          'User is not authorized to access this route'
        )
      );
    }

    next();
  };
