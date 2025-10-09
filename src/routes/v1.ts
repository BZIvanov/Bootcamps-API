import { Router } from 'express';
import authRoutes from '@/modules/auth/auth.route.js';
import userRoutes from '@/modules/users/user.route.js';
import bootcampRoutes from '@/modules/bootcamps/bootcamp.route.js';
import courseRoutes from '@/modules/courses/course.route.js';
import reviewRoutes from '@/modules/reviews/review.route.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/bootcamps', bootcampRoutes);
router.use('/courses', courseRoutes);
router.use('/reviews', reviewRoutes);

export default router;
