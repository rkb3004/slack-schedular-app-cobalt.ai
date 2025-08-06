"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const token_repository_1 = require("../repositories/token.repository");
const container_1 = require("../container");
const authMiddleware = async (req, res, next) => {
    try {
        // Get JWT token from authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized - No token provided' });
            return;
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        try {
            // Verify and decode the token
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.userId;
            // Get TokenRepository from container
            const tokenRepository = container_1.container.resolve(token_repository_1.TokenRepository);
            // Check if user has valid slack tokens
            const slackTokens = await tokenRepository.getTokens(req.userId);
            // Skip Slack token check for auth callback route
            if (!slackTokens && !req.path.includes('callback')) {
                res.status(401).json({ error: 'Slack connection required', requiresSlackAuth: true });
                return;
            }
            next();
        }
        catch (err) {
            if (err.name === 'TokenExpiredError') {
                res.status(401).json({ error: 'Token expired' });
            }
            else {
                res.status(401).json({ error: 'Invalid token' });
            }
        }
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Internal server error during authentication' });
    }
};
exports.default = authMiddleware;
