import type { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import Bootcamp from '@/models/bootcamp.model.js';
import Review from '@/models/review.model.js';
import Filters from '@/utils/filters.util.js';
import { HttpError } from '@/utils/httpError.util.js';
import { userTypes } from '@/constants/user.constants.js';
import { parseQuery } from '@/utils/parseQuery.util.js';

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Review management endpoints
 */

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Get all reviews
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: List of reviews
 *
 * /bootcamps/{bootcampId}/reviews:
 *   get:
 *     summary: Get all reviews for a bootcamp
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID
 *     responses:
 *       200:
 *         description: List of reviews for a specific bootcamp
 */
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

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: Get a single review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review found
 *       404:
 *         description: Review not found
 */
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

/**
 * @swagger
 * /bootcamps/{bootcampId}/reviews:
 *   post:
 *     summary: Create a review for a bootcamp
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - text
 *               - rating
 *             properties:
 *               title:
 *                 type: string
 *               text:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 10
 *     responses:
 *       201:
 *         description: Review created successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bootcamp not found
 */
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

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               text:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 10
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
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

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
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
