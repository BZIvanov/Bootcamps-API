const status = require('http-status');
const AppError = require('../utils/appError');

// always keep all 4 parameters for this function or it will not fire
module.exports = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (err.name === 'CastError') {
    error = new AppError('Resource not found', status.NOT_FOUND);
  }

  if (err.code === 11000) {
    error = new AppError('Duplicate field value', status.BAD_REQUEST);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new AppError(message, status.BAD_REQUEST);
  }

  res
    .status(error.statusCode || status.INTERNAL_SERVER_ERROR)
    .json({ success: false, error: error.message || 'Server error' });
};
