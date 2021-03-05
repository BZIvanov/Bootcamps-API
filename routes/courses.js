const router = require('express').Router({ mergeParams: true });
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router
  .route('/')
  .get(getCourses)
  .post(authenticate, authorize('publisher', 'admin'), createCourse);
router
  .route('/:id')
  .get(getCourse)
  .put(authenticate, authorize('publisher', 'admin'), updateCourse)
  .delete(authenticate, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;
