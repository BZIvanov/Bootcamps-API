import httpStatus from 'http-status';
import User, { IUser } from '@/models/user.js';
import { HttpError } from '@/utils/httpError.js';
import {
  CreateUserInput,
  LoginUserInput,
  UpdateUserInput,
} from '@/validation/user.js';
import { generateJwtToken, comparePassword } from './authUtils.js';

export const registerUser = async (input: CreateUserInput): Promise<IUser> => {
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

export const loginUser = async (input: LoginUserInput): Promise<IUser> => {
  const { email, password } = input;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new HttpError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new HttpError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  return user;
};

export const updateUserDetails = async (
  userId: string,
  input: UpdateUserInput
): Promise<IUser> => {
  const fields: Partial<UpdateUserInput> = {
    ...(input.name && { name: input.name }),
    ...(input.email && { email: input.email }),
  };

  const user = await User.findByIdAndUpdate(userId, fields, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new HttpError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};
