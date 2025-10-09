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
import {
  courseIdParamSchema,
  createCourseSchema,
  updateCourseSchema,
} from '@/validation/courses.validation.js';
import reviewsRouter from './reviews.route.js';

const router = Router({ mergeParams: true });

// /api/v1/bootcamps/123/reviews => this will go to reviews router where it will be just '/' with the same method
router.use('/:bootcampId/reviews', reviewsRouter);

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
  .route('/:courseId')
  .get(getCourse)
  .put(
    authenticate,
    authorize(userTypes.PUBLISHER, userTypes.ADMIN),
    validateRequest(updateCourseSchema),
    updateCourse
  )
  .delete(
    authenticate,
    authorize(userTypes.PUBLISHER, userTypes.ADMIN),
    validateRequest(courseIdParamSchema),
    deleteCourse
  );

export default router;
