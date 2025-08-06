"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackAuthService = void 0;
const web_api_1 = require("@slack/web-api");
class SlackAuthService {
    constructor(tokenRepository) {
        this.tokenRepository = tokenRepository;
        this.clientId = process.env.SLACK_CLIENT_ID || '';
        this.clientSecret = process.env.SLACK_CLIENT_SECRET || '';
        this.redirectUri = process.env.REDIRECT_URI || '';
        if (!this.clientId || !this.clientSecret || !this.redirectUri) {
            console.warn('Missing Slack OAuth configuration. Please set SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, and REDIRECT_URI');
        }
    }
    async exchangeCodeForToken(code, userId) {
        try {
            const client = new web_api_1.WebClient();
            const response = await client.oauth.v2.access({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                code,
                redirect_uri: this.redirectUri
            });
            if (!response.access_token || !response.refresh_token) {
                throw new Error('Invalid OAuth response: missing tokens');
            }
            // Calculate expiration (default to 12 hours if not specified)
            const expiresIn = response.expires_in || 43200;
            const expiresAt = new Date(Date.now() + expiresIn * 1000);
            // Store tokens
            await this.tokenRepository.saveTokens(userId, response.access_token, response.refresh_token, expiresAt);
        }
        catch (error) {
            console.error('Error exchanging code for token:', error);
            throw new Error('Failed to exchange code for token');
        }
    }
    async getAccessToken(userId) {
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
        }
        catch (error) {
            console.error('Error getting access token:', error);
            throw new Error('Failed to get access token');
        }
    }
    async refreshToken(userId, refreshToken) {
        try {
            const client = new web_api_1.WebClient();
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
            await this.tokenRepository.saveTokens(userId, response.access_token, response.refresh_token || refreshToken, // Use the new refresh token if provided
            expiresAt);
            return response.access_token;
        }
        catch (error) {
            console.error('Failed to refresh token:', error);
            throw new Error('Failed to refresh Slack access token');
        }
    }
    async disconnectUser(userId) {
        try {
            await this.tokenRepository.deleteTokens(userId);
        }
        catch (error) {
            console.error('Error disconnecting user:', error);
            throw new Error('Failed to disconnect user');
        }
    }
}
exports.SlackAuthService = SlackAuthService;
