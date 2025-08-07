// Debug controller for troubleshooting OAuth issues
import { Request, Response } from 'express';
import { SlackAuthService } from '../services/slackAuth.service';

export class DebugController {
  private slackAuthService: SlackAuthService;
  
  constructor(slackAuthService: SlackAuthService) {
    this.slackAuthService = slackAuthService;
  }
  
  getOAuthConfig = async (req: Request, res: Response): Promise<void> => {
    try {
      // Generate the validator URL
      const baseUrl = `${req.protocol}://${req.headers.host}`;
      const validatorUrl = `${baseUrl}/validator/validate-client-id`;
      
      // Collect all relevant environment variables for debugging
      const config = {
        SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID ? 
          `${process.env.SLACK_CLIENT_ID.substring(0, 5)}...${process.env.SLACK_CLIENT_ID.substring(process.env.SLACK_CLIENT_ID.length - 5)}` : 
          'Not set',
        REDIRECT_URI: process.env.REDIRECT_URI || 'Not set',
        FRONTEND_URL: process.env.FRONTEND_URL || 'Not set',
        NODE_ENV: process.env.NODE_ENV || 'Not set',
        SERVER_URL: process.env.SERVER_URL || 'Not set',
        // Computed URLs for verification
        generatedAuthUrl: process.env.SLACK_CLIENT_ID ? 
          `https://slack.com/oauth/v2/authorize?client_id=${encodeURIComponent(process.env.SLACK_CLIENT_ID?.trim() || '')}&scope=channels:read,chat:write,channels:history&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI || '')}` : 
          'Cannot generate: missing client ID',
        // Request info
        request: {
          host: req.headers.host,
          originalUrl: req.originalUrl,
          baseUrl: req.baseUrl,
          protocol: req.protocol,
        },
        // Validation tool
        validationTool: {
          url: validatorUrl,
          description: 'Use this tool to validate the client ID for whitespace or encoding issues'
        }
      };
      
      res.json({
        config,
        timestamp: new Date().toISOString(),
        message: 'This endpoint provides configuration information for debugging OAuth issues',
        validatorUrl // Include the validator URL at the top level for easy access
      });
    } catch (error) {
      console.error('Debug endpoint error:', error);
      res.status(500).json({ error: 'Error retrieving configuration' });
    }
  };
  
  generateTestUrl = (req: Request, res: Response): void => {
    try {
      const clientId = process.env.SLACK_CLIENT_ID;
      const redirectUri = process.env.REDIRECT_URI;
      
      if (!clientId || !redirectUri) {
        res.status(500).json({
          error: 'Missing configuration',
          message: 'Client ID or Redirect URI is not configured',
          missingClientId: !clientId,
          missingRedirectUri: !redirectUri
        });
        return;
      }
      
      const scope = 'channels:read,chat:write,channels:history';
      const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${encodeURIComponent(clientId)}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      
      res.json({
        authUrl,
        clientIdFirstChars: clientId.substring(0, 5),
        clientIdLastChars: clientId.substring(clientId.length - 5),
        redirectUri,
        scope
      });
    } catch (error) {
      console.error('Error generating test URL:', error);
      res.status(500).json({ 
        error: 'Failed to generate test URL',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
