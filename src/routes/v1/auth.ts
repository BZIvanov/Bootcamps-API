import { Router } from 'express';
import {
  register,
  login,
  logout,
  me,
  updateUser,
  updatePassword,
  forgotPassword,
  resetPassword,
} from '@/controllers/auth.js';
import authenticate from '@/middlewares/authenticate.js';
import { validateRequest } from '@/middlewares/validateRequest.js';
import {
  registerUserSchema,
  loginUserSchema,
  updateUserSchema,
} from '@/validation/user.js';

const router = Router();

router.route('/register').post(validateRequest(registerUserSchema), register);
router.route('/login').post(validateRequest(loginUserSchema), login);
router.route('/logout').post(logout);
router.route('/me').get(authenticate, me);
router
  .route('/update-details')
  .put(authenticate, validateRequest(updateUserSchema), updateUser);
router.route('/update-password').put(authenticate, updatePassword);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:resettoken').put(resetPassword);

export default router;
