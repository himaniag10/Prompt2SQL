import { z } from 'zod';
import { DatabaseType } from '@prisma/client';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name is too long'),
  description: z.string().optional(),
  databaseType: z.nativeEnum(DatabaseType, {
    errorMap: () => ({ message: 'Invalid database type' })
  })
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name is too long').optional(),
  description: z.string().optional(),
  databaseType: z.nativeEnum(DatabaseType).optional()
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
