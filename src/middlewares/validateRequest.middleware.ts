import { ZodObject, ZodError, ZodRawShape } from 'zod';
import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { HttpError } from '@/utils/httpError.util.js';

export const validateRequest =
  (schema: ZodObject<ZodRawShape>) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(
          new HttpError(httpStatus.BAD_REQUEST, 'Validation failed', err.issues)
        );
      }

      return next(err);
    }
  };
