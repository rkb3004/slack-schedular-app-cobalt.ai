"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/validate-client-id', (req, res) => {
    var _a;
    const clientId = process.env.SLACK_CLIENT_ID;
    const validation = {
        original: clientId,
        rawLength: clientId === null || clientId === void 0 ? void 0 : clientId.length,
        trimmedLength: (_a = clientId === null || clientId === void 0 ? void 0 : clientId.trim()) === null || _a === void 0 ? void 0 : _a.length,
        hasPrefixSpace: clientId === null || clientId === void 0 ? void 0 : clientId.startsWith(' '),
        hasSuffixSpace: clientId === null || clientId === void 0 ? void 0 : clientId.endsWith(' '),
        hasNewlines: (clientId === null || clientId === void 0 ? void 0 : clientId.includes('\n')) || (clientId === null || clientId === void 0 ? void 0 : clientId.includes('\r')),
        base64Test: Buffer.from(clientId || '').toString('base64'),
        clientIdCharCodes: Array.from(clientId || '').map(c => ({ char: c, code: c.charCodeAt(0) })),
        manualClientId: '0d64d058106084589b6a8ea9bc709c3c',
        encodedOriginal: encodeURIComponent(clientId || ''),
        encodedTrimmed: encodeURIComponent((clientId === null || clientId === void 0 ? void 0 : clientId.trim()) || '')
    };
    res.render('validate-client-id', {
        title: 'Validate Slack Client ID',
        validation,
        authUrl: `https://slack.com/oauth/v2/authorize?client_id=${encodeURIComponent((clientId === null || clientId === void 0 ? void 0 : clientId.trim()) || '')}&scope=channels:read,chat:write,channels:history&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI || '')}`,
        manualAuthUrl: `https://slack.com/oauth/v2/authorize?client_id=0d64d058106084589b6a8ea9bc709c3c&scope=channels:read,chat:write,channels:history&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI || '')}`
    });
});
exports.default = router;
//# sourceMappingURL=validate.routes.js.map