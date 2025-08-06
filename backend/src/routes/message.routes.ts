import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware';
import { resolveInstance } from '../container';
import { MessageController } from '../controllers/message.controller';

const router = Router();
const messageController = resolveInstance(MessageController);

router.post('/send', authMiddleware, messageController.sendMessage);
router.post('/schedule', authMiddleware, messageController.scheduleMessage);
router.get('/scheduled', authMiddleware, messageController.getScheduledMessages);
router.delete('/scheduled/:id', authMiddleware, messageController.cancelScheduledMessage);

export default router;
