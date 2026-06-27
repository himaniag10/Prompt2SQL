import { Router } from 'express';
import { columnController } from '../controllers/column.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

// Mounted at /api/tables/:tableId/columns
router.post('/tables/:tableId/columns', columnController.create);

// Mounted at /api/columns/:id
router.put('/columns/:id', columnController.update);
router.delete('/columns/:id', columnController.delete);

export const columnRoutes = router;
