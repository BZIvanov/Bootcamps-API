import type { Logger } from 'pino';
import type { FileArray } from 'express-fileupload';
import type { IUser } from '@/modules/users/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      log: Logger;
      files?: FileArray;
    }
  }
}
