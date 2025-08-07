import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { resolveInstance } from '../container';
import { SlackAuthService } from '../services/slackAuth.service';
import { DebugController } from '../controllers/debug.controller';
import { debugTokenExchange, getSlackScopesInfo } from '../controllers/auth.controller';

const router = Router();
const slackAuthService = resolveInstance(SlackAuthService);
const debugController = new DebugController(slackAuthService);

// Add a health check endpoint for debugging route registration
router.get('/health', (req, res) => {
  res.json({ 
    status: 'Auth routes are working!',
    timestamp: new Date().toISOString(),
    serverUrl: `${req.protocol}://${req.get('host')}`,
    expectedRedirectUri: process.env.REDIRECT_URI,
    matchStatus: process.env.REDIRECT_URI?.includes(req.get('host') || '') 
      ? 'Matched - Host in redirect URI' 
      : 'Mismatch - Check your REDIRECT_URI',
    endpoints: [
      'slack/url',
      'slack/callback',
      'slack/debug',
      'slack/test-url', 
      'slack/test-auth',
      'slack/test-token-exchange',
      'slack/scopes',
      'slack/domain-check'
    ]
  });
});

// Special endpoint to check domain configuration
router.get('/slack/domain-check', (req, res) => {
  // Use the actual production backend URL instead of the current request host
  const baseUrl = 'https://slack-schedular-app-cobalt-ai-1.onrender.com';
  const configuredRedirectUri = process.env.REDIRECT_URI || '';
  const expectedRedirectUri = `${baseUrl}/api/auth/slack/callback`;
  const altExpectedRedirectUri = `${baseUrl}/api/slack/callback`;
  
  // Check if the configured redirect URI matches the expected pattern
  const isMatch = configuredRedirectUri === expectedRedirectUri || 
                 configuredRedirectUri === altExpectedRedirectUri;
                 
  // Check if at least the domain part matches
  const domainMatch = configuredRedirectUri.includes(req.get('host') || '');
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Slack Domain Configuration Check</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow: auto; white-space: pre-wrap; word-break: break-all; }
        .button { display: inline-block; background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .error { color: red; }
        .warning { color: orange; }
        .success { color: green; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <h1>Slack OAuth Domain Configuration Check</h1>
      
      <div class="${isMatch ? 'success' : domainMatch ? 'warning' : 'error'}">
        <h2>Configuration Status: ${isMatch ? 'CORRECT ✅' : domainMatch ? 'PARTIAL MATCH ⚠️' : 'MISMATCH ❌'}</h2>
      </div>
      
      <h3>Current Configuration</h3>
      <table>
        <tr>
          <th>Parameter</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>Server URL</td>
          <td>${baseUrl}</td>
        </tr>
        <tr>
          <td>Configured Redirect URI</td>
          <td>${configuredRedirectUri || 'Not set'}</td>
        </tr>
        <tr>
          <td>Expected Redirect URI</td>
          <td>${expectedRedirectUri}</td>
        </tr>
      </table>
      
      ${!isMatch ? `
        <div class="error">
          <h3>Fix Required</h3>
          <p>Your configured Redirect URI doesn't match your server's domain.</p>
          
          <h4>Recommended Action:</h4>
          <ol>
            <li>Update your .env file with the correct REDIRECT_URI: <code>${expectedRedirectUri}</code></li>
            <li>Update your Slack App configuration with the same URI</li>
          </ol>
          
          <h4>Example .env update:</h4>
          <pre>REDIRECT_URI=${expectedRedirectUri}</pre>
          
          <a href="/api/slack/verify-client-id?test_redirect_uri=${encodeURIComponent(expectedRedirectUri)}" class="button">
            Test With Correct Redirect URI
          </a>
        </div>
      ` : `
        <div class="success">
          <h3>Your configuration looks good!</h3>
          <p>The Redirect URI matches the current server domain.</p>
        </div>
      `}
      
      <h3>Slack App Configuration Steps</h3>
      <ol>
        <li>Go to <a href="https://api.slack.com/apps" target="_blank">api.slack.com/apps</a> and select your app</li>
        <li>Click on "OAuth & Permissions" in the sidebar</li>
        <li>Under "Redirect URLs", make sure you have <code>${expectedRedirectUri}</code> added</li>
        <li>Save changes if you needed to update the URL</li>
      </ol>
      
      <p>
        <a href="/api/slack/debug" class="button">View Debug Info</a>
        <a href="/api/slack/verify-client-id" class="button">Client ID Verification Tool</a>
      </p>
    </body>
    </html>
  `);
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
    
    // Ensure the redirect URI contains either /api/slack/callback or /api/auth/slack/callback
    if (!redirectUri?.includes('/api/slack/callback') && !redirectUri?.includes('/api/auth/slack/callback')) {
      console.warn('Warning: Redirect URI may not be correctly configured. Expected to contain /api/slack/callback or /api/auth/slack/callback, got:', redirectUri);
    }
    
    // Log values for debugging
    console.log('Client ID length:', clientId?.length);
    console.log('Client ID first 5 chars:', clientId?.substring(0, 5));
    console.log('Redirect URI:', redirectUri);
    
    // Check for possible issues with client ID
    console.log('Client ID raw value:', clientId);
    console.log('Client ID trim check:', clientId?.trim() === clientId);
    console.log('Client ID length check:', clientId?.length);
    console.log('Client ID characters:', Array.from(clientId || '').map(c => c.charCodeAt(0)));
    
    // Check if there might be hidden characters
    const cleanClientId = clientId?.trim();
    
    // Build the URL with all components properly encoded
    const authUrl = `https://slack.com/oauth/v2/authorize` + 
      `?client_id=${encodeURIComponent(cleanClientId || '')}` + 
      `&scope=${encodeURIComponent(scope)}` + 
      `&redirect_uri=${encodeURIComponent(redirectUri || '')}`;
    
    console.log('Generated Slack auth URL (full for debugging):', authUrl);
    console.log('Generated Slack auth URL (partial):', authUrl.replace(cleanClientId || '', 'CLIENT_ID_HIDDEN'));
    
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
    console.log('Full callback URL:', `${req.protocol}://${req.headers.host}${req.originalUrl}`);
    console.log('Expected redirect URI:', process.env.REDIRECT_URI);
    
    // Check for error response from Slack
    if (req.query.error) {
      console.error('OAuth error from Slack:', req.query.error);
      
      // Special handling for Invalid client_id error
      if (req.query.error === 'invalid_client_id' || 
          (req.query.error_description && req.query.error_description.toString().includes('client_id'))) {
        
        console.error('CRITICAL: Invalid client ID error detected!');
        console.error('Client ID being used:', process.env.SLACK_CLIENT_ID);
        
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent('Invalid Slack Client ID. The client ID provided does not match any registered Slack application. Please verify your Slack App settings and environment variables.')}`);
      }
      
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
    try {
      await slackAuthService.exchangeCodeForToken(code, userId);
      console.log('Successfully exchanged code for token');
    } catch (exchangeError) {
      console.error('Token exchange error details:', exchangeError);
      throw exchangeError;
    }
    
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

// Debug endpoint to test the token exchange process
router.get('/slack/test-token-exchange', debugTokenExchange);

// Documentation endpoint for Slack scopes
router.get('/slack/scopes', getSlackScopesInfo);

// Client ID verification and testing tool
router.get('/slack/verify-client-id', (req, res) => {
  const { test_client_id, test_redirect_uri } = req.query;
  const env_client_id = process.env.SLACK_CLIENT_ID;
  const env_redirect_uri = process.env.REDIRECT_URI;
  const redirectUri = test_redirect_uri ? String(test_redirect_uri) : env_redirect_uri;
  const scope = 'channels:read,chat:write,channels:history';
  
  // Create URLs for both possible redirect patterns for testing
  const alternateRedirectUri = redirectUri?.replace('/api/auth/slack/callback', '/api/slack/callback') ||
                              redirectUri?.replace('/api/slack/callback', '/api/auth/slack/callback');
  
  // Generate URLs with both the environment and test client IDs
  const envAuthUrl = env_client_id ? 
    `https://slack.com/oauth/v2/authorize?client_id=${encodeURIComponent(env_client_id.trim())}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri || '')}` : 
    null;
  
  const testAuthUrl = test_client_id ? 
    `https://slack.com/oauth/v2/authorize?client_id=${encodeURIComponent(test_client_id.toString().trim())}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri || '')}` : 
    null;
    
  // Generate alternate redirect URI URL if applicable
  const alternateAuthUrl = (test_client_id && alternateRedirectUri && alternateRedirectUri !== redirectUri) ? 
    `https://slack.com/oauth/v2/authorize?client_id=${encodeURIComponent(test_client_id.toString().trim())}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(alternateRedirectUri)}` : 
    null;

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Slack Client ID Verification</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow: auto; white-space: pre-wrap; word-break: break-all; }
        .button { display: inline-block; background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .error { color: red; }
        .success { color: green; }
        input[type="text"] { width: 100%; padding: 8px; margin: 8px 0; }
        .client-id-box { border: 1px solid #ddd; padding: 10px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <h1>Slack Client ID Verification Tool</h1>
      <p>This tool helps verify if your Slack Client ID is valid and correctly configured.</p>
      
      <div class="client-id-box">
        <h2>Environment Client ID</h2>
        <p><strong>ID from .env file:</strong> ${env_client_id ? 
          `${env_client_id.substring(0, 5)}...${env_client_id.substring(env_client_id.length - 5)}` : 
          'Not set'}</p>
        <p><strong>Length:</strong> ${env_client_id?.length || 'N/A'} characters</p>
        <p><strong>Has whitespace:</strong> ${env_client_id !== env_client_id?.trim() ? 'Yes (problematic)' : 'No'}</p>
        
        ${envAuthUrl ? `
          <h3>Test URL with Environment Client ID</h3>
          <pre>${envAuthUrl}</pre>
          <a href="${envAuthUrl}" class="button">Test Environment Client ID</a>
        ` : '<p class="error">No environment client ID available to test</p>'}
      </div>
      
      <div class="client-id-box">
        <h2>Test a Different Client ID</h2>
        <form method="GET">
          <label for="test_client_id">Enter a Client ID to test:</label>
          <input type="text" id="test_client_id" name="test_client_id" 
                 value="${test_client_id || ''}" 
                 placeholder="Enter Slack Client ID to test...">
          <label for="test_redirect_uri">Custom Redirect URI (optional):</label>
          <input type="text" id="test_redirect_uri" name="test_redirect_uri" 
                 value="${test_redirect_uri || ''}" 
                 placeholder="Optional: Enter custom redirect URI...">
          <button type="submit" class="button">Generate Test URL</button>
        </form>
        
        ${testAuthUrl ? `
          <h3>Test URL with Custom Client ID</h3>
          <pre>${testAuthUrl}</pre>
          <p><strong>Client ID being tested:</strong> ${test_client_id}</p>
          <p><strong>Redirect URI:</strong> ${redirectUri || 'Not specified'}</p>
          <a href="${testAuthUrl}" class="button">Test Custom Client ID</a>
          
          ${alternateAuthUrl ? `
            <h3>Alternate Redirect Path Test</h3>
            <p>Testing with alternate path: ${alternateRedirectUri}</p>
            <pre>${alternateAuthUrl}</pre>
            <a href="${alternateAuthUrl}" class="button">Test With Alternate Redirect</a>
          ` : ''}
        ` : ''}
      </div>
      
      <h2>Common Issues with Client IDs</h2>
      <ul>
        <li><strong>Whitespace:</strong> The client ID should not have any spaces before or after it</li>
        <li><strong>Incorrect copying:</strong> Make sure you've copied the entire client ID from your Slack App's Basic Information page</li>
        <li><strong>App verification:</strong> Ensure your Slack app is properly verified and approved</li>
        <li><strong>App reinstallation:</strong> Try deleting and recreating your Slack app, sometimes this resolves credential issues</li>
        <li><strong>Environment file:</strong> Check that your .env file is properly loaded and formatted</li>
      </ul>
      
      <p><a href="/api/slack/debug">Back to Debug Page</a></p>
    </body>
    </html>
  `);
});

// Visual test page for the Slack OAuth flow
router.get('/slack/test-auth', (req, res) => {
  try {
    const clientId = process.env.SLACK_CLIENT_ID;
    const redirectUri = process.env.REDIRECT_URI;
    const scope = 'channels:read,chat:write,channels:history';
    
    // Check and clean client ID
    const cleanClientId = clientId?.trim();
    console.log('Test page - Original client ID:', clientId);
    console.log('Test page - Cleaned client ID:', cleanClientId);
    console.log('Test page - Client ID length:', clientId?.length);
    
    const authUrl = `https://slack.com/oauth/v2/authorize` + 
      `?client_id=${encodeURIComponent(cleanClientId || '')}` + 
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