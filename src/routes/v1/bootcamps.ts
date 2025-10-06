import { Router } from 'express';
import {
  getBootcamp,
  getBootcamps,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  bootcampPhotoUpload,
} from '@/controllers/bootcamps.js';
import authenticate from '@/middlewares/authenticate.js';
import authorize from '@/middlewares/authorize.js';
import { validateRequest } from '@/middlewares/validateRequest.js';
import { userTypes } from '@/constants/user.js';
import { createBootcampSchema } from '@/validation/bootcamp.js';
import coursesRouter from './courses.js';
import reviewsRouter from './reviews.js';

const router = Router();

// /api/v1/bootcamps/123/courses => this will go to courses router where it will be just '/' with the same method
router.use('/:bootcampId/courses', coursesRouter);
router.use('/:bootcampId/reviews', reviewsRouter);

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
  .route('/:id')
  .get(getBootcamp)
  .put(
    authenticate,
    authorize(userTypes.PUBLISHER, userTypes.ADMIN),
    updateBootcamp
  )
  .delete(
    authenticate,
    authorize(userTypes.PUBLISHER, userTypes.ADMIN),
    deleteBootcamp
  );
router
  .route('/:id/photo')
  .put(
    authenticate,
    authorize(userTypes.PUBLISHER, userTypes.ADMIN),
    bootcampPhotoUpload
  );

export default router;
