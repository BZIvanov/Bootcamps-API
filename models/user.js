const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const schema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user',
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

schema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

schema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

schema.methods.matchPassword = async function (incomingPassword) {
  return await bcrypt.compare(incomingPassword, this.password);
};

schema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', schema);
