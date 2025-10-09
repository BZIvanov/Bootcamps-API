import { Router } from 'express';
import {
  getUsers,
  getUser,
  deleteUser,
} from '@/modules/users/user.controller.js';
import authenticate from '@/middlewares/authenticate.middleware.js';
import authorize from '@/middlewares/authorize.middleware.js';
import { userTypes } from '@/modules/users/user.constants.js';
import { validateRequest } from '@/middlewares/validateRequest.middleware.js';
import { userIdParamSchema } from '@/modules/users/user.validation.js';

const router = Router({ mergeParams: true });

// these two will aplly to all users routes
router.use(authenticate);
router.use(authorize(userTypes.ADMIN));

router.route('/').get(getUsers);
router
  .route('/:userId')
  .get(validateRequest(userIdParamSchema), getUser)
  .delete(validateRequest(userIdParamSchema), deleteUser);

export default router;
