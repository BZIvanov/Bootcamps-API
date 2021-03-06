const User = require('../models/user');
const Filters = require('../utils/filters');
const AppError = require('../utils/appError');
const catchAsync = require('../middlewares/catch-async');

exports.getUsers = catchAsync(async (req, res, next) => {
  const filtered = new Filters(User.find(), req.query)
    .filter()
    .select()
    .sort()
    .paginate();
  const users = await filtered.docs;

  res.status(200).json({ success: true, results: users.length, data: users });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError(`User with id ${req.params.id} not found`, 404));
  }

  res.status(200).json({ success: true, data: user });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  const { password, ...rest } = user._doc;

  res.status(201).json({ success: true, data: { ...rest } });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;

  const user = await User.findOneAndUpdate(
    { _id: req.params.id },
    { name, email },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({ success: true, data: user });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError(`User with id: ${req.params.id} not found.`, 404));
  }

  await user.remove();

  res.status(200).json({ success: true });
});
