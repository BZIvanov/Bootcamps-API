import httpStatus from 'http-status';
import Bootcamp, { IBootcamp } from '@/models/bootcamp.js';
import Filters from '@/utils/filters.js';
import { HttpError } from '@/utils/httpError.js';
import { QueryString } from '@/utils/filters.js';
import { PaginatedResult } from '@/types/common.js';
import { getPaginationMeta } from '@/utils/pagination.js';
import { IUser } from '@/models/user.js';
import { CreateBootcampInput } from '@/validation/bootcamp.js';
import { userTypes } from '@/constants/user.js';

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
