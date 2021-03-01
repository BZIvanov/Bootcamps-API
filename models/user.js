const crypto = require('crypto');
const { Schema, model } = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const schema = new Schema(
  {
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
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'publisher'],
      default: 'user',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

schema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

schema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
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

module.exports = model('User', schema);
