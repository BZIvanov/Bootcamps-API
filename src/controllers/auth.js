import crypto from 'crypto';
import httpStatus from 'http-status';
import User from '../models/user.js';
import sendEmail from '../providers/mailer.js';
import AppError from '../utils/appError.js';
import { isProd } from '../config/env.js';

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    httpOnly: true,
    secure: isProd,
  };

  res
    .header('Authorization', `Bearer ${token}`)
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true });
};

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({ name, email, password, role });

  sendTokenResponse(user, httpStatus.CREATED, res);
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError('Please provide email and password', httpStatus.BAD_REQUEST)
    );
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('Invalid credentials', httpStatus.UNAUTHORIZED));
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new AppError('Invalid credentials', httpStatus.UNAUTHORIZED));
  }

  sendTokenResponse(user, httpStatus.OK, res);
};

export const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
    secure: isProd,
  });

  res.status(httpStatus.OK).json({ success: true });
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(httpStatus.OK).json({ success: true, data: user });
};

export const updateDetails = async (req, res) => {
  const { name, email } = req.body;

  const fields = {
    ...(name && { name }),
    ...(email && { email }),
  };

  const user = await User.findByIdAndUpdate(req.user.id, fields, {
    new: true,
    runValidators: true,
  });

  res.status(httpStatus.OK).json({ success: true, data: user });
};

export const updatePassword = async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(
      new AppError(
        'Both current and new passwords are required',
        httpStatus.BAD_REQUEST
      )
    );
  }

  if (!(await user.matchPassword(currentPassword))) {
    return next(new AppError('Incorrect password', httpStatus.UNAUTHORIZED));
  }

  user.password = newPassword;
  await user.save();
  sendTokenResponse(user, httpStatus.OK, res);
};

export const forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError('There is no user with that e-mail', httpStatus.NOT_FOUND)
    );
  }

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/reset-password/${resetToken}`;

  const text = `Here is your password reset URL:\n\n${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      text,
    });
  } catch (err) {
    req.log.error({ err }, 'Error sending forgot password email');
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('Email was not sent!', httpStatus.INTERNAL_SERVER_ERROR)
    );
  }

  res.status(httpStatus.OK).json({ success: true });
};

export const resetPassword = async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid token', httpStatus.BAD_REQUEST));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, httpStatus.OK, res);
};
