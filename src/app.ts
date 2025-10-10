import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import express from 'express';
import fileupload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import { setupSwagger } from '@/config/swagger.config.js';
import apiRoutes from '@/routes/index.js';
import rateLimiter from '@/middlewares/rateLimiter.middleware.js';
import httpLogger from '@/middlewares/httpLogger.middleware.js';
import errorHandler from '@/middlewares/errorHandler.middleware.js';
import { MAX_FILE_SIZE } from '@/constants/file.constants.js';

const app = express();

app.use(express.json({ limit: '10kb' }));

app.use(fileupload({ limits: { fileSize: MAX_FILE_SIZE } }));

app.use(hpp());
app.use(helmet());

// --- Rate limiter ---
app.use(rateLimiter);

// --- CORS & cookies ---
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(cookieParser());

// --- HTTP request logging ---
app.use(httpLogger);

// --- Health check (ops-only endpoint) ---
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

// --- API routes ---
app.use('/api', apiRoutes);

// --- Swagger docs (before error handler) ---
setupSwagger(app);

// --- Serve static files ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- Global error handler (last) ---
app.use(errorHandler);

export default app;
