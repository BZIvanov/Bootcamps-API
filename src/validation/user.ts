import { z } from 'zod';
import { userTypes, UserRole } from '@/constants/user.js';

const userRoles = Object.values(userTypes) as UserRole[];

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(8),
    role: z.enum(userRoles).optional(),
  }),
});
