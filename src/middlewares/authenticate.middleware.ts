import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import jwt, { Secret } from 'jsonwebtoken';
import { HttpError } from '@/utils/httpError.util.js';
import User, { IUser } from '@/models/user.model.js';

interface JwtPayload {
  id: string;
}

export default async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    let token: string | undefined;

    // We have two authentication types jwt token in a header or a cookie, you can comment out the one you don't need
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(
        new HttpError(
          httpStatus.UNAUTHORIZED,
          'You are not logged in! Please log in to get access.'
        )
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as Secret
    ) as JwtPayload;

    const currentUser: IUser | null = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new HttpError(httpStatus.UNAUTHORIZED, 'User not found'));
    }

    req.user = currentUser;
    next();
  } catch {
    next(
      new HttpError(
        httpStatus.UNAUTHORIZED,
        'Authentication failed, please log in again.'
      )
    );
  }
}
