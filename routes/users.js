const router = require('express').Router({ mergeParams: true });
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/users');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

// these two will aplly to all our users routes
router.use(authenticate);
router.use(authorize('admin'));

router.route('/').get(getUsers).post(createUser);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
