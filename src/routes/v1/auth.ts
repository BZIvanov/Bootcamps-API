import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateUserDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
} from '@/controllers/auth.js';
import authenticate from '@/middlewares/authenticate.js';
import { validateRequest } from '@/middlewares/validateRequest.js';
import { createUserSchema } from '@/validation/user.js';

const router = Router();

router.route('/register').post(validateRequest(createUserSchema), register);
router.route('/login').post(login);
router.route('/logout').post(logout);
router.route('/me').get(authenticate, getMe);
router.route('/update-details').put(authenticate, updateUserDetails);
router.route('/update-password').put(authenticate, updatePassword);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:resettoken').put(resetPassword);

export default router;
