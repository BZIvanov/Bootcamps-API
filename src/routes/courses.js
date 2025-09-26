import { Router } from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courses.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';
import { userTypes } from '../constants/index.js';

const router = Router({ mergeParams: true });

router
  .route('/')
  .get(getCourses)
  .post(
    authenticate,
    authorize(userTypes.publisher, userTypes.admin),
    createCourse
  );
router
  .route('/:id')
  .get(getCourse)
  .put(
    authenticate,
    authorize(userTypes.publisher, userTypes.admin),
    updateCourse
  )
  .delete(
    authenticate,
    authorize(userTypes.publisher, userTypes.admin),
    deleteCourse
  );

export default router;
