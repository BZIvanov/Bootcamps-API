import httpStatus from 'http-status';
import Course from '@/modules/courses/course.model.js';
import type { QueryString } from '@/utils/filters.util.js';
import Filters from '@/utils/filters.util.js';
import { getPaginationMeta } from '@/utils/pagination.util.js';
import { HttpError } from '@/utils/httpError.util.js';
import type {
  CreateCourseBody,
  UpdateCourseBody,
} from '@/modules/courses/course.validation.js';
import type { IUser } from '@/modules/users/user.model.js';
import Bootcamp from '@/modules/bootcamps/bootcamp.model.js';
import { userTypes } from '@/modules/users/user.constants.js';

export const getCourses = async (query: QueryString, bootcampId?: string) => {
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

export const getCourseById = async (id: string) => {
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

export const createCourse = async (
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

export const updateCourse = async (
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

export const deleteCourseById = async (courseId: string, user: IUser) => {
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
