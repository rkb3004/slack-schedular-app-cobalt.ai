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