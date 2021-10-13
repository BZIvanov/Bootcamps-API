const status = require('http-status');
const User = require('../models/user');
const Filters = require('../utils/filters');
const AppError = require('../utils/appError');
const catchAsync = require('../middlewares/catch-async');

exports.getUsers = catchAsync(async (req, res) => {
  const filtered = new Filters(User.find(), req.query)
    .filter()
    .select()
    .sort()
    .paginate();
  const users = await filtered.docs;

  res
    .status(status.OK)
    .json({ success: true, results: users.length, data: users });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new AppError(`User with id ${req.params.id} not found`, status.NOT_FOUND)
    );
  }

  res.status(status.OK).json({ success: true, data: user });
});

exports.createUser = catchAsync(async (req, res) => {
  const user = await User.create(req.body);

  delete user._doc.password;

  res.status(status.CREATED).json({ success: true, data: user });
});

exports.updateUser = catchAsync(async (req, res) => {
  const { name, email } = req.body;

  const user = await User.findOneAndUpdate(
    { _id: req.params.id },
    { name, email },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(status.OK).json({ success: true, data: user });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new AppError(
        `User with id: ${req.params.id} not found.`,
        status.NOT_FOUND
      )
    );
  }

  await user.remove();

  res.status(status.OK).json({ success: true });
});
