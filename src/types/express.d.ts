import type { Logger } from 'pino';
import { IUser } from '@/models/user';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      log: Logger;
    }
  }
}
