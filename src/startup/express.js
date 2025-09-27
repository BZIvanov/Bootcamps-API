import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import express from 'express';
import fileupload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import auth from '../routes/auth.js';
import bootcamps from '../routes/bootcamps.js';
import courses from '../routes/courses.js';
import reviews from '../routes/reviews.js';
import users from '../routes/users.js';
import globalError from '../middlewares/global-error.js';
import httpLogger from '../middlewares/httpLogger.js';

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

export default function configureApp(app) {
  app.use(express.json({ limit: '10kb' }));

  app.use(fileupload({ limits: { fileSize: 5 * 1024 * 1024 } })); // 5MB max

  app.use(hpp());
  app.use(helmet());

  app.use(limiter);

  app.use(cors({ origin: process.env.CLIENT_URL || '*' }));

  app.use(cookieParser());

  app.use(httpLogger);

  app.use('/api/v1/auth', auth);
  app.use('/api/v1/bootcamps', bootcamps);
  app.use('/api/v1/courses', courses);
  app.use('/api/v1/reviews', reviews);
  app.use('/api/v1/users', users);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  app.use(express.static(path.join(__dirname, '..', '..', 'public')));

  // Global error handler last
  app.use(globalError);
}
