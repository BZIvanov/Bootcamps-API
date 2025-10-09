import crypto from 'crypto';
import type { Document } from 'mongoose';
import { Schema, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import type { UserRole } from '@/constants/user.constants.js';
import { userTypes } from '@/constants/user.constants.js';
import { Models } from '@/constants/model.constants.js';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  resetPasswordToken?: string | undefined;
  resetPasswordExpire?: Date | undefined;
  getResetPasswordToken(): string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      trim: true,
      required: [true, 'Please provide a username'],
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
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.getResetPasswordToken = function (): string {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  return resetToken;
};

userSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: Record<string, any>) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

const User = model<IUser>(Models.USER, userSchema);

export default User;
