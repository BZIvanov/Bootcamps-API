import { z } from 'zod';

export const createCourseSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().min(10),
    weeks: z.number().positive(),
    tuition: z.number().positive(),
    minimumSkill: z.enum(['beginner', 'intermediate', 'advanced']),
  }),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>['body'];
