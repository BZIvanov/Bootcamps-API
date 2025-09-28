import crypto from 'crypto';
import { Schema, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userTypes } from '../constants/user.js';
import { Models } from '../constants/models.js';

const schema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide a name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
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
      // admin should be modified manually in the database
      enum: Object.values(userTypes).filter(
        (userType) => userType !== userTypes.ADMIN
      ),
      default: userTypes.USER,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

schema.pre('save', async function hashUserPassword(next) {
  if (!this.isModified('password')) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

schema.methods.getSignedJwtToken = function signJWTToken() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

schema.methods.matchPassword = async function comparePasswords(
  incomingPassword
) {
  return bcrypt.compare(incomingPassword, this.password);
};

schema.methods.getResetPasswordToken = function generateResetPasswordToken() {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

export default model(Models.USER, schema);
