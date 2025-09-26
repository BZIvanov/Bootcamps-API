import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import express from 'express';
import fileupload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import xss from 'xss-clean';
import auth from '../routes/auth.js';
import bootcamps from '../routes/bootcamps.js';
import courses from '../routes/courses.js';
import reviews from '../routes/reviews.js';
import users from '../routes/users.js';
import globalError from '../middlewares/global-error.js';
import { environment } from '../constants/index.js';

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

export default function startApp(app) {
  if (process.env.NODE_ENV !== environment.production) {
    app.use(morgan('dev'));
  }

  app.use(express.json({ limit: '10kb' }));
  app.use(fileupload());
  app.use(cookieParser());

  // mongo-sanitize, xss-clean and hpp must be included after the json parse middleware
  app.use(mongoSanitize());
  app.use(xss());
  app.use(hpp());
  app.use(helmet());
  app.use(limiter);
  app.use(cors());

  app.use('/api/v1/auth', auth);
  app.use('/api/v1/bootcamps', bootcamps);
  app.use('/api/v1/courses', courses);
  app.use('/api/v1/reviews', reviews);
  app.use('/api/v1/users', users);
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  app.use(express.static(path.join(__dirname, '..', 'public')));
  // globalError has to be the last route
  app.use(globalError);
}
