import { z } from 'zod';
import { mongoId } from './common.validation.js';

const bootcampIdParamSchema = z.object({
  params: z.object({
    bootcampId: mongoId,
  }),
});

export type BootcampIdParams = z.infer<typeof bootcampIdParamSchema>['params'];

export const createBootcampSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(50),
    description: z.string().min(10).max(500),
    website: z.url().optional(),
    phone: z.string().max(20).optional(),
    address: z.string().min(5),
    careers: z.array(
      z.enum([
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Business',
        'Other',
      ])
    ),
  }),
});

export type CreateBootcampBody = z.infer<typeof createBootcampSchema>['body'];

export const updateBootcampSchema = bootcampIdParamSchema.extend({
  body: z.object({
    name: z.string().min(3).max(50).optional(),
    description: z.string().min(10).max(500).optional(),
    website: z.url().optional(),
    phone: z.string().max(20).optional(),
    address: z.string().min(5).optional(),
    careers: z
      .array(
        z.enum([
          'Web Development',
          'Mobile Development',
          'UI/UX',
          'Data Science',
          'Business',
          'Other',
        ])
      )
      .optional(),
  }),
});

export type UpdateBootcampBody = z.infer<typeof updateBootcampSchema>['body'];
