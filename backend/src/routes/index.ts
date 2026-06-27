import { Router, Request, Response } from 'express';
import { authRoutes } from './auth.routes';

const router = Router();

// Health check route
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Feature routes
router.use('/auth', authRoutes);

export default router;
