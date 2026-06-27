import { Request, Response } from 'express';
import { columnService } from '../services/column.service';
import { createColumnValidator, updateColumnValidator } from '../validators/column.validator';
import { AuthRequest } from '../types/auth.types';

export class ColumnController {
  async create(req: AuthRequest, res: Response) {
    try {
      const { tableId } = req.params;
      const parsedData = createColumnValidator.parse(req.body);
      const column = await columnService.createColumn(req.user!.userId, tableId, parsedData);
      res.status(201).json(column);
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
      const parsedData = updateColumnValidator.parse(req.body);
      const column = await columnService.updateColumn(req.user!.userId, id, parsedData);
      res.status(200).json(column);
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
      await columnService.deleteColumn(req.user!.userId, id);
      res.status(204).send();
    } catch (error: any) {
      res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
    }
  }
}

export const columnController = new ColumnController();
