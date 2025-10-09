import type { Secret, SignOptions } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { IUser } from '@/modules/users/user.model.js';

export const generateJwtToken = (
  user: IUser,
  expiresIn: SignOptions['expiresIn'] = '1d'
): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment');
  }

  const payload = { id: user._id };
  const secret: Secret = process.env.JWT_SECRET;
  const options: SignOptions = { expiresIn };

  return jwt.sign(payload, secret, options);
};

export const comparePassword = async (
  incomingPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(incomingPassword, hashedPassword);
};
