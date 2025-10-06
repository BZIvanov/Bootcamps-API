import type { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { HttpError } from '@/utils/httpError.util.js';
import { isProd } from '@/config/env.config.js';
import logger from '@/config/logger.config.js';

interface MongooseValidationError extends Error {
  name: 'ValidationError';
  errors: Record<string, { message: string }>;
}

interface MongooseCastError extends Error {
  name: 'CastError';
  kind?: string;
  value?: unknown;
}

interface MongooseDuplicateKeyError extends Error {
  code: 11000;
  keyValue?: Record<string, unknown>;
}

type CustomError =
  | HttpError
  | MongooseValidationError
  | MongooseCastError
  | MongooseDuplicateKeyError
  | Error;

// ⚠️ Must have 4 args or Express won’t treat this as error middleware
export default function errorHandler(
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  let error: HttpError;

  if (err instanceof HttpError) {
    error = err;
  } else if (err.name === 'CastError') {
    error = new HttpError(httpStatus.NOT_FOUND, 'Resource not found');
  } else if ((err as MongooseDuplicateKeyError).code === 11000) {
    error = new HttpError(httpStatus.BAD_REQUEST, 'Duplicate field value');
  } else if (err.name === 'ValidationError') {
    const message = Object.values((err as MongooseValidationError).errors).map(
      (val) => val.message
    );
    error = new HttpError(httpStatus.BAD_REQUEST, message.join(', '));
  } else {
    error = new HttpError(
      httpStatus.INTERNAL_SERVER_ERROR,
      err.message || 'Server error'
    );
  }

  if (!isProd) {
    logger.error({ msg: err.message, stack: err.stack, err });
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    details: error.details ?? undefined,
  });
}
