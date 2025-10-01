import crypto from 'crypto';
import { Schema, model, Document } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { userTypes, UserRole } from '@/constants/user.js';
import { Models } from '@/constants/models.js';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  resetPasswordToken?: string | undefined;
  resetPasswordExpire?: Date | undefined;
  getResetPasswordToken(): string;
}

const userSchema = new Schema<IUser>(
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

const User = model<IUser>(Models.USER, userSchema);

export default User;
