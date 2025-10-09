import httpStatus from 'http-status';
import type { IUser } from '@/modules/users/user.model.js';
import User from '@/modules/users/user.model.js';
import Filters from '@/utils/filters.util.js';
import type { PaginatedResult } from '@/shared/types/index.js';
import { getPaginationMeta } from '@/utils/pagination.util.js';
import type { QueryString } from '@/utils/filters.util.js';
import { HttpError } from '@/utils/httpError.util.js';

export const getUsers = async (
  query: QueryString
): Promise<PaginatedResult<IUser>> => {
  const filters = new Filters<IUser>(User.find(), query)
    .filter()
    .select()
    .sort()
    .paginate();

  const users = await filters.exec();

  const total = await User.countDocuments();

  const { page, limit, totalPages } = getPaginationMeta(total, query);

  return {
    data: users,
    total,
    page,
    limit,
    totalPages,
  };
};

export const getUserById = async (id: string): Promise<IUser> => {
  const user = await User.findById(id);

  if (!user) {
    throw new HttpError(httpStatus.NOT_FOUND, `User with id: ${id} not found`);
  }

  return user;
};

export const deleteUser = async (userId: string): Promise<void> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new HttpError(
      httpStatus.NOT_FOUND,
      `User with id: ${userId} not found`
    );
  }

  // Use deleteOne() to trigger pre hook
  await user.deleteOne();
};
