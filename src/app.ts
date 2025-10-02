import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import express from 'express';
import fileupload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { setupSwagger } from '@/config/swagger.js';
import apiRoutes from '@/routes/index.js';
import httpLogger from '@/middlewares/httpLogger.js';
import errorHandler from '@/middlewares/errorHandler.js';

const app = express();

app.use(express.json({ limit: '10kb' }));

app.use(fileupload({ limits: { fileSize: 5 * 1024 * 1024 } })); // 5MB max

app.use(hpp());
app.use(helmet());

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));

app.use(cookieParser());

app.use(httpLogger);

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use('/api', apiRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

// Global error handler last
app.use(errorHandler);

setupSwagger(app);

export default app;
