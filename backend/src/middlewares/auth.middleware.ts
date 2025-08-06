import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TokenRepository } from '../repositories/token.repository';
import { container } from '../container';

// Extend Express Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
      req.userId = decoded.userId;
      
      // Get TokenRepository from container
      const tokenRepository: TokenRepository = container.resolve(TokenRepository);
      
      // Check if user has valid slack tokens
      const slackTokens = await tokenRepository.getTokens(req.userId);
      
      // Skip Slack token check for auth callback route
      if (!slackTokens && !req.path.includes('callback')) {
        res.status(401).json({ error: 'Slack connection required', requiresSlackAuth: true });
        return;
      }
      
      next();
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        res.status(401).json({ error: 'Token expired' });
      } else {
        res.status(401).json({ error: 'Invalid token' });
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

export default authMiddleware;
