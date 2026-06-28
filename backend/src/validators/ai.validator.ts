import { z } from 'zod';

export const contextResolutionSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  projectId: z.string().uuid('Invalid project ID').optional(),
  schemaId: z.string().uuid('Invalid schema ID').optional(),
});

export type ContextResolutionInput = z.infer<typeof contextResolutionSchema>;
