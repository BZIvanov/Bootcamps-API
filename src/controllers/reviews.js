import httpStatus from 'http-status';
import Review from '../models/review.js';
import Bootcamp from '../models/bootcamp.js';
import Filters from '../utils/filters.js';
import { HttpError } from '../utils/httpError.js';
import { userTypes } from '../constants/user.js';

export const getReviews = async (req, res) => {
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
      .paginate()
      .exec();

    query = filtered.docs;
  }

  const reviews = await query;

  res
    .status(httpStatus.OK)
    .json({ success: true, results: reviews.length, data: reviews });
};

export const getReview = async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!review) {
    return next(
      new HttpError(
        httpStatus.NOT_FOUND,
        `Review with id ${req.params.id} not found`
      )
    );
  }

  res.status(httpStatus.OK).json({ success: true, data: review });
};

export const createReview = async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new HttpError(
        httpStatus.NOT_FOUND,
        `Bootcamp with id ${req.params.bootcampId} not found`
      )
    );
  }

  const review = await Review.create(req.body);

  res.status(httpStatus.CREATED).json({ success: true, data: review });
};

export const updateReview = async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new HttpError(
        httpStatus.NOT_FOUND,
        `Review with id ${req.params.id} not found`
      )
    );
  }

  if (
    review.user.toString() !== req.user.id &&
    req.user.role !== userTypes.ADMIN
  ) {
    return next(
      new HttpError(httpStatus.UNAUTHORIZED, 'Not authorized to update review')
    );
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(httpStatus.OK).json({ success: true, data: review });
};

export const deleteReview = async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new HttpError(
        httpStatus.NOT_FOUND,
        `Review with id ${req.params.id} not found`
      )
    );
  }

  if (
    review.user.toString() !== req.user.id &&
    req.user.role !== userTypes.ADMIN
  ) {
    return next(
      new HttpError(httpStatus.UNAUTHORIZED, 'Not authorized to delete review')
    );
  }

  await review.remove();

  res.status(httpStatus.OK).json({ success: true });
};
