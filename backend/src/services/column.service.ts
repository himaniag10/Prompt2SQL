import { columnRepository } from '../repositories/column.repository';
import { tableService } from './table.service';
import { CreateColumnInput, UpdateColumnInput } from '../validators/column.validator';

export class ColumnService {
  async createColumn(userId: string, tableId: string, data: CreateColumnInput) {
    await tableService.getTableById(userId, tableId); // verifies ownership
    
    try {
      return await columnRepository.create(tableId, data);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error(`Column with name '${data.name}' already exists in this table.`);
      }
      throw error;
    }
  }

  async getColumnById(userId: string, columnId: string) {
    const column = await columnRepository.findById(columnId);
    if (!column) throw new Error('Column not found');
    
    // Verify user owns the project
    if (column.table.schemaVersion.databaseSchema.project.ownerId !== userId) {
      throw new Error('Unauthorized');
    }
    
    return column;
  }

  async updateColumn(userId: string, columnId: string, data: UpdateColumnInput) {
    const column = await this.getColumnById(userId, columnId); // verifies ownership
    try {
      return await columnRepository.update(column.id, data);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error(`Column with name '${data.name}' already exists in this table.`);
      }
      throw error;
    }
  }

  async deleteColumn(userId: string, columnId: string) {
    const column = await this.getColumnById(userId, columnId); // verifies ownership
    return columnRepository.delete(column.id);
  }
}

export const columnService = new ColumnService();
