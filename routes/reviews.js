const router = require('express').Router({ mergeParams: true });
const { getReviews, getReview, addReview } = require('../controllers/reviews');
const { protect, authorize } = require('../controllers/auth');

router
  .route('/')
  .get(getReviews)
  .post(protect, authorize('user', 'admin'), addReview);

router.route('/:id').get(getReview);

module.exports = router;
