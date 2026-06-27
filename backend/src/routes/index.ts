import { Router, Request, Response } from 'express';
import { authRoutes } from './auth.routes';
import { projectRoutes } from './project.routes';
import { schemaRoutes } from './schema.routes';
import { tableRoutes } from './table.routes';
import { columnRoutes } from './column.routes';
import { relationshipRoutes } from './relationship.routes';
import { glossaryRoutes } from './glossary.routes';

const router = Router();

// Health check route
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Feature routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/', schemaRoutes);       // Mounts /api/projects/:projectId/schemas and /api/schemas/:id
router.use('/', tableRoutes);        // Mounts /api/schemas/:schemaId/tables and /api/tables/:id
router.use('/', columnRoutes);       // Mounts /api/tables/:tableId/columns and /api/columns/:id
router.use('/', relationshipRoutes); // Mounts /api/schemas/:schemaId/relationships and /api/relationships/:id
router.use('/', glossaryRoutes);     // Mounts /api/schemas/:schemaId/glossary and /api/glossary/:id

export default router;
