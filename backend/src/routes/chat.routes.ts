import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { protect } from '../middleware/auth.middleware';
import { AuthRequest } from '../types/auth.types';

export const chatRoutes = Router();

// Chat workspace endpoints
chatRoutes.get('/', protect, (req, res) => chatController.getProjectChats(req as AuthRequest, res));
chatRoutes.get('/:id', protect, (req, res) => chatController.getChat(req as AuthRequest, res));
chatRoutes.put('/:id', protect, (req, res) => chatController.renameChat(req as AuthRequest, res));
chatRoutes.delete('/:id', protect, (req, res) => chatController.deleteChat(req as AuthRequest, res));
chatRoutes.post('/message', protect, (req, res) => chatController.sendMessage(req as AuthRequest, res));
