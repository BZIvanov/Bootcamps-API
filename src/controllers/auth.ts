import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import User, { IUser } from '@/models/user.js';
import { sendEmail } from '@/providers/mailer.js';
import { HttpError } from '@/utils/httpError.js';
import { isProd } from '@/config/env.js';
import { comparePassword } from '@/services/authUtils.js';
import {
  issueAuthToken,
  loginUser,
  registerUser,
  updateUserDetails,
} from '@/services/authService.js';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
  const token = issueAuthToken(user);

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

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, publisher]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Email is already registered
 */
export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  const user = await registerUser({ name, email, password, role });

  sendTokenResponse(user, httpStatus.CREATED, res);
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid credentials
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await loginUser({ email, password });

  sendTokenResponse(user, httpStatus.OK, res);
};

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout the user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successfully logged out
 */
export const logout = async (_req: Request, res: Response) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
    secure: isProd,
  });

  res.status(httpStatus.OK).json({ success: true });
};

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current logged in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user info
 *       404:
 *         description: User not found
 */
export const me = async (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({ success: true, data: req.user });
};

/**
 * @swagger
 * /auth/update-details:
 *   put:
 *     summary: Update current user details
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 */
export const updateUser = async (req: Request, res: Response) => {
  const { name, email } = req.body;

  const user = await updateUserDetails(req.user.id, { name, email });

  res.status(httpStatus.OK).json({ success: true, data: user });
};

/**
 * @swagger
 * /auth/update-password:
 *   put:
 *     summary: Update current user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 */
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

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent if account exists
 */
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

/**
 * @swagger
 * /auth/reset-password/{resettoken}:
 *   put:
 *     summary: Reset user password
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: resettoken
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
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
