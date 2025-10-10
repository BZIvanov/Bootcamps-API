import type { Secret, SignOptions } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { IUser } from '@/modules/users/user.model.js';
import ENV from '@/config/env.config.js';

export const generateJwtToken = (
  user: IUser,
  expiresIn: SignOptions['expiresIn'] = '1d'
): string => {
  const payload = { id: user._id };
  const secret: Secret = ENV.JWT_SECRET;
  const options: SignOptions = { expiresIn };

  return jwt.sign(payload, secret, options);
};

export const comparePassword = async (
  incomingPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(incomingPassword, hashedPassword);
};
