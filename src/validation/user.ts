import { z } from 'zod';
import { userTypes, UserRole } from '@/constants/user.js';

const userRoles = Object.values(userTypes) as UserRole[];

export const registerUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(8),
    role: z.enum(userRoles).optional(),
  }),
});

export type CreateUserInput = z.infer<typeof registerUserSchema>['body'];

export const loginUserSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(8),
  }),
});

export type LoginUserInput = z.infer<typeof loginUserSchema>['body'];

export const updateUserSchema = z.object({
  body: z
    .object({
      name: z.string().min(2).optional(),
      email: z.email().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
