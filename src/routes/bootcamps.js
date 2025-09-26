import { Router } from 'express';
import {
  getBootcamp,
  getBootcamps,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  bootcampPhotoUpload,
} from '../controllers/bootcamps.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';
import coursesRouter from './courses.js';
import reviewsRouter from './reviews.js';
import { userTypes } from '../constants/index.js';

const router = Router();

// /api/v1/bootcamps/123/courses => this will go to courses router where it will be just '/' with the same method
router.use('/:bootcampId/courses', coursesRouter);
router.use('/:bootcampId/reviews', reviewsRouter);

router
  .route('/')
  .get(getBootcamps)
  .post(
    authenticate,
    authorize(userTypes.publisher, userTypes.admin),
    createBootcamp
  );
router
  .route('/:id')
  .get(getBootcamp)
  .put(
    authenticate,
    authorize(userTypes.publisher, userTypes.admin),
    updateBootcamp
  )
  .delete(
    authenticate,
    authorize(userTypes.publisher, userTypes.admin),
    deleteBootcamp
  );
router
  .route('/:id/photo')
  .put(
    authenticate,
    authorize(userTypes.publisher, userTypes.admin),
    bootcampPhotoUpload
  );

export default router;
