import { Router } from 'express';
import {
  getAllUsers,
  getMessages,
  sendMessage,
  clearMessages,
} from '../controllers/user.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', protectRoute, getAllUsers);
router.get('/messages/:userId', protectRoute, getMessages);
router.post('/messages/:receiverId', protectRoute, sendMessage);
router.delete('/messages/:userId', protectRoute, clearMessages);

export default router;
