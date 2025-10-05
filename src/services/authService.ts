import httpStatus from 'http-status';
import User, { IUser } from '@/models/user.js';
import { HttpError } from '@/utils/httpError.js';
import { RegisterInput } from '@/types/auth.js';
import { generateJwtToken } from './authUtils.js';

export const registerUser = async (input: RegisterInput): Promise<IUser> => {
  const { name, email, password, role } = input;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new HttpError(httpStatus.BAD_REQUEST, 'Email is already registered');
  }

  const user = await User.create({ name, email, password, role });
  return user;
};

export const issueAuthToken = (user: IUser): string => {
  return generateJwtToken(user);
};
