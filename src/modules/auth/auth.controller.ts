import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import type { IUser } from '@/modules/users/user.model.js';
import { isProd } from '@/config/env.config.js';
import * as authService from '@/modules/auth/auth.service.js';
import type {
  ForgotPasswordBody,
  LoginUserBody,
  RegisterUserBody,
  ResetPasswordBody,
  ResetPasswordParams,
  UpdatePasswordBody,
  UpdateUserBody,
} from '@/modules/auth/auth.validation.js';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
  const token = authService.issueAuthToken(user);

  const options = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    httpOnly: true,
    secure: isProd,
  };

  res
    .header('Authorization', `Bearer ${token}`)
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, data: { user, token } });
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
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 2
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               role:
 *                 type: string
 *                 enum: [user, publisher]
 *           example:
 *             username: John
 *             email: john@example.com
 *             password: P@ssw0rd!
 *             role: user
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request — validation or business logic error
 *       500:
 *         description: Internal server error
 */
export const register = async (
  req: Request<unknown, unknown, RegisterUserBody>,
  res: Response
) => {
  const { username, email, password, role } = req.body;

  const user = await authService.registerUser({
    username,
    email,
    password,
    role,
  });

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
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *           example:
 *             email: john@example.com
 *             password: P@ssw0rd!
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Bad request — validation or business logic error
 *       401:
 *         description: Invalid credentials
 */
export const login = async (
  req: Request<unknown, unknown, LoginUserBody>,
  res: Response
) => {
  const { email, password } = req.body;

  const user = await authService.loginUser({ email, password });

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
 *       401:
 *         description: You are not logged in
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
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *           example:
 *             username: jake
 *             email: jake@example.com
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: You are not logged in
 */
export const updateDetails = async (
  req: Request<unknown, unknown, UpdateUserBody>,
  res: Response
) => {
  const { username, email } = req.body;

  const user = await authService.updateUserDetails(req.user.id, {
    username,
    email,
  });

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
 *           example:
 *             currentPassword: P@ssw0rd!
 *             newPassword: P@ssw0rd!!
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description Incorrect data
 *       401:
 *         description Authentication failed
 */
export const updatePassword = async (
  req: Request<unknown, unknown, UpdatePasswordBody>,
  res: Response
) => {
  const { currentPassword, newPassword } = req.body;

  const user = await authService.updateUserPassword(req.user.id, {
    currentPassword,
    newPassword,
  });

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
 *           example:
 *             email: john@example.com
 *     responses:
 *       200:
 *         description: Email sent if account exists
 */
export const forgotPassword = async (
  req: Request<unknown, unknown, ForgotPasswordBody>,
  res: Response
) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  await authService.forgotUserPassword(
    { email: req.body.email },
    baseUrl,
    req.log
  );

  res.status(httpStatus.OK).json({
    success: true,
    message:
      'If an account with that email exists, a reset email has been sent.',
  });
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
 *           example: "d41d8cd98f00b204e9800998ecf8427e"  # Example reset token
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
 *                 format: password
 *                 description: New password for the user account
 *           example:
 *             password: N3wStrongP@ssword!
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired reset token or bad data
 */
export const resetPassword = async (
  req: Request<ResetPasswordParams, unknown, ResetPasswordBody>,
  res: Response
) => {
  const user = await authService.resetUserPassword(req.params, req.body);

  sendTokenResponse(user, httpStatus.OK, res);
};
