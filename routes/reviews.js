const router = require('express').Router({ mergeParams: true });
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviews');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router
  .route('/')
  .get(getReviews)
  .post(authenticate, authorize('user', 'admin'), addReview);
router
  .route('/:id')
  .get(getReview)
  .put(authenticate, authorize('user', 'admin'), updateReview)
  .delete(authenticate, authorize('user', 'admin'), deleteReview);

module.exports = router;
