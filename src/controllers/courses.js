import httpStatus from 'http-status';
import Course from '../models/course.js';
import Bootcamp from '../models/bootcamp.js';
import Filters from '../utils/filters.js';
import AppError from '../utils/appError.js';
import catchAsync from '../middlewares/catch-async.js';
import { userTypes } from '../constants/index.js';

export const getCourses = catchAsync(async (req, res) => {
  let query;

  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else {
    const filtered = new Filters(
      Course.find().populate({
        path: 'bootcamp',
        select: 'name description',
      }),
      req.query
    )
      .filter()
      .select()
      .sort()
      .paginate();

    query = filtered.docs;
  }

  const courses = await query;

  res
    .status(httpStatus.OK)
    .json({ success: true, results: courses.length, data: courses });
});

export const getCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!course) {
    return next(
      new AppError(
        `Course with id: ${req.params.id} not found.`,
        httpStatus.NOT_FOUND
      )
    );
  }

  res.status(httpStatus.OK).json({ success: true, data: course });
});

export const createCourse = catchAsync(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new AppError(
        `Bootcamp with id: ${req.params.bootcampId} not found.`,
        httpStatus.NOT_FOUND
      )
    );
  }

  if (
    bootcamp.user.toString() !== req.user.id &&
    req.user.role !== userTypes.admin
  ) {
    return next(
      new AppError(
        `User with id: ${req.user.id} is not allowed to add course to bootcamp with id ${bootcamp._id}`,
        httpStatus.UNAUTHORIZED
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(httpStatus.CREATED).json({ success: true, data: course });
});

export const updateCourse = catchAsync(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new AppError(
        `Course with id: ${req.params.id} not found.`,
        httpStatus.NOT_FOUND
      )
    );
  }

  if (
    course.user.toString() !== req.user.id &&
    req.user.role !== userTypes.admin
  ) {
    return next(
      new AppError(
        `User with id: ${req.user.id} is not allowed to update course with id ${course._id}`,
        httpStatus.UNAUTHORIZED
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(httpStatus.OK).json({ success: true, data: course });
});

export const deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new AppError(
        `Course with id: ${req.params.id} not found.`,
        httpStatus.NOT_FOUND
      )
    );
  }

  if (
    course.user.toString() !== req.user.id &&
    req.user.role !== userTypes.admin
  ) {
    return next(
      new AppError(
        `User with id: ${req.user.id} is not allowed to delete course with id ${course._id}`,
        httpStatus.UNAUTHORIZED
      )
    );
  }

  // here is important to use remove method to trigger remove hook in the model
  await course.remove();

  res.status(httpStatus.OK).json({ success: true });
});
