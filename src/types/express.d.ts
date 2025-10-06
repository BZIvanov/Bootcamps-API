import type { Logger } from 'pino';
import { FileArray } from 'express-fileupload';
import { IUser } from '@/models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      log: Logger;
      files?: FileArray;
    }
  }
}
