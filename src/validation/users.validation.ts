import { z } from 'zod';
import { mongoId } from './common.validation.js';

export const userIdParamSchema = z.object({
  params: z.object({
    userId: mongoId,
  }),
});

export type UserIdParams = z.infer<typeof userIdParamSchema>['params'];
