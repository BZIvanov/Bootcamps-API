import httpStatus from 'http-status';
import type { IUser } from '@/models/user.model.js';
import type { IBootcamp } from '@/models/bootcamp.model.js';
import Bootcamp from '@/models/bootcamp.model.js';
import type { QueryString } from '@/utils/filters.util.js';
import Filters from '@/utils/filters.util.js';
import { HttpError } from '@/utils/httpError.util.js';
import type { PaginatedResult } from '@/types/common.types.js';
import { getPaginationMeta } from '@/utils/pagination.util.js';
import type { CreateBootcampInput } from '@/validation/bootcamps.validation.js';
import { userTypes } from '@/constants/user.constants.js';

export const getBootcampsService = async (
  query: QueryString
): Promise<PaginatedResult<IBootcamp>> => {
  const filters = new Filters<IBootcamp>(
    Bootcamp.find().populate('courses'),
    query
  )
    .filter()
    .select()
    .sort()
    .paginate();

  const bootcamps = await filters.exec();

  const total = await Bootcamp.countDocuments();

  const { page, limit, totalPages } = getPaginationMeta(total, query);

  return {
    data: bootcamps,
    total,
    page,
    limit,
    totalPages,
  };
};

export const getBootcampByIdService = async (
  id: string
): Promise<IBootcamp> => {
  const bootcamp = await Bootcamp.findById(id).populate('courses');

  if (!bootcamp) {
    throw new HttpError(
      httpStatus.NOT_FOUND,
      `Bootcamp with id: ${id} not found`
    );
  }

  return bootcamp;
};

export const createBootcampService = async (
  user: IUser,
  data: CreateBootcampInput
): Promise<IBootcamp> => {
  // Check if this user already published a bootcamp (unless admin)
  const existingBootcamp = await Bootcamp.findOne({ user: user.id });
  if (existingBootcamp && user.role !== userTypes.ADMIN) {
    throw new HttpError(
      httpStatus.BAD_REQUEST,
      `User with id ${user.id} has already published a bootcamp`
    );
  }

  const bootcamp = await Bootcamp.create({ ...data, user: user.id });

  return bootcamp;
};
