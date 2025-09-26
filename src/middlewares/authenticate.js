import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';
import catchAsync from './catch-async.js';
import User from '../models/user.js';

export default catchAsync(async (req, res, next) => {
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
        httpStatus.UNAUTHORIZED
      )
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('User not found', httpStatus.UNAUTHORIZED));
  }

  req.user = currentUser;
  next();
});
