import { Router } from 'express';
import authRoutes from './auth.route.js';
import userRoutes from './users.route.js';
import bootcampRoutes from './bootcamps.route.js';
import courseRoutes from './courses.route.js';
import reviewRoutes from './reviews.route.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/bootcamps', bootcampRoutes);
router.use('/courses', courseRoutes);
router.use('/reviews', reviewRoutes);

export default router;
