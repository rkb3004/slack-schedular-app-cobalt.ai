"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugTokenExchange = exports.getSlackScopesInfo = exports.getUserInfo = exports.slackOAuthCallback = exports.slackOAuthRedirect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
function validateSlackScopes(scopes) {
    const validScopes = scopes.filter(scope => {
        return scope && typeof scope === 'string' && /^[a-z_.]+:[a-z]+$/.test(scope);
    });
    if (validScopes.length === 0) {
        console.warn('No valid scopes provided, using default scopes');
        return ['channels:read', 'chat:write', 'channels:history'];
    }
    return validScopes;
}
const slackOAuthRedirect = (req, res) => {
    var _a;
    const clientId = process.env.SLACK_CLIENT_ID;
    const redirectUri = process.env.REDIRECT_URI;
    const requiredScopes = ['channels:read', 'chat:write', 'channels:history'];
    try {
        console.log('Slack OAuth Redirect - Client ID details:');
        console.log(`Raw client ID: "${clientId}"`);
        console.log(`Client ID length: ${clientId === null || clientId === void 0 ? void 0 : clientId.length}`);
        console.log(`Trimmed client ID length: ${(_a = clientId === null || clientId === void 0 ? void 0 : clientId.trim()) === null || _a === void 0 ? void 0 : _a.length}`);
        console.log(`Has leading whitespace: ${clientId === null || clientId === void 0 ? void 0 : clientId.startsWith(' ')}`);
        console.log(`Has trailing whitespace: ${clientId === null || clientId === void 0 ? void 0 : clientId.endsWith(' ')}`);
        const validatedScopes = validateSlackScopes(requiredScopes);
        console.log('Using scopes:', validatedScopes);
        const scopeParam = encodeURIComponent(validatedScopes.join(','));
        const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${encodeURIComponent((clientId === null || clientId === void 0 ? void 0 : clientId.trim()) || '')}&scope=${scopeParam}&redirect_uri=${encodeURIComponent(redirectUri || '')}`;
        console.log(`Generated auth URL: ${authUrl}`);
        res.redirect(authUrl);
    }
    catch (error) {
        console.error('Error in slackOAuthRedirect:', error);
        res.status(500).json({
            error: 'Failed to generate Slack OAuth URL',
            message: error instanceof Error ? error.message : 'Unknown error',
            validationLink: `${req.protocol}://${req.get('host')}/validator/validate-client-id`
        });
    }
};
exports.slackOAuthRedirect = slackOAuthRedirect;
const slackOAuthCallback = (req, res) => {
    try {
        console.log('Slack OAuth Callback received:', {
            query: req.query,
            hasCode: !!req.query.code,
            hasError: !!req.query.error,
            errorDescription: req.query.error_description || 'None'
        });
        if (req.query.error) {
            console.error('Slack OAuth error:', {
                error: req.query.error,
                description: req.query.error_description
            });
            const errorMsg = encodeURIComponent(`Slack OAuth Error: ${req.query.error} - ${req.query.error_description || 'No description'}`);
            return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?error=${errorMsg}`);
        }
        if (!req.query.code) {
            console.error('Missing code in Slack OAuth callback');
            return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?error=Missing+authorization+code`);
        }
        const userId = (0, uuid_1.v4)();
        console.log('Generated userId for Slack auth:', userId);
        const token = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&code=${req.query.code}`);
    }
    catch (error) {
        console.error('Error in slackOAuthCallback:', error);
        const errorMsg = encodeURIComponent(`Server error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?error=${errorMsg}`);
    }
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
const getSlackScopesInfo = (req, res) => {
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
exports.getSlackScopesInfo = getSlackScopesInfo;
const debugTokenExchange = async (req, res) => {
    var _a, _b;
    try {
        const { code } = req.query;
        if (!code || typeof code !== 'string') {
            res.status(400).json({
                error: 'Missing code parameter',
                message: 'A valid authorization code is required to test the token exchange'
            });
            return;
        }
        const clientId = (_a = process.env.SLACK_CLIENT_ID) === null || _a === void 0 ? void 0 : _a.trim();
        const clientSecret = (_b = process.env.SLACK_CLIENT_SECRET) === null || _b === void 0 ? void 0 : _b.trim();
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
        const exchangePayload = {
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: redirectUri
        };
        const requiredScopes = validateSlackScopes(['channels:read', 'chat:write', 'channels:history']);
        res.json({
            message: 'Token exchange debug information',
            exchangeUrl: 'https://slack.com/api/oauth.v2.access',
            method: 'POST',
            contentType: 'application/x-www-form-urlencoded',
            payload: {
                ...exchangePayload,
                client_secret: '[REDACTED]'
            },
            clientIdLength: clientId.length,
            clientSecretLength: clientSecret.length,
            scopes: {
                required: requiredScopes,
                formatted: requiredScopes.join(','),
                encoded: encodeURIComponent(requiredScopes.join(','))
            }
        });
    }
    catch (error) {
        console.error('Debug token exchange error:', error);
        res.status(500).json({
            error: 'Failed to process debug token exchange',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.debugTokenExchange = debugTokenExchange;
//# sourceMappingURL=auth.controller.js.map