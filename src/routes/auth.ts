import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  // updateDetails,
  // forgotPassword,
  // resetPassword,
  // updatePassword,
} from '@/controllers/auth.js';
import authenticate from '@/middlewares/authenticate.js';

const router = Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').post(logout);
router.route('/me').get(authenticate, getMe);
// router.route('/update-details').put(authenticate, updateDetails);
// router.route('/update-password').put(authenticate, updatePassword);
// router.route('/forgot-password').post(forgotPassword);
// router.route('/reset-password/:resettoken').put(resetPassword);

export default router;
