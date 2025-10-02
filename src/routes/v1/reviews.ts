import { Router } from 'express';
import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} from '@/controllers/reviews.js';
import authenticate from '@/middlewares/authenticate.js';
import authorize from '@/middlewares/authorize.js';
import { userTypes } from '@/constants/user.js';

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
