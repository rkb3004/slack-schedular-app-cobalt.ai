import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import messageRoutes from './routes/message.routes';
import channelRoutes from './routes/channel.routes';
import slackRoutes from './routes/slack.routes';

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