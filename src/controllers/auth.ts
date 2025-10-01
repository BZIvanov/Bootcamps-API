import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import User, { IUser } from '@/models/user.js';
import { sendEmail } from '@/providers/mailer.js';
import { HttpError } from '@/utils/httpError.js';
import { isProd } from '@/config/env.js';
import { generateJwtToken, comparePassword } from '@/services/authService.js';

const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
  const token = generateJwtToken(user);

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

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(
      new HttpError(httpStatus.BAD_REQUEST, 'Email is already registered')
    );
  }

  const user = await User.create({ name, email, password, role });

  sendTokenResponse(user, httpStatus.CREATED, res);
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new HttpError(httpStatus.BAD_REQUEST, 'Please provide email and password')
    );
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new HttpError(httpStatus.UNAUTHORIZED, 'Invalid credentials'));
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return next(new HttpError(httpStatus.UNAUTHORIZED, 'Invalid credentials'));
  }

  sendTokenResponse(user, httpStatus.OK, res);
};

export const logout = async (_req: Request, res: Response) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
    secure: isProd,
  });

  res.status(httpStatus.OK).json({ success: true });
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new HttpError(httpStatus.NOT_FOUND, 'User not found'));
  }

  res.status(httpStatus.OK).json({ success: true, data: req.user });
};

export const updateUserDetails = async (req: Request, res: Response) => {
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

export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    throw new HttpError(httpStatus.NOT_FOUND, 'User not found');
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(
      new HttpError(
        httpStatus.BAD_REQUEST,
        'Both current and new passwords are required'
      )
    );
  }

  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) {
    return next(new HttpError(httpStatus.UNAUTHORIZED, 'Incorrect password'));
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, httpStatus.OK, res);
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(httpStatus.OK).json({
      success: true,
      message:
        'If an account with that email exists, a reset email has been sent.',
    });
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

    res.status(httpStatus.OK).json({ success: true });
  } catch (err) {
    req.log.error({ err }, 'Error sending forgot password email');

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new HttpError(httpStatus.INTERNAL_SERVER_ERROR, 'Email was not sent!')
    );
  }
};

interface ResetPasswordParams {
  resettoken: string;
}

interface ResetPasswordBody {
  password: string;
}

export const resetPassword = async (
  req: Request<ResetPasswordParams, unknown, ResetPasswordBody>,
  res: Response,
  next: NextFunction
) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new HttpError(httpStatus.BAD_REQUEST, 'Invalid token'));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, httpStatus.OK, res);
};
