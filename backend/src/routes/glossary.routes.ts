import { Router } from 'express';
import { glossaryController } from '../controllers/glossary.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

// Mounted at /api/schemas/:schemaId/glossary
router.post('/schemas/:schemaId/glossary', glossaryController.create);

// Mounted at /api/glossary/:id
router.put('/glossary/:id', glossaryController.update);
router.delete('/glossary/:id', glossaryController.delete);

export const glossaryRoutes = router;
