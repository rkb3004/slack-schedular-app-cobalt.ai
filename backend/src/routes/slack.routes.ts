import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware';
import { resolveInstance } from '../container';
import { SlackController } from '../controllers/slack.controller';

const router = Router();
const slackController = resolveInstance(SlackController);

router.get('/channels', authMiddleware, slackController.getSlackChannels);
router.get('/check-connection', authMiddleware, slackController.checkConnection);

export default router;
