import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
// Import the Database class directly
import { Database } from './db/database';
import routes from './routes/auth.routes';
import { startScheduler } from './services/scheduler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Simplified CORS configuration that will work reliably
const allowedOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
  'http://127.0.0.1:3000',
  'https://127.0.0.1:3000'
];

// Add FRONTEND_URL if it exists in env vars
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for simplicity during development
}));

// Simpler and more reliable CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // For development or non-browser clients (like Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if the origin is in our allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // For development purposes, log and still allow
    console.log(`CORS request from origin: ${origin}`);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Remove the redundant CORS headers middleware that could be causing conflicts
// app.use((req, res, next) => { ... }); - REMOVE THIS SECTION

app.use(morgan('dev'));
app.use(express.json());

// Add root health check endpoint
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Root route with API documentation and links
app.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.headers.host}`;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Slack Scheduler API</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #1d1c1d; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
        h2 { color: #1264a3; margin-top: 30px; }
        a { color: #1264a3; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .endpoint { background: #f9f9f9; padding: 12px; border-radius: 5px; margin-bottom: 10px; border-left: 4px solid #1264a3; }
        code { background: #f1f1f1; padding: 2px 5px; border-radius: 3px; font-family: monospace; }
        .method { font-weight: bold; color: #1264a3; }
        .route { color: #000; }
        .description { margin-top: 5px; }
        .buttons { margin-top: 30px; }
        .button { display: inline-block; background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px; }
      </style>
    </head>
    <body>
      <h1>Slack Scheduler API</h1>
      <p>Welcome to the Slack Scheduler API. This service allows you to authenticate with Slack and schedule messages.</p>
      
      <h2>API Endpoints</h2>
      
      <div class="endpoint">
        <span class="method">GET</span> <span class="route">${baseUrl}/health</span>
        <div class="description">Health check endpoint to verify API status</div>
      </div>
      
      <div class="endpoint">
        <span class="method">GET</span> <span class="route">${baseUrl}/api/health</span>
        <div class="description">Auth routes health check</div>
      </div>
      
      <div class="endpoint">
        <span class="method">GET</span> <span class="route">${baseUrl}/api/slack/url</span>
        <div class="description">Generate a Slack OAuth URL for authentication</div>
      </div>
      
      <div class="endpoint">
        <span class="method">GET</span> <span class="route">${baseUrl}/api/slack/callback</span>
        <div class="description">Slack OAuth callback endpoint</div>
      </div>
      
      <div class="endpoint">
        <span class="method">GET</span> <span class="route">${baseUrl}/api/slack/debug</span>
        <div class="description">Debug endpoint for OAuth configuration</div>
      </div>
      
      <div class="endpoint">
        <span class="method">GET</span> <span class="route">${baseUrl}/api/slack/test-auth</span>
        <div class="description">Visual test page for the Slack OAuth flow</div>
      </div>
      
      <div class="buttons">
        <a href="${baseUrl}/api/slack/debug" class="button">View OAuth Debug Info</a>
        <a href="${baseUrl}/api/slack/test-auth" class="button">Test Slack OAuth Flow</a>
        <a href="${process.env.FRONTEND_URL || '#'}" class="button">Go to Frontend</a>
      </div>
      
      <p style="margin-top: 30px; font-size: 0.8em; color: #666;">
        Environment: ${process.env.NODE_ENV || 'development'}<br>
        Server Time: ${new Date().toISOString()}
      </p>
    </body>
    </html>
  `);
});

// Routes
app.use('/api', routes);

// Remove the direct route handler for Slack callback since it will be handled by the router

// Add catch-all route handler for debugging
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested URL ${req.originalUrl} was not found on this server.`,
    availableEndpoints: {
      health: '/health',
      apiBase: '/api',
      slackAuth: '/api/slack/url',
      slackCallback: '/api/slack/callback',
      slackCallbackAlt: '/api/auth/slack/callback'
    },
    requestDetails: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query
    }
  });
});

// Initialize database directly
const db = new Database();

// Simplify the server startup flow
const startServer = async () => {
  try {
    // Database is initialized in its constructor
    console.log('Database connected');
    
    // Start the message scheduler
    startScheduler();
    
    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Slack redirect URI: ${process.env.REDIRECT_URI}`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`Allowed CORS origins: ${JSON.stringify(allowedOrigins)}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      await db.close();
      server.close(() => console.log('Server closed'));
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      console.log('SIGINT received. Shutting down gracefully...');
      await db.close();
      server.close(() => console.log('Server closed'));
      process.exit(0);
    });
    

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;