import { Request, Response } from 'express';
import { relationshipService } from '../services/relationship.service';
import { createRelationshipValidator, updateRelationshipValidator } from '../validators/relationship.validator';
import { AuthRequest } from '../types/auth.types';

export class RelationshipController {
  async create(req: AuthRequest, res: Response) {
    try {
      const { schemaId } = req.params;
      const parsedData = createRelationshipValidator.parse(req.body);
      const relationship = await relationshipService.createRelationship(req.user!.userId, schemaId, parsedData);
      res.status(201).json(relationship);
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
      const parsedData = updateRelationshipValidator.parse(req.body);
      const relationship = await relationshipService.updateRelationship(req.user!.userId, id, parsedData);
      res.status(200).json(relationship);
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
      await relationshipService.deleteRelationship(req.user!.userId, id);
      res.status(204).send();
    } catch (error: any) {
      res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
    }
  }
}

export const relationshipController = new RelationshipController();
