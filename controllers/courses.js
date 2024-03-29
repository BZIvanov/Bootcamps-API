const status = require('http-status');
const Course = require('../models/course');
const Bootcamp = require('../models/bootcamp');
const Filters = require('../utils/filters');
const AppError = require('../utils/appError');
const catchAsync = require('../middlewares/catch-async');
const {
  userTypes: { admin },
} = require('../constants');

exports.getCourses = catchAsync(async (req, res) => {
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
    .status(status.OK)
    .json({ success: true, results: courses.length, data: courses });
});

exports.getCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!course) {
    return next(
      new AppError(
        `Course with id: ${req.params.id} not found.`,
        status.NOT_FOUND
      )
    );
  }

  res.status(status.OK).json({ success: true, data: course });
});

exports.createCourse = catchAsync(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new AppError(
        `Bootcamp with id: ${req.params.bootcampId} not found.`,
        status.NOT_FOUND
      )
    );
  }

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== admin) {
    return next(
      new AppError(
        `User with id: ${req.user.id} is not allowed to add course to bootcamp with id ${bootcamp._id}`,
        status.UNAUTHORIZED
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(status.CREATED).json({ success: true, data: course });
});

exports.updateCourse = catchAsync(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new AppError(
        `Course with id: ${req.params.id} not found.`,
        status.NOT_FOUND
      )
    );
  }

  if (course.user.toString() !== req.user.id && req.user.role !== admin) {
    return next(
      new AppError(
        `User with id: ${req.user.id} is not allowed to update course with id ${course._id}`,
        status.UNAUTHORIZED
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(status.OK).json({ success: true, data: course });
});

exports.deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new AppError(
        `Course with id: ${req.params.id} not found.`,
        status.NOT_FOUND
      )
    );
  }

  if (course.user.toString() !== req.user.id && req.user.role !== admin) {
    return next(
      new AppError(
        `User with id: ${req.user.id} is not allowed to delete course with id ${course._id}`,
        status.UNAUTHORIZED
      )
    );
  }

  // here is important to use remove method to trigger remove hook in the model
  await course.remove();

  res.status(status.OK).json({ success: true });
});
