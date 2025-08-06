"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = require("jsonwebtoken");
const uuid_1 = require("uuid");
const container_1 = require("../container");
const slackAuth_service_1 = require("../services/slackAuth.service");
const router = (0, express_1.Router)();
// Use the helper function to get properly typed instance
const slackAuthService = (0, container_1.resolveInstance)(slackAuth_service_1.SlackAuthService);
// Generate OAuth URL
router.get('/slack/url', (req, res) => {
    try {
        const clientId = process.env.SLACK_CLIENT_ID;
        const redirectUri = process.env.REDIRECT_URI;
        const scope = 'channels:read,chat:write,channels:history';
        const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`;
        res.json({ authUrl });
    }
    catch (error) {
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
        const userId = (0, uuid_1.v4)();
        // Exchange the code for tokens
        await slackAuthService.exchangeCodeForToken(code, userId);
        // Generate JWT token for the client
        const token = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
        // Redirect to frontend with the token
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
    catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
    }
});
exports.default = router;
