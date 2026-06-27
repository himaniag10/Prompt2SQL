import { z } from 'zod';

export const createTableValidator = z.object({
  name: z.string().min(1, 'Table name is required').max(100, 'Table name is too long'),
  description: z.string().optional(),
});

export const updateTableValidator = z.object({
  name: z.string().min(1, 'Table name is required').max(100, 'Table name is too long').optional(),
  description: z.string().optional(),
});

export type CreateTableInput = z.infer<typeof createTableValidator>;
export type UpdateTableInput = z.infer<typeof updateTableValidator>;
