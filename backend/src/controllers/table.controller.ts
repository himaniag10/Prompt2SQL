import { Request, Response } from 'express';
import { tableService } from '../services/table.service';
import { createTableValidator, updateTableValidator } from '../validators/table.validator';
import { AuthRequest } from '../types/auth.types';

export class TableController {
  async create(req: AuthRequest, res: Response) {
    try {
      const { schemaId } = req.params;
      const parsedData = createTableValidator.parse(req.body);
      const table = await tableService.createTable(req.user!.userId, schemaId, parsedData);
      res.status(201).json(table);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(error.message === 'Unauthorized' ? 403 : 400).json({ error: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const parsedData = updateTableValidator.parse(req.body);
      const table = await tableService.updateTable(req.user!.userId, id, parsedData);
      res.status(200).json(table);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(error.message === 'Unauthorized' ? 403 : 400).json({ error: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await tableService.deleteTable(req.user!.userId, id);
      res.status(204).send();
    } catch (error: any) {
      res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
    }
  }
}

export const tableController = new TableController();
