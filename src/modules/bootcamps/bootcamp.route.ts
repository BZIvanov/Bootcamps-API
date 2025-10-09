import { Router } from 'express';
import {
  getBootcamp,
  getBootcamps,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  uploadBootcampImage,
} from '@/modules/bootcamps/bootcamp.controller.js';
import authenticate from '@/middlewares/authenticate.middleware.js';
import authorize from '@/middlewares/authorize.middleware.js';
import { validateRequest } from '@/middlewares/validateRequest.middleware.js';
import { userTypes } from '@/modules/users/user.constants.js';
import {
  bootcampIdParamSchema,
  createBootcampSchema,
  updateBootcampSchema,
} from '@/modules/bootcamps/bootcamp.validation.js';
import coursesRouter from '@/modules/courses/course.route.js';

const router = Router();

// /api/v1/bootcamps/123/courses => this will go to courses router where it will be just '/' with the same method
router.use('/:bootcampId/courses', coursesRouter);

router
  .route('/')
  .get(getBootcamps)
  .post(
    authenticate,
    authorize(userTypes.PUBLISHER, userTypes.ADMIN),
    validateRequest(createBootcampSchema),
    createBootcamp
  );
router
  .route('/:bootcampId')
  .get(getBootcamp)
  .put(
    authenticate,
    authorize(userTypes.PUBLISHER, userTypes.ADMIN),
    validateRequest(updateBootcampSchema),
    updateBootcamp
  )
  .delete(
    authenticate,
    authorize(userTypes.PUBLISHER, userTypes.ADMIN),
    validateRequest(bootcampIdParamSchema),
    deleteBootcamp
  );
router
  .route('/:bootcampId/image')
  .put(
    authenticate,
    authorize(userTypes.PUBLISHER, userTypes.ADMIN),
    validateRequest(bootcampIdParamSchema),
    uploadBootcampImage
  );

export default router;
