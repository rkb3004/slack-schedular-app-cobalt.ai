"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const token_repository_1 = require("../repositories/token.repository");
const container_1 = require("../container");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized - No token provided' });
            return;
        }
        const token = authHeader.substring(7);
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.userId;
            const tokenRepository = container_1.container.resolve(token_repository_1.TokenRepository);
            const slackTokens = await tokenRepository.getTokens(req.userId);
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
//# sourceMappingURL=auth.middleware.js.map