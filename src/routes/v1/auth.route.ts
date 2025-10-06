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
} from '@/controllers/auth.controller.js';
import authenticate from '@/middlewares/authenticate.middleware.js';
import { validateRequest } from '@/middlewares/validateRequest.middleware.js';
import {
  registerUserSchema,
  loginUserSchema,
  updateUserSchema,
  updatePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/validation/users.validation.js';

const router = Router();

router.route('/register').post(validateRequest(registerUserSchema), register);
router.route('/login').post(validateRequest(loginUserSchema), login);
router.route('/logout').post(logout);
router.route('/me').get(authenticate, me);
router
  .route('/update-details')
  .put(authenticate, validateRequest(updateUserSchema), updateUser);
router
  .route('/update-password')
  .put(authenticate, validateRequest(updatePasswordSchema), updatePassword);
router
  .route('/forgot-password')
  .post(validateRequest(forgotPasswordSchema), forgotPassword);
router
  .route('/reset-password/:resettoken')
  .put(validateRequest(resetPasswordSchema), resetPassword);

export default router;
