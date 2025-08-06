import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export const slackOAuthRedirect = (req: Request, res: Response): void => {
  const clientId = process.env.SLACK_CLIENT_ID;
  const redirectUri = process.env.REDIRECT_URI;
  const scope = 'channels:read,chat:write,channels:history';
  
  const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`;
  
  res.redirect(authUrl);
};

export const slackOAuthCallback = (req: Request, res: Response): void => {
  // Generate a temp user ID (in production you'd have a real user system)
  const userId = uuidv4();
  
  // Generate JWT token
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );
  
  // Redirect to frontend with token
  res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&code=${req.query.code}`);
};

export const getUserInfo = (req: Request, res: Response): void => {
  if (!req.userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  
  res.status(200).json({ userId: req.userId });
};
