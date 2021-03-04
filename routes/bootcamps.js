const router = require('express').Router();
const {
  getBootcamp,
  getBootcamps,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require('../controllers/bootcamps');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const coursesRouter = require('./courses');
const reviewsRouter = require('./reviews');

// /api/v1/bootcamps/123/courses => in the course router it will be just '/' with the same method
router.use('/:bootcampId/courses', coursesRouter);
router.use('/:bootcampId/reviews', reviewsRouter);

router
  .route('/')
  .get(getBootcamps)
  .post(authenticate, authorize('publisher', 'admin'), createBootcamp);
router
  .route('/:id')
  .get(getBootcamp)
  .put(authenticate, authorize('publisher', 'admin'), updateBootcamp)
  .delete(authenticate, authorize('publisher', 'admin'), deleteBootcamp);
router
  .route('/:id/photo')
  .put(authenticate, authorize('publisher', 'admin'), bootcampPhotoUpload);
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

module.exports = router;
