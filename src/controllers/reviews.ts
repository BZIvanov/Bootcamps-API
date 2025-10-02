import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import Review from '@/models/review.js';
import Bootcamp from '@/models/bootcamp.js';
import Filters from '@/utils/filters.js';
import { HttpError } from '@/utils/httpError.js';
import { userTypes } from '@/constants/user.js';
import { parseQuery } from '@/utils/parseQuery.js';

export const getReviews = async (req: Request, res: Response) => {
  const { bootcampId } = req.params;

  const query = parseQuery(req.query);

  let reviewsQuery;

  if (bootcampId) {
    reviewsQuery = Review.find({ bootcamp: bootcampId });
  } else {
    const filters = new Filters(
      Review.find().populate({
        path: 'bootcamp',
        select: 'name description',
      }),
      query
    )
      .filter()
      .select()
      .sort()
      .paginate();

    reviewsQuery = filters.exec();
  }

  const reviews = await reviewsQuery;

  const total = reviews.length;
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '10', 10);

  res.status(httpStatus.OK).json({
    success: true,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: reviews,
  });
};

export const getReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

export const createReview = async (
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
        `Bootcamp with id ${req.params.bootcampId} not found`
      )
    );
  }

  const review = await Review.create(req.body);

  res.status(httpStatus.CREATED).json({ success: true, data: review });
};

export const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

  await review.deleteOne();

  res.status(httpStatus.OK).json({ success: true });
};
