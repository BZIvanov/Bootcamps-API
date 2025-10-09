import { z } from 'zod';
import { mongoId } from './common.validation.js';

export const reviewIdParamSchema = z.object({
  params: z.object({
    reviewId: mongoId,
  }),
});

export type ReviewIdParams = z.infer<typeof reviewIdParamSchema>['params'];

export const createReviewSchema = z.object({
  params: z.object({
    courseId: mongoId,
  }),
  body: z
    .object({
      title: z.string().min(3, 'Title must be at least 3 characters long'),
      text: z
        .string()
        .min(10, 'Review text must be at least 10 characters long'),
      rating: z.number().min(1).max(10),
    })
    .strict(),
});

export type CreateReviewParams = z.infer<typeof createReviewSchema>['params'];
export type CreateReviewBody = z.infer<typeof createReviewSchema>['body'];

export const updateReviewSchema = z.object({
  params: z.object({
    reviewId: mongoId,
  }),
  body: z
    .object({
      title: z.string().min(3).optional(),
      text: z.string().min(10).optional(),
      rating: z.number().min(1).max(10).optional(),
    })
    .strict(),
});

export type UpdateReviewParams = z.infer<typeof updateReviewSchema>['params'];
export type UpdateReviewBody = z.infer<typeof updateReviewSchema>['body'];
