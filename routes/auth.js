const router = require('express').Router();
const {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/auth');
const authenticate = require('../middlewares/authenticate');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/me').get(authenticate, getMe);
router.route('/update-details').put(authenticate, updateDetails);
router.route('/update-password').put(authenticate, updatePassword);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:resettoken').put(resetPassword);

module.exports = router;
