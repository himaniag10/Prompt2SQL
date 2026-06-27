import { relationshipRepository } from '../repositories/relationship.repository';
import { schemaService } from './schema.service';
import { CreateRelationshipInput, UpdateRelationshipInput } from '../validators/relationship.validator';

export class RelationshipService {
  async createRelationship(userId: string, schemaId: string, data: CreateRelationshipInput) {
    const schema = await schemaService.getSchemaById(userId, schemaId); // verifies ownership
    if (schema.versions.length === 0) {
      throw new Error('Schema has no versions');
    }
    const latestVersionId = schema.versions[0].id;
    
    return relationshipRepository.create(latestVersionId, {
      sourceTable: { connect: { id: data.sourceTableId } },
      sourceColumn: { connect: { id: data.sourceColumnId } },
      targetTable: { connect: { id: data.targetTableId } },
      targetColumn: { connect: { id: data.targetColumnId } },
      relationshipType: data.relationshipType
    });
  }

  async getRelationshipById(userId: string, relationshipId: string) {
    const relationship = await relationshipRepository.findById(relationshipId);
    if (!relationship) throw new Error('Relationship not found');
    
    // Verify user owns the project
    if (relationship.schemaVersion.databaseSchema.project.ownerId !== userId) {
      throw new Error('Unauthorized');
    }
    
    return relationship;
  }

  async updateRelationship(userId: string, relationshipId: string, data: UpdateRelationshipInput) {
    const relationship = await this.getRelationshipById(userId, relationshipId); // verifies ownership
    
    const updateData: any = {};
    if (data.sourceTableId) updateData.sourceTable = { connect: { id: data.sourceTableId } };
    if (data.sourceColumnId) updateData.sourceColumn = { connect: { id: data.sourceColumnId } };
    if (data.targetTableId) updateData.targetTable = { connect: { id: data.targetTableId } };
    if (data.targetColumnId) updateData.targetColumn = { connect: { id: data.targetColumnId } };
    if (data.relationshipType) updateData.relationshipType = data.relationshipType;

    return relationshipRepository.update(relationship.id, updateData);
  }

  async deleteRelationship(userId: string, relationshipId: string) {
    const relationship = await this.getRelationshipById(userId, relationshipId); // verifies ownership
    return relationshipRepository.delete(relationship.id);
  }
}

export const relationshipService = new RelationshipService();
