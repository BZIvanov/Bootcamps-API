import fs from 'fs';
import path from 'path';
import httpStatus from 'http-status';
import type { UploadedFile } from 'express-fileupload';
import type { IUser } from '@/modules/users/user.model.js';
import type { IBootcamp } from '@/modules/bootcamps/bootcamp.model.js';
import Bootcamp from '@/modules/bootcamps/bootcamp.model.js';
import type { QueryString } from '@/utils/filters.util.js';
import Filters from '@/utils/filters.util.js';
import { HttpError } from '@/utils/httpError.util.js';
import type { PaginatedResult } from '@/shared/types/index.js';
import { getPaginationMeta } from '@/utils/pagination.util.js';
import type {
  CreateBootcampBody,
  UpdateBootcampBody,
} from '@/modules/bootcamps/bootcamp.validation.js';
import { userTypes } from '@/modules/users/user.constants.js';

export const getAllBootcamps = async (
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

export const getBootcampById = async (id: string): Promise<IBootcamp> => {
  const bootcamp = await Bootcamp.findById(id).populate('courses');

  if (!bootcamp) {
    throw new HttpError(
      httpStatus.NOT_FOUND,
      `Bootcamp with id: ${id} not found`
    );
  }

  return bootcamp;
};

export const createBootcamp = async (
  user: IUser,
  data: CreateBootcampBody
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

export const updateBootcamp = async (
  id: string,
  user: IUser,
  data: UpdateBootcampBody
): Promise<IBootcamp> => {
  const bootcamp = await Bootcamp.findById(id);

  if (!bootcamp) {
    throw new HttpError(
      httpStatus.NOT_FOUND,
      `Bootcamp with id: ${id} not found`
    );
  }

  if (bootcamp.user.toString() !== user.id && user.role !== userTypes.ADMIN) {
    throw new HttpError(
      httpStatus.UNAUTHORIZED,
      `User with id: ${user.id} is not allowed to update this resource`
    );
  }

  const updatedBootcamp = await Bootcamp.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!updatedBootcamp) {
    throw new HttpError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to update bootcamp'
    );
  }

  return updatedBootcamp;
};

export const deleteBootcamp = async (
  id: string,
  user: IUser
): Promise<void> => {
  const bootcamp = await Bootcamp.findById(id);

  if (!bootcamp) {
    throw new HttpError(
      httpStatus.NOT_FOUND,
      `Bootcamp with id: ${id} not found`
    );
  }

  if (bootcamp.user.toString() !== user.id && user.role !== userTypes.ADMIN) {
    throw new HttpError(
      httpStatus.UNAUTHORIZED,
      `User with id: ${user.id} is not allowed to delete this resource`
    );
  }

  // Use deleteOne() to trigger pre hook
  await bootcamp.deleteOne();
};

export const uploadBootcampImage = async (
  bootcampId: string,
  file: UploadedFile,
  user: IUser
): Promise<string> => {
  const bootcamp = await Bootcamp.findById(bootcampId);

  if (!bootcamp) {
    throw new HttpError(
      httpStatus.NOT_FOUND,
      `Bootcamp with id: ${bootcampId} not found`
    );
  }

  if (bootcamp.user.toString() !== user.id && user.role !== userTypes.ADMIN) {
    throw new HttpError(
      httpStatus.UNAUTHORIZED,
      `User with id: ${user.id} is not allowed to upload an image for this resource`
    );
  }

  if (!file.mimetype.startsWith('image')) {
    throw new HttpError(httpStatus.BAD_REQUEST, 'Please upload an image file.');
  }

  const maxSize = 1 * 1024 * 1024; // 1MB
  if (file.size > maxSize) {
    throw new HttpError(
      httpStatus.BAD_REQUEST,
      'File size should be less than 1MB.'
    );
  }

  const fileName = `image_${bootcamp._id}${path.extname(file.name)}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  const uploadPath = path.join(uploadDir, fileName);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  await file.mv(uploadPath);

  bootcamp.image = fileName;
  await bootcamp.save();

  return fileName;
};
