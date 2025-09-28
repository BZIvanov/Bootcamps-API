import { Router } from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/users.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';
import { userTypes } from '../constants/user.js';

const router = Router({ mergeParams: true });

// these two will aplly to all our users routes
router.use(authenticate);
router.use(authorize(userTypes.ADMIN));

router.route('/').get(getUsers).post(createUser);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

export default router;
