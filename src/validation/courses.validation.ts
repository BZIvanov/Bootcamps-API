import { z } from 'zod';
import { mongoId } from './common.validation.js';

const courseIdParamSchema = z.object({
  params: z.object({
    courseId: mongoId,
  }),
});

export type CourseIdParams = z.infer<typeof courseIdParamSchema>['params'];

export const createCourseSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().min(10),
    weeks: z.number().positive(),
    tuition: z.number().positive(),
    minimumSkill: z.enum(['beginner', 'intermediate', 'advanced']),
  }),
});

export type CreateCourseBody = z.infer<typeof createCourseSchema>['body'];

export const updateCourseSchema = courseIdParamSchema.extend({
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().min(10).optional(),
    weeks: z.number().positive().optional(),
    tuition: z.number().positive().optional(),
    minimumSkill: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  }),
});

export type UpdateCourseBody = z.infer<typeof updateCourseSchema>['body'];
