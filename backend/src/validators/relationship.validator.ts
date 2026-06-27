import { z } from 'zod';
import { RelationshipType } from '@prisma/client';

export const createRelationshipValidator = z.object({
  sourceTableId: z.string().min(1, 'Source table is required'),
  sourceColumnId: z.string().min(1, 'Source column is required'),
  targetTableId: z.string().min(1, 'Target table is required'),
  targetColumnId: z.string().min(1, 'Target column is required'),
  relationshipType: z.nativeEnum(RelationshipType),
});

export const updateRelationshipValidator = createRelationshipValidator.partial();

export type CreateRelationshipInput = z.infer<typeof createRelationshipValidator>;
export type UpdateRelationshipInput = z.infer<typeof updateRelationshipValidator>;
