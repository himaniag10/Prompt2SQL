import { Router, Request, Response } from 'express';

const router = Router();

// Health check route
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Feature routes will be registered here in the future
// Example: router.use('/auth', authRoutes);

export default router;
