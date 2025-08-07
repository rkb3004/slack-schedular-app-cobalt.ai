import { Router } from 'express';

const router = Router();

router.get('/validate-client-id', (req, res) => {
  const clientId = process.env.SLACK_CLIENT_ID;
  
  // Detailed validation
  const validation = {
    original: clientId,
    rawLength: clientId?.length,
    trimmedLength: clientId?.trim()?.length,
    hasPrefixSpace: clientId?.startsWith(' '),
    hasSuffixSpace: clientId?.endsWith(' '),
    hasNewlines: clientId?.includes('\n') || clientId?.includes('\r'),
    base64Test: Buffer.from(clientId || '').toString('base64'),
    clientIdCharCodes: Array.from(clientId || '').map(c => ({ char: c, code: c.charCodeAt(0) })),
    // Test manual client ID
    manualClientId: '0d64d058106084589b6a8ea9bc709c3c',
    encodedOriginal: encodeURIComponent(clientId || ''),
    encodedTrimmed: encodeURIComponent(clientId?.trim() || '')
  };

  res.render('validate-client-id', {
    title: 'Validate Slack Client ID',
    validation,
    authUrl: `https://slack.com/oauth/v2/authorize?client_id=${encodeURIComponent(clientId?.trim() || '')}&scope=channels:read,chat:write,channels:history&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI || '')}`,
    manualAuthUrl: `https://slack.com/oauth/v2/authorize?client_id=0d64d058106084589b6a8ea9bc709c3c&scope=channels:read,chat:write,channels:history&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI || '')}`
  });
});

export default router;
