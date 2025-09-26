import httpStatus from 'http-status';
import Review from '../models/review.js';
import Bootcamp from '../models/bootcamp.js';
import Filters from '../utils/filters.js';
import AppError from '../utils/appError.js';
import catchAsync from '../middlewares/catch-async.js';
import { userTypes } from '../constants/index.js';

export const getReviews = catchAsync(async (req, res) => {
  let query;

  if (req.params.bootcampId) {
    query = Review.find({ bootcamp: req.params.bootcampId });
  } else {
    const filtered = new Filters(
      Review.find().populate({
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

  const reviews = await query;

  res
    .status(httpStatus.OK)
    .json({ success: true, results: reviews.length, data: reviews });
});

export const getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!review) {
    return next(
      new AppError(
        `Review with id ${req.params.id} not found`,
        httpStatus.NOT_FOUND
      )
    );
  }

  res.status(httpStatus.OK).json({ success: true, data: review });
});

export const createReview = catchAsync(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new AppError(
        `Bootcamp with id ${req.params.bootcampId} not found`,
        httpStatus.NOT_FOUND
      )
    );
  }

  const review = await Review.create(req.body);

  res.status(httpStatus.CREATED).json({ success: true, data: review });
});

export const updateReview = catchAsync(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new AppError(
        `Review with id ${req.params.id} not found`,
        httpStatus.NOT_FOUND
      )
    );
  }

  if (
    review.user.toString() !== req.user.id &&
    req.user.role !== userTypes.admin
  ) {
    return next(
      new AppError('Not authorized to update review', httpStatus.UNAUTHORIZED)
    );
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(httpStatus.OK).json({ success: true, data: review });
});

export const deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new AppError(
        `Review with id ${req.params.id} not found`,
        httpStatus.NOT_FOUND
      )
    );
  }

  if (
    review.user.toString() !== req.user.id &&
    req.user.role !== userTypes.admin
  ) {
    return next(
      new AppError('Not authorized to delete review', httpStatus.UNAUTHORIZED)
    );
  }

  await review.remove();

  res.status(httpStatus.OK).json({ success: true });
});
