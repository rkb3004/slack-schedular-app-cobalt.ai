"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInfo = exports.slackOAuthCallback = exports.slackOAuthRedirect = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const uuid_1 = require("uuid");
const slackOAuthRedirect = (req, res) => {
    const clientId = process.env.SLACK_CLIENT_ID;
    const redirectUri = process.env.REDIRECT_URI;
    const scope = 'channels:read,chat:write,channels:history';
    const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`;
    res.redirect(authUrl);
};
exports.slackOAuthRedirect = slackOAuthRedirect;
const slackOAuthCallback = (req, res) => {
    // Generate a temp user ID (in production you'd have a real user system)
    const userId = (0, uuid_1.v4)();
    // Generate JWT token
    const token = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&code=${req.query.code}`);
};
exports.slackOAuthCallback = slackOAuthCallback;
const getUserInfo = (req, res) => {
    if (!req.userId) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    res.status(200).json({ userId: req.userId });
};
exports.getUserInfo = getUserInfo;
