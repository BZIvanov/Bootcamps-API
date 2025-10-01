import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { HttpError } from '@/utils/httpError.js';
import { UserRole } from '@/constants/user.js';

const authorize =
  (...allowedRoles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        new HttpError(httpStatus.UNAUTHORIZED, 'User not authenticated')
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new HttpError(
          httpStatus.FORBIDDEN,
          'User is not authorized to access this route'
        )
      );
    }

    next();
  };

export default authorize;
