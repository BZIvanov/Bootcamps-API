import { z } from 'zod';

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

export type CreateBootcampInput = z.infer<typeof createBootcampSchema>['body'];
