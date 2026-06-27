import { Request, Response } from 'express';
import { projectService } from '../services/project.service';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator';
import { AuthRequest } from '../types/auth.types';

export class ProjectController {
  async create(req: AuthRequest, res: Response) {
    try {
      const parsedData = createProjectSchema.parse(req.body);
      const project = await projectService.createProject(req.user!.userId, parsedData);
      res.status(201).json(project);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      const projects = await projectService.getProjects(req.user!.userId);
      res.status(200).json(projects);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getOne(req: AuthRequest, res: Response) {
    try {
      const project = await projectService.getProjectById(req.user!.userId, req.params.id);
      res.status(200).json(project);
    } catch (error: any) {
      res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const parsedData = updateProjectSchema.parse(req.body);
      const project = await projectService.updateProject(req.user!.userId, req.params.id, parsedData);
      res.status(200).json(project);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(error.message === 'Unauthorized' ? 403 : 400).json({ error: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      await projectService.deleteProject(req.user!.userId, req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
    }
  }
}

export const projectController = new ProjectController();
