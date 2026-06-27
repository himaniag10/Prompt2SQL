import { z } from 'zod';

export const createColumnValidator = z.object({
  name: z.string().min(1, 'Column name is required').max(100),
  datatype: z.string().min(1, 'Data type is required'),
  nullable: z.boolean().default(false),
  primaryKey: z.boolean().default(false),
  foreignKey: z.boolean().default(false),
  unique: z.boolean().default(false),
  defaultValue: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const updateColumnValidator = createColumnValidator.partial();

export type CreateColumnInput = z.infer<typeof createColumnValidator>;
export type UpdateColumnInput = z.infer<typeof updateColumnValidator>;
