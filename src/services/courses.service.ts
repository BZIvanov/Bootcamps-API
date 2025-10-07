import httpStatus from 'http-status';
import Course from '@/models/course.model.js';
import type { QueryString } from '@/utils/filters.util.js';
import Filters from '@/utils/filters.util.js';
import { getPaginationMeta } from '@/utils/pagination.util.js';
import { HttpError } from '@/utils/httpError.util.js';
import type {
  CreateCourseBody,
  UpdateCourseBody,
} from '@/validation/courses.validation.js';
import type { IUser } from '@/models/user.model.js';
import Bootcamp from '@/models/bootcamp.model.js';
import { userTypes } from '@/constants/user.constants.js';

export const getCoursesService = async (
  query: QueryString,
  bootcampId?: string
) => {
  if (bootcampId) {
    // Get all courses for a specific bootcamp
    const courses = await Course.find({ bootcamp: bootcampId });
    const meta = getPaginationMeta(courses.length, query);

    return { courses, meta };
  }

  // Global course list with filters and bootcamp population
  const filters = new Filters(
    Course.find().populate({
      path: 'bootcamp',
      select: 'name description',
    }),
    query
  )
    .filter()
    .select()
    .sort()
    .paginate();

  const courses = await filters.exec();
  const total = await Course.countDocuments();
  const meta = getPaginationMeta(total, query);

  return { courses, meta };
};

export const getCourseByIdService = async (id: string) => {
  const course = await Course.findById(id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!course) {
    throw new HttpError(
      httpStatus.NOT_FOUND,
      `Course with id: ${id} not found.`
    );
  }

  return course;
};

export const createCourseService = async (
  bootcampId: string,
  data: CreateCourseBody,
  user: IUser
) => {
  const bootcamp = await Bootcamp.findById(bootcampId);

  if (!bootcamp) {
    throw new HttpError(
      httpStatus.NOT_FOUND,
      `Bootcamp with id: ${bootcampId} not found.`
    );
  }

  if (bootcamp.user.toString() !== user.id && user.role !== userTypes.ADMIN) {
    throw new HttpError(
      httpStatus.UNAUTHORIZED,
      `User with id: ${user.id} is not allowed to add course to bootcamp with id ${bootcamp._id}`
    );
  }

  const course = await Course.create({
    ...data,
    bootcamp: bootcampId,
    user: user.id,
  });

  return course;
};

export const updateCourseService = async (
  courseId: string,
  data: UpdateCourseBody,
  user: IUser
) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new HttpError(
      httpStatus.NOT_FOUND,
      `Course with id: ${courseId} not found.`
    );
  }

  if (course.user.toString() !== user.id && user.role !== userTypes.ADMIN) {
    throw new HttpError(
      httpStatus.UNAUTHORIZED,
      `User with id: ${user.id} is not allowed to update course with id ${course._id}`
    );
  }

  const updatedCourse = await Course.findByIdAndUpdate(courseId, data, {
    new: true,
    runValidators: true,
  });

  return updatedCourse;
};

export const deleteCourseByIdService = async (
  courseId: string,
  user: IUser
) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new HttpError(
      httpStatus.NOT_FOUND,
      `Course with id: ${courseId} not found.`
    );
  }

  if (course.user.toString() !== user.id && user.role !== userTypes.ADMIN) {
    throw new HttpError(
      httpStatus.UNAUTHORIZED,
      `User with id: ${user.id} is not allowed to delete course with id ${course._id}`
    );
  }

  // Use deleteOne to trigger pre-delete hooks
  await course.deleteOne();
};
