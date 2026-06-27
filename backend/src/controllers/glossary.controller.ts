import { Request, Response } from 'express';
import { glossaryService } from '../services/glossary.service';
import { createGlossaryValidator, updateGlossaryValidator } from '../validators/glossary.validator';
import { AuthRequest } from '../types/auth.types';

export class GlossaryController {
  async create(req: AuthRequest, res: Response) {
    try {
      const { schemaId } = req.params;
      const parsedData = createGlossaryValidator.parse(req.body);
      const glossary = await glossaryService.createGlossary(req.user!.userId, schemaId, parsedData);
      res.status(201).json(glossary);
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
      const parsedData = updateGlossaryValidator.parse(req.body);
      const glossary = await glossaryService.updateGlossary(req.user!.userId, id, parsedData);
      res.status(200).json(glossary);
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
      await glossaryService.deleteGlossary(req.user!.userId, id);
      res.status(204).send();
    } catch (error: any) {
      res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
    }
  }
}

export const glossaryController = new GlossaryController();
