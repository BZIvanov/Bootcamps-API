import { Router } from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from '@/controllers/courses.js';
import authenticate from '@/middlewares/authenticate.js';
import authorize from '@/middlewares/authorize.js';
import { userTypes } from '@/constants/user.js';

const router = Router({ mergeParams: true });

router
  .route('/')
  .get(getCourses)
  .post(
    authenticate,
    authorize(userTypes.PUBLISHER, userTypes.ADMIN),
    createCourse
  );
router
  .route('/:id')
  .get(getCourse)
  .put(
    authenticate,
    authorize(userTypes.PUBLISHER, userTypes.ADMIN),
    updateCourse
  )
  .delete(
    authenticate,
    authorize(userTypes.PUBLISHER, userTypes.ADMIN),
    deleteCourse
  );

export default router;
