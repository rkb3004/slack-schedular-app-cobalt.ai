import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { resolveInstance } from '../container';
import { SlackAuthService } from '../services/slackAuth.service';
import { DebugController } from '../controllers/debug.controller';

const router = Router();
const slackAuthService = resolveInstance(SlackAuthService);
const debugController = new DebugController(slackAuthService);

// Add a health check endpoint for debugging route registration
router.get('/health', (req, res) => {
  res.json({ 
    status: 'Auth routes are working!',
    timestamp: new Date().toISOString(),
    endpoints: ['slack/url', 'slack/callback', 'slack/debug', 'slack/test-url', 'slack/test-auth']
  });
});

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
    
    // Ensure the redirect URI ends with /api/slack/callback
    if (!redirectUri?.includes('/api/slack/callback')) {
      console.warn('Warning: Redirect URI may not be correctly configured. Expected to end with /api/slack/callback, got:', redirectUri);
    }
    
    // Log values for debugging
    console.log('Client ID length:', clientId?.length);
    console.log('Client ID first 5 chars:', clientId?.substring(0, 5));
    console.log('Redirect URI:', redirectUri);
    
    // Build the URL with all components properly encoded
    const authUrl = `https://slack.com/oauth/v2/authorize` + 
      `?client_id=${encodeURIComponent(clientId || '')}` + 
      `&scope=${encodeURIComponent(scope)}` + 
      `&redirect_uri=${encodeURIComponent(redirectUri || '')}`;
    
    console.log('Generated Slack auth URL (partial):', authUrl.replace(clientId || '', 'CLIENT_ID_HIDDEN'));
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ 
      error: 'Failed to generate authorization URL',
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Remove the old redirect route since we're now directly using /api/slack/callback
// Keep this comment as a reminder of the previous implementation

// OAuth callback handler - This will be /api/slack/callback
router.get('/slack/callback', async (req, res) => {
  try {
    console.log('Received Slack OAuth callback with query params:', req.query);
    
    // Check for error response from Slack
    if (req.query.error) {
      console.error('OAuth error from Slack:', req.query.error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(req.query.error.toString())}`);
    }
    
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(`Failed to connect to Slack: ${errorMessage}`)}`);
  }
});

// Direct error display endpoint for debugging
router.get('/slack/error', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Slack OAuth Error Debug</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow: auto; }
        .error { color: red; }
        .success { color: green; }
      </style>
    </head>
    <body>
      <h1>Slack OAuth Debug Page</h1>
      <p>This page displays information about the Slack OAuth flow for debugging purposes.</p>
      
      <h2>Request Information</h2>
      <pre>${JSON.stringify({
        query: req.query,
        headers: req.headers,
        path: req.path,
        originalUrl: req.originalUrl
      }, null, 2)}</pre>
      
      <h2>Environment Configuration</h2>
      <pre>${JSON.stringify({
        clientId: process.env.SLACK_CLIENT_ID ? `${process.env.SLACK_CLIENT_ID.substring(0, 5)}... (length: ${process.env.SLACK_CLIENT_ID.length})` : 'not set',
        hasClientSecret: !!process.env.SLACK_CLIENT_SECRET,
        secretLength: process.env.SLACK_CLIENT_SECRET ? process.env.SLACK_CLIENT_SECRET.length : 'not set',
        redirectUri: process.env.REDIRECT_URI,
        frontendUrl: process.env.FRONTEND_URL
      }, null, 2)}</pre>
      
      <h2>Next Steps</h2>
      <p>Check that:</p>
      <ul>
        <li>Client ID in .env matches your Slack App</li>
        <li>Client Secret in .env matches your Slack App</li>
        <li>Redirect URI in .env matches what's registered in your Slack App</li>
        <li>Required scopes are enabled in your Slack App</li>
      </ul>
      
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">Return to application</a></p>
    </body>
    </html>
  `);
});

// Debug endpoint to check Slack configuration
// Debug endpoint to check Slack configuration
router.get('/slack/debug', debugController.getOAuthConfig);

// Test endpoint to generate a Slack OAuth URL for direct testing
router.get('/slack/test-url', debugController.generateTestUrl);

// Visual test page for the Slack OAuth flow
router.get('/slack/test-auth', (req, res) => {
  try {
    const clientId = process.env.SLACK_CLIENT_ID;
    const redirectUri = process.env.REDIRECT_URI;
    const scope = 'channels:read,chat:write,channels:history';
    
    const authUrl = `https://slack.com/oauth/v2/authorize` + 
      `?client_id=${encodeURIComponent(clientId || '')}` + 
      `&scope=${encodeURIComponent(scope)}` + 
      `&redirect_uri=${encodeURIComponent(redirectUri || '')}`;
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Slack OAuth Test</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow: auto; }
          .button { display: inline-block; background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .error { color: red; }
          .success { color: green; }
        </style>
      </head>
      <body>
        <h1>Slack OAuth Test Page</h1>
        <p>This page allows you to test the Slack OAuth flow directly.</p>
        
        <h2>Configuration</h2>
        <pre>
Client ID: ${clientId ? clientId.substring(0, 5) + '...' + clientId.substring(clientId.length - 5) : 'not set'}
Redirect URI: ${redirectUri || 'not set'}
Scopes: ${scope}
        </pre>
        
        <h2>Generated OAuth URL</h2>
        <pre>${authUrl}</pre>
        
        <p>Click the button below to test the OAuth flow:</p>
        <a href="${authUrl}" class="button">Authorize with Slack</a>
        
        <h2>Troubleshooting</h2>
        <p>If you encounter errors:</p>
        <ul>
          <li>Make sure your Slack App is properly configured</li>
          <li>Verify the Client ID and Client Secret are correct</li>
          <li>Check that the Redirect URI in your Slack App settings matches exactly: <code>${redirectUri}</code></li>
          <li>Ensure all required scopes are enabled in your Slack App</li>
        </ul>
        
        <p><a href="/api/slack/debug">View JSON debug information</a></p>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

export default router;