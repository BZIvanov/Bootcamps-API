import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { parseQuery } from '@/utils/parseQuery.util.js';
import * as reviewsService from '@/services/reviews.service.js';
import type {
  CreateReviewBody,
  CreateReviewParams,
  ReviewIdParams,
  UpdateReviewBody,
  UpdateReviewParams,
} from '@/validation/reviews.validation.js';

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
  const query = parseQuery(req.query);

  const { reviews, meta } = await reviewsService.getReviews(
    query,
    req.params.bootcampId
  );

  res.status(httpStatus.OK).json({
    success: true,
    ...meta,
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
  req: Request<ReviewIdParams>,
  res: Response
) => {
  const review = await reviewsService.getReviewById(req.params.reviewId);

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
  req: Request<CreateReviewParams, unknown, CreateReviewBody>,
  res: Response
) => {
  const review = await reviewsService.createReview(
    req.params.bootcampId,
    req.user,
    req.body
  );

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
  req: Request<UpdateReviewParams, unknown, UpdateReviewBody>,
  res: Response
) => {
  const review = await reviewsService.updateReview(
    req.params.reviewId,
    req.user,
    req.body
  );

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
  req: Request<ReviewIdParams>,
  res: Response
) => {
  await reviewsService.deleteReview(req.params.reviewId, req.user);

  res.status(httpStatus.OK).json({ success: true });
};
