import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { parseQuery } from '@/utils/parseQuery.util.js';
import * as usersService from '@/services/users.service.js';
import type { UserIdParams } from '@/validation/users.validation.js';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort order, e.g. "-createdAt"
 *     responses:
 *       200:
 *         description: List of users
 */
export const getUsers = async (req: Request, res: Response) => {
  const query = parseQuery(req.query);

  const result = await usersService.getUsers(query);

  res.status(httpStatus.OK).json({
    success: true,
    ...result,
  });
};

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get a single user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
export const getUser = async (req: Request<UserIdParams>, res: Response) => {
  const user = await usersService.getUserById(req.params.userId);

  res.status(httpStatus.OK).json({ success: true, data: user });
};

/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
export const deleteUser = async (req: Request<UserIdParams>, res: Response) => {
  await usersService.deleteUser(req.params.userId);

  res.status(httpStatus.OK).json({ success: true });
};
