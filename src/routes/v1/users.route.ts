import { Router } from 'express';
import {
  getUsers,
  getUser,
  deleteUser,
} from '@/controllers/users.controller.js';
import authenticate from '@/middlewares/authenticate.middleware.js';
import authorize from '@/middlewares/authorize.middleware.js';
import { userTypes } from '@/constants/user.constants.js';

const router = Router({ mergeParams: true });

// these two will aplly to all users routes
router.use(authenticate);
router.use(authorize(userTypes.ADMIN));

router.route('/').get(getUsers);
router.route('/:userId').get(getUser).delete(deleteUser);

export default router;
