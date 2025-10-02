import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import Course from '@/models/course.js';
import Bootcamp from '@/models/bootcamp.js';
import Filters from '@/utils/filters.js';
import { HttpError } from '@/utils/httpError.js';
import { userTypes } from '@/constants/user.js';
import { parseQuery } from '@/utils/parseQuery.js';

export const getCourses = async (req: Request, res: Response) => {
  const { bootcampId } = req.params;

  const query = parseQuery(req.query);

  let coursesQuery;

  if (bootcampId) {
    coursesQuery = Course.find({ bootcamp: bootcampId });
  } else {
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

    coursesQuery = filters.exec();
  }

  const courses = await coursesQuery;

  const total = courses.length;
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '10', 10);

  res.status(httpStatus.OK).json({
    success: true,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: courses,
  });
};

export const getCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

export const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

export const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
  await course.deleteOne();

  res.status(httpStatus.OK).json({ success: true });
};
