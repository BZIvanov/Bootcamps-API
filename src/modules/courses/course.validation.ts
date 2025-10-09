import { z } from 'zod';
import { mongoId } from '@/shared/validation/index.js';

export const courseIdParamSchema = z.object({
  params: z.object({
    courseId: mongoId,
  }),
});

export type CourseIdParams = z.infer<typeof courseIdParamSchema>['params'];

export const createCourseSchema = z.object({
  params: z.object({
    bootcampId: mongoId,
  }),
  body: z
    .object({
      title: z.string().min(2),
      description: z.string().min(10),
      weeks: z.number().positive(),
      tuition: z.number().positive(),
      minimumSkill: z.enum(['beginner', 'intermediate', 'advanced']),
    })
    .strict(),
});

export type CreateCourseParams = z.infer<typeof createCourseSchema>['params'];
export type CreateCourseBody = z.infer<typeof createCourseSchema>['body'];

export const updateCourseSchema = z.object({
  params: z.object({
    courseId: mongoId,
  }),
  body: z
    .object({
      title: z.string().min(2).optional(),
      description: z.string().min(10).optional(),
      weeks: z.number().positive().optional(),
      tuition: z.number().positive().optional(),
      minimumSkill: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    })
    .strict(),
});

export type UpdateCourseParams = z.infer<typeof updateCourseSchema>['params'];
export type UpdateCourseBody = z.infer<typeof updateCourseSchema>['body'];
