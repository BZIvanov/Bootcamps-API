import { z } from 'zod';
import type { UserRole } from '@/constants/user.constants.js';
import { userTypes } from '@/constants/user.constants.js';

const userRoles = Object.values(userTypes) as UserRole[];

export const registerUserSchema = z.object({
  body: z.object({
    username: z.string().min(2),
    email: z.email(),
    password: z.string().min(8),
    role: z.enum(userRoles).optional(),
  }),
});

export type RegisterUserBody = z.infer<typeof registerUserSchema>['body'];

export const loginUserSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(8),
  }),
});

export type LoginUserBody = z.infer<typeof loginUserSchema>['body'];

export const updateUserSchema = z.object({
  body: z
    .object({
      username: z.string().min(2).optional(),
      email: z.email().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export type UpdateUserBody = z.infer<typeof updateUserSchema>['body'];

export const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string()
      .min(8, 'Current password must be at least 8 characters'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters'),
  }),
});

export type UpdatePasswordBody = z.infer<typeof updatePasswordSchema>['body'];

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.email('A valid email is required'),
  }),
});

export type ForgotPasswordBody = z.infer<typeof forgotPasswordSchema>['body'];

export const resetPasswordSchema = z.object({
  params: z.object({
    resettoken: z.string().min(1, 'Reset token is required'),
  }),
  body: z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export type ResetPasswordParams = z.infer<typeof resetPasswordSchema>['params'];
export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>['body'];
