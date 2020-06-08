const router = require('express').Router();
const {
  register,
  login,
  getMe,
  protect,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/me').get(protect, getMe);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:resettoken').put(resetPassword);

module.exports = router;
