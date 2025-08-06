import { Request, Response } from 'express';
import { SlackAuthService } from '../services/slackAuth.service';
import { WebClient } from '@slack/web-api';

export class SlackController {
  private slackAuthService: SlackAuthService;
  
  constructor(slackAuthService: SlackAuthService) {
    this.slackAuthService = slackAuthService;
  }
  
  handleOAuthCallback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.query;
      const userId = req.userId;
      
      if (!code || typeof code !== 'string') {
        res.status(400).json({ error: 'Invalid OAuth code' });
        return;
      }
      
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      
      await this.slackAuthService.exchangeCodeForToken(code, userId);
      res.status(200).json({ success: true, message: 'Slack workspace connected successfully' });
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.status(500).json({ error: 'Failed to connect Slack workspace' });
    }
  };
  
  getSlackChannels = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      
      const accessToken = await this.slackAuthService.getAccessToken(req.userId);
      const client = new WebClient(accessToken);
      
      // Get conversations (channels) list
      const result = await client.conversations.list({
        types: 'public_channel,private_channel',
        exclude_archived: true
      });
      
      if (!result.ok) {
        throw new Error(`Failed to get channels: ${result.error}`);
      }
      
      const channels = result.channels?.map(channel => ({
        id: channel.id,
        name: channel.name,
        isPrivate: channel.is_private
      })) || [];
      
      res.status(200).json({ channels });
    } catch (error: unknown) {
      console.error('Error fetching Slack channels:', error);
      
      // Handle token/auth specific errors differently
      if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' && (
          error.message.includes('token') || 
          error.message.includes('auth') || 
          error.message.includes('permission'))
      ) {
        res.status(401).json({ 
          error: 'Authentication error with Slack', 
          requiresSlackAuth: true 
        });
      } else {
        res.status(500).json({ error: 'Failed to fetch Slack channels' });
      }
    }
  };
  
  checkConnection = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      
      // Try to get the access token, which will refresh if needed
      await this.slackAuthService.getAccessToken(req.userId);
      
      res.status(200).json({ connected: true });
    } catch (error) {
      console.error('Connection check error:', error);
      res.status(200).json({ connected: false });
    }
  };
}
