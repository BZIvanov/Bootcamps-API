const status = require('http-status');
const Review = require('../models/review');
const Bootcamp = require('../models/bootcamp');
const Filters = require('../utils/filters');
const AppError = require('../utils/appError');
const catchAsync = require('../middlewares/catch-async');
const {
  userTypes: { admin },
} = require('../constants');

exports.getReviews = catchAsync(async (req, res) => {
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
    .status(status.OK)
    .json({ success: true, results: reviews.length, data: reviews });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!review) {
    return next(
      new AppError(
        `Review with id ${req.params.id} not found`,
        status.NOT_FOUND
      )
    );
  }

  res.status(status.OK).json({ success: true, data: review });
});

exports.createReview = catchAsync(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new AppError(
        `Bootcamp with id ${req.params.bootcampId} not found`,
        status.NOT_FOUND
      )
    );
  }

  const review = await Review.create(req.body);

  res.status(status.CREATED).json({ success: true, data: review });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new AppError(
        `Review with id ${req.params.id} not found`,
        status.NOT_FOUND
      )
    );
  }

  if (review.user.toString() !== req.user.id && req.user.role !== admin) {
    return next(
      new AppError('Not authorized to update review', status.UNAUTHORIZED)
    );
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(status.OK).json({ success: true, data: review });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new AppError(
        `Review with id ${req.params.id} not found`,
        status.NOT_FOUND
      )
    );
  }

  if (review.user.toString() !== req.user.id && req.user.role !== admin) {
    return next(
      new AppError('Not authorized to delete review', status.UNAUTHORIZED)
    );
  }

  await review.remove();

  res.status(status.OK).json({ success: true });
});
