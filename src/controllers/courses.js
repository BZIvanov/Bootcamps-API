import httpStatus from 'http-status';
import Course from '../models/course.js';
import Bootcamp from '../models/bootcamp.js';
import Filters from '../utils/filters.js';
import { HttpError } from '../utils/httpError.js';
import { userTypes } from '../constants/user.js';

export const getCourses = async (req, res) => {
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
      .paginate()
      .exec();

    query = filtered.docs;
  }

  const courses = await query;

  res
    .status(httpStatus.OK)
    .json({ success: true, results: courses.length, data: courses });
};

export const getCourse = async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!course) {
    return next(
      new HttpError(
        httpStatus.NOT_FOUND,
        `Course with id: ${req.params.id} not found.`
      )
    );
  }

  res.status(httpStatus.OK).json({ success: true, data: course });
};

export const createCourse = async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new HttpError(
        httpStatus.NOT_FOUND,
        `Bootcamp with id: ${req.params.bootcampId} not found.`
      )
    );
  }

  if (
    bootcamp.user.toString() !== req.user.id &&
    req.user.role !== userTypes.ADMIN
  ) {
    return next(
      new HttpError(
        httpStatus.UNAUTHORIZED,
        `User with id: ${req.user.id} is not allowed to add course to bootcamp with id ${bootcamp._id}`
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(httpStatus.CREATED).json({ success: true, data: course });
};

export const updateCourse = async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new HttpError(
        httpStatus.NOT_FOUND,
        `Course with id: ${req.params.id} not found.`
      )
    );
  }

  if (
    course.user.toString() !== req.user.id &&
    req.user.role !== userTypes.ADMIN
  ) {
    return next(
      new HttpError(
        httpStatus.UNAUTHORIZED,
        `User with id: ${req.user.id} is not allowed to update course with id ${course._id}`
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(httpStatus.OK).json({ success: true, data: course });
};

export const deleteCourse = async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new HttpError(
        httpStatus.NOT_FOUND,
        `Course with id: ${req.params.id} not found.`
      )
    );
  }

  if (
    course.user.toString() !== req.user.id &&
    req.user.role !== userTypes.ADMIN
  ) {
    return next(
      new HttpError(
        httpStatus.UNAUTHORIZED,
        `User with id: ${req.user.id} is not allowed to delete course with id ${course._id}`
      )
    );
  }

  // here is important to use remove method to trigger remove hook in the model
  await course.remove();

  res.status(httpStatus.OK).json({ success: true });
};
