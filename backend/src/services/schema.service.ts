import { schemaRepository } from '../repositories/schema.repository';
import { projectService } from './project.service';
import { CreateSchemaInput, UpdateSchemaInput } from '../validators/schema.validator';

export class SchemaService {
  async createSchema(userId: string, projectId: string, data: CreateSchemaInput) {
    // Verify user owns the project
    await projectService.getProjectById(userId, projectId);
    return schemaRepository.create(projectId, data, userId);
  }

  async getSchemasByProjectId(userId: string, projectId: string) {
    // Verify user owns the project
    await projectService.getProjectById(userId, projectId);
    return schemaRepository.findAllByProjectId(projectId);
  }

  async getSchemaById(userId: string, schemaId: string) {
    const schema = await schemaRepository.findById(schemaId);
    if (!schema) throw new Error('Schema not found');
    
    // Verify user owns the project that owns this schema
    if (schema.project.ownerId !== userId) {
      throw new Error('Unauthorized');
    }
    
    return schema;
  }

  async updateSchema(userId: string, schemaId: string, data: UpdateSchemaInput) {
    const schema = await this.getSchemaById(userId, schemaId); // verifies ownership
    return schemaRepository.update(schema.id, data);
  }

  async deleteSchema(userId: string, schemaId: string) {
    const schema = await this.getSchemaById(userId, schemaId); // verifies ownership
    return schemaRepository.softDelete(schema.id);
  }
}

export const schemaService = new SchemaService();
