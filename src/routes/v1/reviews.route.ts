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

const router = Router({ mergeParams: true });

router
  .route('/')
  .get(getReviews)
  .post(authenticate, authorize(userTypes.USER, userTypes.ADMIN), createReview);
router
  .route('/:id')
  .get(getReview)
  .put(authenticate, authorize(userTypes.USER, userTypes.ADMIN), updateReview)
  .delete(
    authenticate,
    authorize(userTypes.USER, userTypes.ADMIN),
    deleteReview
  );

export default router;
