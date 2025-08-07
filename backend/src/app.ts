import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import messageRoutes from './routes/message.routes';
import channelRoutes from './routes/channel.routes';
import slackRoutes from './routes/slack.routes';
import { resolveInstance } from './container';
import { SlackAuthService } from './services/slackAuth.service';

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev')); // Request logging

// Root endpoint for API health check
app.get('/', (req, res) => {
  res.json({
    status: 'API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Route registrations
// Auth routes for Slack authentication and OAuth
app.use('/api/auth', authRoutes);

// Message routes for sending and scheduling messages
app.use('/api/messages', messageRoutes);

// Channel routes for listing Slack channels
app.use('/api/channels', channelRoutes);

// Slack-specific routes for API operations
app.use('/api/slack', slackRoutes);

// Direct access to the Slack callback route for compatibility with various URI structures
// This ensures that both /api/auth/slack/callback and /api/slack/callback will work
app.get('/api/slack/callback', async (req, res) => {
  console.log('Received callback on /api/slack/callback route - redirecting to auth controller');
  
  // Import the handler directly
  const slackAuthService = resolveInstance(SlackAuthService);
  
  try {
    console.log('Slack OAuth callback received on alternate path:', { 
      query: req.query,
      hasCode: !!req.query.code,
      hasError: !!req.query.error
    });
    
    // Redirect to the auth route
    res.redirect(`/api/auth/slack/callback${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`);
  } catch (error) {
    console.error('Error in alternate callback path:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(`Redirect error: ${errorMessage}`)}`);
  }
});

// Catch-all route for debugging 404s
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.originalUrl}`);
  res.status(404).json({
    error: 'Not Found',
    message: `The requested URL ${req.originalUrl} was not found on this server.`,
    availableRoutes: [
      '/',
      '/api/auth/health',
      '/api/auth/slack/url',
      '/api/auth/slack/callback',
      '/api/auth/slack/debug',
      '/api/messages/send',
      '/api/messages/schedule',
      '/api/messages/scheduled',
      '/api/slack/channels'
    ]
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;