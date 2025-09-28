import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/httpError.js';
import User from '../models/user.js';

const { jwtVerify } = jwt;

export default async (req, res, next) => {
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
      new HttpError(
        httpStatus.UNAUTHORIZED,
        'You are not logged in! Please log in to get access.'
      )
    );
  }

  const decoded = await jwtVerify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new HttpError(httpStatus.UNAUTHORIZED, 'User not found'));
  }

  req.user = currentUser;
  next();
};
