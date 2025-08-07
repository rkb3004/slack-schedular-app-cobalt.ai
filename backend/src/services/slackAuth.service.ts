import { WebClient } from '@slack/web-api';
import { TokenRepository } from '../repositories/token.repository';

export class SlackAuthService {
  private tokenRepository: TokenRepository;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  
  constructor(tokenRepository: TokenRepository) {
    this.tokenRepository = tokenRepository;
    // Trim whitespace from credentials to avoid common issues
    this.clientId = (process.env.SLACK_CLIENT_ID || '').trim();
    this.clientSecret = (process.env.SLACK_CLIENT_SECRET || '').trim();
    this.redirectUri = process.env.REDIRECT_URI || '';
    
    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      console.warn('Missing Slack OAuth configuration. Please set SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, and REDIRECT_URI');
    }
    
    // Log initialization for debugging
    console.log('SlackAuthService initialized with:', {
      hasClientId: !!this.clientId,
      clientIdLength: this.clientId.length,
      hasClientSecret: !!this.clientSecret,
      clientSecretLength: this.clientSecret.length,
      redirectUri: this.redirectUri
    });
  }
  
  async exchangeCodeForToken(code: string, userId: string): Promise<void> {
    try {
      const client = new WebClient();
      
      // Enhanced logging for troubleshooting
      console.log('OAuth exchange parameters:', {
        client_id_prefix: this.clientId ? `${this.clientId.substring(0, 5)}...` : 'not set',
        client_id_length: this.clientId?.length || 0,
        has_client_secret: !!this.clientSecret,
        client_secret_length: this.clientSecret?.length || 0,
        redirect_uri: this.redirectUri,
        code_length: code?.length || 0,
        code_prefix: code ? `${code.substring(0, 5)}...` : 'not set',
        timestamp: new Date().toISOString()
      });
      
      // Prepare the request payload
      const payload = {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri
      };
      
      console.log('Making OAuth token request with payload:', {
        ...payload,
        client_secret: '[REDACTED]' // Don't log the actual secret
      });
      
      // Make the token exchange request
      const response = await client.oauth.v2.access(payload);
      
      console.log('OAuth response keys:', Object.keys(response));
      console.log('OAuth response has token:', !!response.access_token);
      console.log('OAuth response has refresh token:', !!response.refresh_token);
      
      if (!response.access_token || !response.refresh_token) {
        throw new Error('Invalid OAuth response: missing tokens');
      }
      
      // Calculate expiration (default to 12 hours if not specified)
      const expiresIn = response.expires_in || 43200;
      const expiresAt = new Date(Date.now() + expiresIn * 1000);
      
      // Store tokens
      await this.tokenRepository.saveTokens(
        userId,
        response.access_token,
        response.refresh_token,
        expiresAt
      );
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      
      // Try to get more details about the error
      const errorDetails = {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
        isObject: typeof error === 'object' && error !== null,
        hasResponse: typeof error === 'object' && error !== null && 'response' in error,
        clientId: this.clientId ? `${this.clientId.substring(0, 5)}...${this.clientId.substring(this.clientId.length - 5)}` : 'not set',
        redirectUri: this.redirectUri
      };
      
      console.error('Error details:', JSON.stringify(errorDetails, null, 2));
      throw new Error(`Failed to exchange code for token: ${errorDetails.message}`);
    }
  }
  
  async getAccessToken(userId: string): Promise<string> {
    try {
      const tokens = await this.tokenRepository.getTokens(userId);
      
      if (!tokens) {
        throw new Error('No Slack tokens found for user');
      }
      
      // Check if token is expired or about to expire (within 5 minutes)
      if (tokens.expiresAt.getTime() <= Date.now() + 5 * 60 * 1000) {
        return await this.refreshToken(userId, tokens.refreshToken);
      }
      
      return tokens.accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw new Error('Failed to get access token');
    }
  }
  
  private async refreshToken(userId: string, refreshToken: string): Promise<string> {
    try {
      const client = new WebClient();
      
      const response = await client.oauth.v2.access({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      });
      
      if (!response.access_token) {
        throw new Error('Invalid refresh response: missing access token');
      }
      
      // Calculate new expiration (default to 12 hours if not specified)
      const expiresIn = response.expires_in || 43200;
      const expiresAt = new Date(Date.now() + expiresIn * 1000);
      
      // Store new tokens
      await this.tokenRepository.saveTokens(
        userId,
        response.access_token,
        response.refresh_token || refreshToken, // Use the new refresh token if provided
        expiresAt
      );
      
      return response.access_token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw new Error('Failed to refresh Slack access token');
    }
  }
  
  async disconnectUser(userId: string): Promise<void> {
    try {
      await this.tokenRepository.deleteTokens(userId);
    } catch (error) {
      console.error('Error disconnecting user:', error);
      throw new Error('Failed to disconnect user');
    }
  }
}
