import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import User, { IUser } from '@/models/user.js';
import Filters from '@/utils/filters.js';
import { HttpError } from '@/utils/httpError.js';
import { parseQuery } from '@/utils/parseQuery.js';

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
  const filters = new Filters<IUser>(User.find(), query)
    .filter()
    .select()
    .sort()
    .paginate();

  const users = await filters.exec();

  const total = await User.countDocuments();
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '10', 10);

  res.status(httpStatus.OK).json({
    success: true,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: users,
  });
};

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a single user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return next(
      new HttpError(httpStatus.NOT_FOUND, `User with id ${id} not found`)
    );
  }

  res.status(httpStatus.OK).json({ success: true, data: user });
};

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
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
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, publisher, admin]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Email already exists
 */
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new HttpError(httpStatus.BAD_REQUEST, 'Email already exists'));
  }

  const user = await User.create({ username, email, password, role });

  const userResponse = user.toObject();

  res
    .status(httpStatus.CREATED)
    .json({ success: true, data: { ...userResponse, password: undefined } });
};

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update an existing user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { username, email } = req.body;

  const fieldsToUpdate: Partial<IUser> = {};
  if (username) {
    fieldsToUpdate.username = username;
  }
  if (email) {
    fieldsToUpdate.email = email;
  }

  const user = await User.findByIdAndUpdate(id, fieldsToUpdate, {
    new: true,
    runValidators: true,
    select: '-password -resetPasswordToken -resetPasswordExpire',
  });

  if (!user) {
    return next(
      new HttpError(httpStatus.NOT_FOUND, `User with id ${id} not found`)
    );
  }

  res.status(httpStatus.OK).json({ success: true, data: user });
};

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return next(
      new HttpError(httpStatus.NOT_FOUND, `User with id: ${id} not found.`)
    );
  }

  await user.deleteOne();

  res.status(httpStatus.OK).json({ success: true });
};
