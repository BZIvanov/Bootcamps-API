import { Router } from 'express';
import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} from '@/controllers/reviews.controller.js';
import authenticate from '@/middlewares/authenticate.middleware.js';
import authorize from '@/middlewares/authorize.middleware.js';
import { userTypes } from '@/constants/user.constants.js';
import { validateRequest } from '@/middlewares/validateRequest.middleware.js';
import {
  createReviewSchema,
  reviewIdParamSchema,
  updateReviewSchema,
} from '@/validation/reviews.validation.js';

const router = Router({ mergeParams: true });

router
  .route('/')
  .get(getReviews)
  .post(
    authenticate,
    authorize(userTypes.USER, userTypes.ADMIN),
    validateRequest(createReviewSchema),
    createReview
  );
router
  .route('/:reviewId')
  .get(getReview)
  .put(
    authenticate,
    authorize(userTypes.USER, userTypes.ADMIN),
    validateRequest(updateReviewSchema),
    updateReview
  )
  .delete(
    authenticate,
    authorize(userTypes.USER, userTypes.ADMIN),
    validateRequest(reviewIdParamSchema),
    deleteReview
  );

export default router;
