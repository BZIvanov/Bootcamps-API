import type { Logger } from 'pino';
import type { FileArray } from 'express-fileupload';
import type { IUser } from '@/models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      log: Logger;
      files?: FileArray;
    }
  }
}
