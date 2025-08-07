import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { resolveInstance } from '../container';
import { SlackAuthService } from '../services/slackAuth.service';

const router = Router();
const slackAuthService = resolveInstance(SlackAuthService);

// Generate OAuth URL - This endpoint will be /api/auth/slack/url
router.get('/slack/url', (req, res) => {
  try {
    console.log('Generating Slack auth URL...');
    
    // Enhanced error handling for missing config
    if (!process.env.SLACK_CLIENT_ID) {
      console.error('Missing SLACK_CLIENT_ID environment variable');
      return res.status(500).json({ 
        error: 'Server configuration error', 
        message: 'Slack client ID is not configured on the server.',
        details: 'Contact the administrator to configure Slack credentials.'
      });
    }
    
    if (!process.env.REDIRECT_URI) {
      console.error('Missing REDIRECT_URI environment variable');
      return res.status(500).json({ 
        error: 'Server configuration error', 
        message: 'Slack redirect URI is not configured on the server.' 
      });
    }
    
    const clientId = process.env.SLACK_CLIENT_ID;
    const redirectUri = process.env.REDIRECT_URI;
    const scope = 'channels:read,chat:write,channels:history';
    
    // Build the URL with all components properly encoded
    const authUrl = `https://slack.com/oauth/v2/authorize` + 
      `?client_id=${encodeURIComponent(clientId)}` + 
      `&scope=${encodeURIComponent(scope)}` + 
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    console.log('Generated Slack auth URL (partial):', authUrl.replace(clientId, 'CLIENT_ID_HIDDEN'));
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ 
      error: 'Failed to generate authorization URL',
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// OAuth callback handler - This will be /api/auth/slack/callback
router.get('/slack/callback', async (req, res) => {
  try {
    console.log('Received Slack OAuth callback with query params:', req.query);
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      console.error('Invalid OAuth code received:', code);
      return res.status(400).json({ error: 'Invalid OAuth code' });
    }
    
    // Generate a new user ID for this session
    const userId = uuidv4();
    console.log('Generated new userId:', userId);
    
    // Exchange the code for tokens
    console.log('Exchanging code for token...');
    await slackAuthService.exchangeCodeForToken(code, userId);
    console.log('Successfully exchanged code for token');
    
    // Generate JWT token for the client
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );
    
    // Get the frontend URL from environment, fallback to localhost
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/callback?token=${token}`;
    
    console.log('Redirecting to frontend:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('OAuth callback error:', error);
    // Get the frontend URL from environment, fallback to localhost
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/error?message=Failed%20to%20connect%20to%20Slack`);
  }
});

// Debug endpoint to check Slack configuration
router.get('/slack/debug', (req, res) => {
  try {
    const debugInfo = {
      clientId: process.env.SLACK_CLIENT_ID ? process.env.SLACK_CLIENT_ID.substring(0, 5) + '...' : 'not set',
      hasClientSecret: !!process.env.SLACK_CLIENT_SECRET,
      redirectUri: process.env.REDIRECT_URI,
      frontendUrl: process.env.FRONTEND_URL,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      message: 'Slack configuration debug information',
      config: debugInfo,
      // Generate the auth URL but don't log the full client ID
      sampleAuthUrl: `https://slack.com/oauth/v2/authorize?client_id=CLIENT_ID_HERE&scope=channels:read,chat:write,channels:history&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI || '')}`
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: 'Error retrieving configuration' });
  }
});

export default router;