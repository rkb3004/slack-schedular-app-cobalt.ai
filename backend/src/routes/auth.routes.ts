import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { resolveInstance } from '../container';
import { SlackAuthService } from '../services/slackAuth.service';

const router = Router();
// Use the helper function to get properly typed instance
const slackAuthService = resolveInstance(SlackAuthService);

// Generate OAuth URL
router.get('/slack/url', (req, res) => {
  try {
    // Make sure to access the environment variables correctly
    const clientId = process.env.SLACK_CLIENT_ID;
    
    if (!clientId) {
      console.error('Missing SLACK_CLIENT_ID environment variable');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    const redirectUri = process.env.REDIRECT_URI;
    const scope = 'channels:read,chat:write,channels:history';
    
    // Explicitly log the auth URL being generated for debugging
    const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`;
    console.log('Generated Slack auth URL:', authUrl);
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
});

// OAuth callback handler - Updated to match the expected URL from .env
router.get('/slack/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Invalid OAuth code' });
    }
    
    // Generate a new user ID for this session
    const userId = uuidv4();
    
    // Exchange the code for tokens
    await slackAuthService.exchangeCodeForToken(code, userId);
    
    // Generate JWT token for the client
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );
    
    // Redirect to frontend with the token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
  }
});

export default router;
