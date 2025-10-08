import httpStatus from 'http-status';
import type { IReview } from '@/models/review.model.js';
import Review from '@/models/review.model.js';
import type { QueryString } from '@/utils/filters.util.js';
import Filters from '@/utils/filters.util.js';
import { getPaginationMeta } from '@/utils/pagination.util.js';
import { HttpError } from '@/utils/httpError.util.js';
import type { IUser } from '@/models/user.model.js';
import Bootcamp from '@/models/bootcamp.model.js';
import { userTypes } from '@/constants/user.constants.js';
import type {
  CreateReviewBody,
  UpdateReviewBody,
} from '@/validation/reviews.validation.js';

export const getReviewsService = async (
  query: QueryString,
  bootcampId?: string
) => {
  if (bootcampId) {
    // Get all courses for a specific bootcamp. TODO: Maybe it should for a course, not bootcamp?
    const reviews = await Review.find({ bootcamp: bootcampId });
    const meta = getPaginationMeta(reviews.length, query);

    return { reviews, meta };
  }

  const filters = new Filters(
    Review.find().populate({ path: 'bootcamp', select: 'name description' }),
    query
  )
    .filter()
    .select()
    .sort()
    .paginate();

  const reviews = await filters.exec();
  const total = await Review.countDocuments();
  const meta = getPaginationMeta(total, query);

  return { reviews, meta };
};

export const getReviewByIdService = async (
  reviewId: string
): Promise<IReview> => {
  const review = await Review.findById(reviewId).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!review) {
    throw new HttpError(
      httpStatus.NOT_FOUND,
      `Review with id: ${reviewId} not found`
    );
  }

  return review;
};

export const createReviewService = async (
  bootcampId: string,
  user: IUser,
  data: CreateReviewBody
): Promise<IReview> => {
  const bootcamp = await Bootcamp.findById(bootcampId);

  if (!bootcamp) {
    throw new HttpError(
      httpStatus.NOT_FOUND,
      `Bootcamp with id ${bootcampId} not found`
    );
  }

  const review = await Review.create({
    ...data,
    bootcamp: bootcampId,
    user: user.id,
  });

  return review;
};

export const updateReviewService = async (
  reviewId: string,
  user: IUser,
  data: UpdateReviewBody
): Promise<IReview> => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new HttpError(
      httpStatus.NOT_FOUND,
      `Review with id ${reviewId} not found`
    );
  }

  if (review.user.toString() !== user.id && user.role !== userTypes.ADMIN) {
    throw new HttpError(
      httpStatus.UNAUTHORIZED,
      'Not authorized to update review'
    );
  }

  const updatedReview = await Review.findByIdAndUpdate(reviewId, data, {
    new: true,
    runValidators: true,
  });

  return updatedReview!;
};

export const deleteReviewService = async (
  reviewId: string,
  user: IUser
): Promise<void> => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new HttpError(
      httpStatus.NOT_FOUND,
      `Review with id ${reviewId} not found`
    );
  }

  if (review.user.toString() !== user.id && user.role !== userTypes.ADMIN) {
    throw new HttpError(
      httpStatus.UNAUTHORIZED,
      'Not authorized to delete review'
    );
  }

  // Use deleteOne() to trigger pre/post hooks defined on the schema
  await review.deleteOne();
};
