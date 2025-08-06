import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware';
import { resolveInstance } from '../container';
import { SlackController } from '../controllers/slack.controller';

const router = Router();
const slackController = resolveInstance(SlackController);

// Get available channels from connected Slack workspace
router.get('/', authMiddleware, slackController.getSlackChannels);

export default router;
