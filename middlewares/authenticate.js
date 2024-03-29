const status = require('http-status');
const jwt = require('jsonwebtoken');
const catchAsync = require('./catch-async');
const AppError = require('../utils/appError');
const User = require('../models/user');

module.exports = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    [, token] = req.headers.authorization.split(' ');
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(
      new AppError(
        'You are not logged in! Please log in to get access.',
        status.UNAUTHORIZED
      )
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('User not found', status.UNAUTHORIZED));
  }

  req.user = currentUser;
  next();
});
