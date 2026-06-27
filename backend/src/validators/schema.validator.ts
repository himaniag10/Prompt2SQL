import { z } from 'zod';

export const createSchemaValidator = z.object({
  name: z.string().min(1, 'Schema name is required').max(100, 'Schema name is too long'),
  description: z.string().optional(),
});

export const updateSchemaValidator = z.object({
  name: z.string().min(1, 'Schema name is required').max(100, 'Schema name is too long').optional(),
  description: z.string().optional(),
});

export type CreateSchemaInput = z.infer<typeof createSchemaValidator>;
export type UpdateSchemaInput = z.infer<typeof updateSchemaValidator>;
