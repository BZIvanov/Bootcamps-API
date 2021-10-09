const crypto = require('crypto');
const status = require('http-status');
const User = require('../models/user');
const sendEmail = require('../utils/sendEmail');
const AppError = require('../utils/appError');
const catchAsync = require('../middlewares/catch-async');
const { environment } = require('../constants');

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === environment.production,
  };

  res
    .header('Authorization', `Bearer ${token}`)
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true });
};

exports.register = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({ name, email, password, role });

  sendTokenResponse(user, status.CREATED, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError('Please provide email and password', status.BAD_REQUEST)
    );
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('Invalid credentials', status.UNAUTHORIZED));
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new AppError('Invalid credentials', status.UNAUTHORIZED));
  }

  sendTokenResponse(user, status.OK, res);
});

exports.logout = catchAsync(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === environment.production,
  });

  res.status(status.OK).json({ success: true });
});

exports.getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(status.OK).json({ success: true, data: user });
});

exports.updateDetails = catchAsync(async (req, res) => {
  const { name, email } = req.body;
  const fields = {};
  if (name) {
    fields.name = name;
  }
  if (email) {
    fields.email = email;
  }

  const user = await User.findByIdAndUpdate(req.user.id, fields, {
    new: true,
    runValidators: true,
  });

  res.status(status.OK).json({ success: true, data: user });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(
      new AppError(
        'Both current and new passwords are required',
        status.BAD_REQUEST
      )
    );
  }

  if (!(await user.matchPassword(currentPassword))) {
    return next(new AppError('Incorrect password', status.UNAUTHORIZED));
  }

  user.password = newPassword;
  await user.save();
  sendTokenResponse(user, status.OK, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError('There is no user with that e-mail', status.NOT_FOUND)
    );
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
  } catch (err) {
    console.log('Sending mail error'.red.underline.bold, err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('Email was not sent!', status.INTERNAL_SERVER_ERROR)
    );
  }

  res.status(status.OK).json({ success: true });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid token', status.BAD_REQUEST));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, status.OK, res);
});
