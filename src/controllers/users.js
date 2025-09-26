import httpStatus from 'http-status';
import User from '../models/user.js';
import Filters from '../utils/filters.js';
import AppError from '../utils/appError.js';
import catchAsync from '../middlewares/catch-async.js';

export const getUsers = catchAsync(async (req, res) => {
  const filtered = new Filters(User.find(), req.query)
    .filter()
    .select()
    .sort()
    .paginate();
  const users = await filtered.docs;

  res
    .status(httpStatus.OK)
    .json({ success: true, results: users.length, data: users });
});

export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new AppError(
        `User with id ${req.params.id} not found`,
        httpStatus.NOT_FOUND
      )
    );
  }

  res.status(httpStatus.OK).json({ success: true, data: user });
});

export const createUser = catchAsync(async (req, res) => {
  const user = await User.create(req.body);

  delete user._doc.password;

  res.status(httpStatus.CREATED).json({ success: true, data: user });
});

export const updateUser = catchAsync(async (req, res) => {
  const { name, email } = req.body;

  const user = await User.findOneAndUpdate(
    { _id: req.params.id },
    { name, email },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(httpStatus.OK).json({ success: true, data: user });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new AppError(
        `User with id: ${req.params.id} not found.`,
        httpStatus.NOT_FOUND
      )
    );
  }

  await user.remove();

  res.status(httpStatus.OK).json({ success: true });
});
