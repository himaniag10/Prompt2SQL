import { Router } from 'express';
import { schemaController } from '../controllers/schema.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

// Mounted at /api/projects/:projectId/schemas in index.ts for these two:
router.post('/projects/:projectId/schemas', schemaController.create);
router.get('/projects/:projectId/schemas', schemaController.getAllByProject);

// Mounted at /api/schemas for these:
router.get('/schemas/:id', schemaController.getOne);
router.put('/schemas/:id', schemaController.update);
router.delete('/schemas/:id', schemaController.delete);

export const schemaRoutes = router;
