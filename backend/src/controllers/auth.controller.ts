import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

/**
 * Helper function to validate and format Slack OAuth scopes
 * @param scopes Array of Slack OAuth scopes
 * @returns Validated array of scopes
 */
function validateSlackScopes(scopes: string[]): string[] {
  const validScopes = scopes.filter(scope => {
    // Basic validation: ensure scope is non-empty and follows proper format
    return scope && typeof scope === 'string' && /^[a-z_.]+:[a-z]+$/.test(scope);
  });

  if (validScopes.length === 0) {
    console.warn('No valid scopes provided, using default scopes');
    return ['channels:read', 'chat:write', 'channels:history'];
  }

  return validScopes;
}

export const slackOAuthRedirect = (req: Request, res: Response): void => {
  const clientId = process.env.SLACK_CLIENT_ID;
  const redirectUri = process.env.REDIRECT_URI;
  
  // Define the required scopes for the application
  // These are the minimum scopes needed for the Slack scheduler functionality
  const requiredScopes = ['channels:read', 'chat:write', 'channels:history'];
  
  try {
    // Debug logging for client ID validation
    console.log('Slack OAuth Redirect - Client ID details:');
    console.log(`Raw client ID: "${clientId}"`);
    console.log(`Client ID length: ${clientId?.length}`);
    console.log(`Trimmed client ID length: ${clientId?.trim()?.length}`);
    console.log(`Has leading whitespace: ${clientId?.startsWith(' ')}`);
    console.log(`Has trailing whitespace: ${clientId?.endsWith(' ')}`);
    
    // Validate scopes
    const validatedScopes = validateSlackScopes(requiredScopes);
    console.log('Using scopes:', validatedScopes);
    
    // Join scopes with comma and properly encode
    const scopeParam = encodeURIComponent(validatedScopes.join(','));
    
    // Build the OAuth URL with validated parameters
    const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${encodeURIComponent(clientId?.trim() || '')}&scope=${scopeParam}&redirect_uri=${encodeURIComponent(redirectUri || '')}`;
    console.log(`Generated auth URL: ${authUrl}`);
    
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error in slackOAuthRedirect:', error);
    res.status(500).json({ 
      error: 'Failed to generate Slack OAuth URL',
      message: error instanceof Error ? error.message : 'Unknown error',
      validationLink: `${req.protocol}://${req.get('host')}/validator/validate-client-id`
    });
  }
};

export const slackOAuthCallback = (req: Request, res: Response): void => {
  try {
    console.log('Slack OAuth Callback received:', { 
      query: req.query,
      hasCode: !!req.query.code,
      hasError: !!req.query.error,
      errorDescription: req.query.error_description || 'None'
    });
    
    // Check for error from Slack OAuth
    if (req.query.error) {
      console.error('Slack OAuth error:', {
        error: req.query.error,
        description: req.query.error_description
      });
      
      // Redirect to frontend with error info
      const errorMsg = encodeURIComponent(
        `Slack OAuth Error: ${req.query.error} - ${req.query.error_description || 'No description'}`
      );
      return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?error=${errorMsg}`);
    }
    
    // Ensure we have a code
    if (!req.query.code) {
      console.error('Missing code in Slack OAuth callback');
      return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?error=Missing+authorization+code`);
    }
    
    // Generate a temp user ID (in production you'd have a real user system)
    const userId = uuidv4();
    console.log('Generated userId for Slack auth:', userId);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );
    
    // Redirect to frontend with token and code
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&code=${req.query.code}`);
  } catch (error) {
    console.error('Error in slackOAuthCallback:', error);
    const errorMsg = encodeURIComponent(`Server error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?error=${errorMsg}`);
  }
};

export const getUserInfo = (req: Request, res: Response): void => {
  if (!req.userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  
  res.status(200).json({ userId: req.userId });
};

/**
 * Provides documentation about the Slack scopes used by this application
 */
export const getSlackScopesInfo = (req: Request, res: Response): void => {
  const scopesInfo = {
    'channels:read': {
      description: 'View basic information about public channels in a workspace',
      usage: 'Used to list available channels for message scheduling'
    },
    'chat:write': {
      description: 'Post messages in approved channels & conversations',
      usage: 'Required to post scheduled messages to channels'
    },
    'channels:history': {
      description: 'View messages and other content in public channels',
      usage: 'Used to view message history for scheduled message context'
    }
  };
  
  res.json({
    message: 'Slack OAuth Scope Information',
    scopes: scopesInfo,
    currentlyUsed: validateSlackScopes(['channels:read', 'chat:write', 'channels:history'])
  });
};

/**
 * Debug endpoint to check the token exchange flow with Slack
 */
export const debugTokenExchange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      res.status(400).json({ 
        error: 'Missing code parameter',
        message: 'A valid authorization code is required to test the token exchange'
      });
      return;
    }
    
    // Manually build the token exchange request (for debugging only)
    const clientId = process.env.SLACK_CLIENT_ID?.trim();
    const clientSecret = process.env.SLACK_CLIENT_SECRET?.trim();
    const redirectUri = process.env.REDIRECT_URI;
    
    if (!clientId || !clientSecret || !redirectUri) {
      res.status(500).json({
        error: 'Missing configuration',
        missing: {
          clientId: !clientId,
          clientSecret: !clientSecret,
          redirectUri: !redirectUri
        }
      });
      return;
    }
    
    // We won't actually make the exchange request here to avoid side effects,
    // just provide the payload that would be sent for verification
    const exchangePayload = {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri
    };
    
    // Include scope information in the debug output
    const requiredScopes = validateSlackScopes(['channels:read', 'chat:write', 'channels:history']);
    
    res.json({
      message: 'Token exchange debug information',
      exchangeUrl: 'https://slack.com/api/oauth.v2.access',
      method: 'POST',
      contentType: 'application/x-www-form-urlencoded',
      payload: {
        ...exchangePayload,
        client_secret: '[REDACTED]' // Don't expose secret in response
      },
      clientIdLength: clientId.length,
      clientSecretLength: clientSecret.length,
      scopes: {
        required: requiredScopes,
        formatted: requiredScopes.join(','),
        encoded: encodeURIComponent(requiredScopes.join(','))
      }
    });
  } catch (error) {
    console.error('Debug token exchange error:', error);
    res.status(500).json({
      error: 'Failed to process debug token exchange',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
