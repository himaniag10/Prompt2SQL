import { Request, Response } from 'express';
import { schemaService } from '../services/schema.service';
import { createSchemaValidator, updateSchemaValidator } from '../validators/schema.validator';
import { AuthRequest } from '../types/auth.types';

export class SchemaController {
  async create(req: AuthRequest, res: Response) {
    try {
      const { projectId } = req.params;
      const parsedData = createSchemaValidator.parse(req.body);
      const schema = await schemaService.createSchema(req.user!.userId, projectId, parsedData);
      res.status(201).json(schema);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(error.message === 'Unauthorized' ? 403 : 400).json({ error: error.message });
    }
  }

  async getAllByProject(req: AuthRequest, res: Response) {
    try {
      const { projectId } = req.params;
      const schemas = await schemaService.getSchemasByProjectId(req.user!.userId, projectId);
      res.status(200).json(schemas);
    } catch (error: any) {
      res.status(error.message === 'Unauthorized' ? 403 : 400).json({ error: error.message });
    }
  }

  async getOne(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const schema = await schemaService.getSchemaById(req.user!.userId, id);
      res.status(200).json(schema);
    } catch (error: any) {
      res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const parsedData = updateSchemaValidator.parse(req.body);
      const schema = await schemaService.updateSchema(req.user!.userId, id, parsedData);
      res.status(200).json(schema);
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
      await schemaService.deleteSchema(req.user!.userId, id);
      res.status(204).send();
    } catch (error: any) {
      res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
    }
  }
}

export const schemaController = new SchemaController();
