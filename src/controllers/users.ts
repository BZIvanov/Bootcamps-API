import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import User, { IUser } from '@/models/user.js';
import Filters from '@/utils/filters.js';
import { HttpError } from '@/utils/httpError.js';
import { parseQuery } from '@/utils/parseQuery.js';

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
    count: users.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: users,
  });
};

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

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new HttpError(httpStatus.BAD_REQUEST, 'Email already exists'));
  }

  const user = await User.create({ name, email, password, role });

  const userResponse = user.toObject();

  res
    .status(httpStatus.CREATED)
    .json({ success: true, data: { ...userResponse, password: undefined } });
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { name, email } = req.body;

  const fieldsToUpdate: Partial<IUser> = {};
  if (name) {
    fieldsToUpdate.name = name;
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
