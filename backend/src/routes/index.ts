import { Router } from 'express';
import authRoutes from './auth.routes';
import slackRoutes from './slack.routes';
import messageRoutes from './message.routes';
import channelRoutes from './channel.routes';

const router = Router();

// Register route handlers
router.use('/auth', authRoutes);
router.use('/slack', slackRoutes);
router.use('/messages', messageRoutes);
router.use('/channels', channelRoutes);

export default router;
