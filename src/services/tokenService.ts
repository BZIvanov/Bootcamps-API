import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { IUser } from '@/models/user.js';

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
