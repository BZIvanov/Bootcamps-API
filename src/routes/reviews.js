import { Router } from 'express';
import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviews.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';
import { userTypes } from '../constants/index.js';

const router = Router({ mergeParams: true });

router
  .route('/')
  .get(getReviews)
  .post(authenticate, authorize(userTypes.user, userTypes.admin), createReview);
router
  .route('/:id')
  .get(getReview)
  .put(authenticate, authorize(userTypes.user, userTypes.admin), updateReview)
  .delete(
    authenticate,
    authorize(userTypes.user, userTypes.admin),
    deleteReview
  );

export default router;
