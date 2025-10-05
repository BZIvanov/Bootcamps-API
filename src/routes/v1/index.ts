import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './user.js';
import bootcampRoutes from './bootcamps.js';
import courseRoutes from './courses.js';
import reviewRoutes from './reviews.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/bootcamps', bootcampRoutes);
router.use('/courses', courseRoutes);
router.use('/reviews', reviewRoutes);

export default router;
