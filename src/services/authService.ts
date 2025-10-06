import crypto from 'crypto';
import httpStatus from 'http-status';
import type { Logger } from 'pino';
import User, { IUser } from '@/models/user.js';
import { HttpError } from '@/utils/httpError.js';
import {
  CreateUserInput,
  LoginUserInput,
  UpdateUserInput,
  UpdatePasswordInput,
  ForgotPasswordInput,
  ResetPasswordParams,
  ResetPasswordBody,
} from '@/validation/user.js';
import { sendEmail } from '@/providers/mailer.js';
import { generateJwtToken, comparePassword } from './authUtils.js';

export const registerUser = async (input: CreateUserInput): Promise<IUser> => {
  const { username, email, password, role } = input;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new HttpError(httpStatus.BAD_REQUEST, 'Email is already registered');
  }

  const user = await User.create({ username, email, password, role });
  return user;
};

export const issueAuthToken = (user: IUser): string => {
  return generateJwtToken(user);
};

export const loginUser = async (input: LoginUserInput): Promise<IUser> => {
  const { email, password } = input;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new HttpError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new HttpError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  return user;
};

export const updateUserDetails = async (
  userId: string,
  input: UpdateUserInput
): Promise<IUser> => {
  const fields: Partial<UpdateUserInput> = {
    ...(input.username && { username: input.username }),
    ...(input.email && { email: input.email }),
  };

  const user = await User.findByIdAndUpdate(userId, fields, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new HttpError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

export const updateUserPassword = async (
  userId: string,
  input: UpdatePasswordInput
): Promise<IUser> => {
  const { currentPassword, newPassword } = input;

  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new HttpError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) {
    throw new HttpError(httpStatus.UNAUTHORIZED, 'Incorrect password');
  }

  user.password = newPassword;
  await user.save();

  return user;
};

export const handleForgotPassword = async (
  input: ForgotPasswordInput,
  baseUrl: string,
  logger: Logger
): Promise<void> => {
  const { email } = input;

  const user = await User.findOne({ email });

  // Respond as success even if user not found (avoid user enumeration)
  if (!user) {
    return;
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${baseUrl}/api/v1/auth/reset-password/${resetToken}`;
  const text = `Here is your password reset URL:\n\n${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      text,
    });
  } catch (err) {
    logger.error({ err }, 'Error sending forgot password email');

    // rollback token if email sending fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    throw new HttpError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Email was not sent!'
    );
  }
};

export const handleResetPassword = async (
  params: ResetPasswordParams,
  body: ResetPasswordBody
): Promise<IUser> => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new HttpError(httpStatus.BAD_REQUEST, 'Invalid or expired token');
  }

  user.password = body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return user;
};
