import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { protect } from '../middleware/auth.middleware';
import { AuthRequest } from '../types/auth.types';

export const aiRoutes = Router();

// Secure AI Context Resolution Endpoint
aiRoutes.post('/context', protect, (req, res) => aiController.resolveContext(req as AuthRequest, res));
