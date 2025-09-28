import httpStatus from 'http-status';
import { HttpError } from '../utils/httpError.js';

// always keep all 4 parameters for this function or it will not fire
export default (err, req, res, next) => {
  let error = { ...err, message: err.message, statusCode: err.statusCode };

  if (err.name === 'CastError') {
    error = new HttpError(httpStatus.NOT_FOUND, 'Resource not found');
  }

  if (err.code === 11000) {
    error = new HttpError(httpStatus.BAD_REQUEST, 'Duplicate field value');
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new HttpError(httpStatus.BAD_REQUEST, message);
  }

  res
    .status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR)
    .json({ success: false, error: error.message || 'Server error' });
};
