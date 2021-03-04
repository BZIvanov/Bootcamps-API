const AppError = require('../utils/appError');

module.exports = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = new AppError(message, 404);
  }

  if (err.code === 11000) {
    const message = 'Duplicate field value';
    error = new AppError(message, 400);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new AppError(message, 400);
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || 'Server error' });
};
