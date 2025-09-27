import httpStatus from 'http-status';
import AppError from '../utils/appError.js';

// always keep all 4 parameters for this function or it will not fire
export default (err, req, res, next) => {
  let error = { ...err, message: err.message, statusCode: err.statusCode };

  if (err.name === 'CastError') {
    error = new AppError('Resource not found', httpStatus.NOT_FOUND);
  }

  if (err.code === 11000) {
    error = new AppError('Duplicate field value', httpStatus.BAD_REQUEST);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new AppError(message, httpStatus.BAD_REQUEST);
  }

  res
    .status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR)
    .json({ success: false, error: error.message || 'Server error' });
};
