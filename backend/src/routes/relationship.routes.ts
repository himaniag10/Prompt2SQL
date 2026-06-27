import { Router } from 'express';
import { relationshipController } from '../controllers/relationship.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

// Mounted at /api/schemas/:schemaId/relationships
router.post('/schemas/:schemaId/relationships', relationshipController.create);

// Mounted at /api/relationships/:id
router.put('/relationships/:id', relationshipController.update);
router.delete('/relationships/:id', relationshipController.delete);

export const relationshipRoutes = router;
