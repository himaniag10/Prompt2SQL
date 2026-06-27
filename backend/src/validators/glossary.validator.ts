import { z } from 'zod';

export const createGlossaryValidator = z.object({
  term: z.string().min(1, 'Term is required').max(100, 'Term is too long'),
  definition: z.string().min(1, 'Definition is required'),
  example: z.string().optional(),
});

export const updateGlossaryValidator = z.object({
  term: z.string().min(1, 'Term is required').max(100, 'Term is too long').optional(),
  definition: z.string().min(1, 'Definition is required').optional(),
  example: z.string().optional(),
});

export type CreateGlossaryInput = z.infer<typeof createGlossaryValidator>;
export type UpdateGlossaryInput = z.infer<typeof updateGlossaryValidator>;
