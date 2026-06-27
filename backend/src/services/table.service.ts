import { tableRepository } from '../repositories/table.repository';
import { schemaService } from './schema.service';
import { CreateTableInput, UpdateTableInput } from '../validators/table.validator';

export class TableService {
  async createTable(userId: string, schemaId: string, data: CreateTableInput) {
    const schema = await schemaService.getSchemaById(userId, schemaId);
    if (schema.versions.length === 0) {
      throw new Error('Schema has no versions');
    }
    const latestVersionId = schema.versions[0].id;
    
    // Prisma will automatically enforce the unique constraint [schemaVersionId, name]
    try {
      return await tableRepository.create(latestVersionId, data);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error(`Table with name '${data.name}' already exists in this schema.`);
      }
      throw error;
    }
  }

  async getTableById(userId: string, tableId: string) {
    const table = await tableRepository.findById(tableId);
    if (!table) throw new Error('Table not found');
    
    // Verify user owns the project that owns this schema version
    if (table.schemaVersion.databaseSchema.project.ownerId !== userId) {
      throw new Error('Unauthorized');
    }
    
    return table;
  }

  async updateTable(userId: string, tableId: string, data: UpdateTableInput) {
    const table = await this.getTableById(userId, tableId); // verifies ownership
    try {
      return await tableRepository.update(table.id, data);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error(`Table with name '${data.name}' already exists in this schema.`);
      }
      throw error;
    }
  }

  async deleteTable(userId: string, tableId: string) {
    const table = await this.getTableById(userId, tableId); // verifies ownership
    return tableRepository.delete(table.id); // Cascade will handle columns/relationships
  }
}

export const tableService = new TableService();
