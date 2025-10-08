import crypto from 'crypto';
import httpStatus from 'http-status';
import type { Logger } from 'pino';
import type { IUser } from '@/models/user.model.js';
import User from '@/models/user.model.js';
import { HttpError } from '@/utils/httpError.util.js';
import type {
  RegisterUserBody,
  LoginUserBody,
  UpdateUserBody,
  UpdatePasswordBody,
  ForgotPasswordBody,
  ResetPasswordParams,
  ResetPasswordBody,
} from '@/validation/auth.validation.js';
import { sendEmail } from '@/providers/mailer.provider.js';
import { generateJwtToken, comparePassword } from './authUtils.service.js';

export const registerUser = async (input: RegisterUserBody): Promise<IUser> => {
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

export const loginUser = async (input: LoginUserBody): Promise<IUser> => {
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
  input: UpdateUserBody
): Promise<IUser> => {
  const fields: Partial<UpdateUserBody> = {
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
  input: UpdatePasswordBody
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
  input: ForgotPasswordBody,
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
