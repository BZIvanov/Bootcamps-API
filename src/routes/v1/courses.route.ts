import { Router } from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from '@/controllers/courses.controller.js';
import authenticate from '@/middlewares/authenticate.middleware.js';
import authorize from '@/middlewares/authorize.middleware.js';
import { userTypes } from '@/constants/user.constants.js';
import { validateRequest } from '@/middlewares/validateRequest.middleware.js';
import { createCourseSchema } from '@/validation/courses.validation.js';

const router = Router({ mergeParams: true });

router
  .route('/')
  .get(getCourses)
  .post(
    authenticate,
    authorize(userTypes.PUBLISHER, userTypes.ADMIN),
    validateRequest(createCourseSchema),
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
