import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

// 1️⃣ Determine NODE_ENV
const nodeEnv = process.env.NODE_ENV?.toLowerCase() || 'development';

// 2️⃣ Resolve env file path
const basePath = path.resolve(process.cwd());
const envFileName = `.env.${nodeEnv}`;
const envPath = fs.existsSync(path.join(basePath, envFileName))
  ? path.join(basePath, envFileName)
  : path.join(basePath, '.env');

// 3️⃣ Load env file
dotenv.config({ path: envPath, quiet: true });

if (nodeEnv !== 'production') {
  console.log(`Loaded environment file: ${path.basename(envPath)}`);
}

// 4️⃣ Define env schema
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3100),

  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('debug'),

  DB_URI: z.string().nonempty('DB_URI is required'),

  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters'),

  SMTP_HOST: z.string().nonempty('SMTP_HOST is required'),
  SMTP_PORT: z.coerce.number().default(2525),
  SMTP_USERNAME: z.string().nonempty('SMTP_USERNAME is required'),
  SMTP_PASSWORD: z.string().nonempty('SMTP_PASSWORD is required'),
  FROM_EMAIL: z.email('FROM_EMAIL must be a valid email address'),
  FROM_NAME: z.string().nonempty('FROM_NAME is required'),

  CLIENT_URL: z.url('CLIENT_URL must be a valid URL'),
});

// 5️⃣ Parse and validate
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:');
  console.table(
    parsed.error.issues.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }))
  );
  process.exit(1);
}

// 6️⃣ Export validated ENV

const ENVIRONMENTS = Object.freeze({
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
});

export const NODE_ENV = parsed.data.NODE_ENV;

export const isDev = NODE_ENV === ENVIRONMENTS.DEVELOPMENT;
export const isProd = NODE_ENV === ENVIRONMENTS.PRODUCTION;
export const isTest = NODE_ENV === ENVIRONMENTS.TEST;

const ENV = {
  ...parsed.data,
  isDev,
  isProd,
  isTest,
};

export default ENV;
