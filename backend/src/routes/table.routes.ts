import { Router } from 'express';
import { tableController } from '../controllers/table.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

// Mounted at /api/schemas/:schemaId/tables
router.post('/schemas/:schemaId/tables', tableController.create);

// Mounted at /api/tables/:id
router.put('/tables/:id', tableController.update);
router.delete('/tables/:id', tableController.delete);

export const tableRoutes = router;
