const router = require('express').Router();
const {
  register,
  login,
  getMe,
  updateDetails,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/auth');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/me').get(protect, getMe);
router.route('/update-details').put(protect, updateDetails);
router.route('/forgot-password').post(forgotPassword);
router.route('/update-password').put(protect, updatePassword);
router.route('/reset-password/:resettoken').put(resetPassword);

module.exports = router;
