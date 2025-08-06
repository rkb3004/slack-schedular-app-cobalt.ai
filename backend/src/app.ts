import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

// Load environment variables first, using the correct path
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import dependencies after env vars are loaded
import { container } from './container';
import { startScheduler } from './services/scheduler';
import routes from './routes';
import { Database } from './db/database';

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3001;

// Set up middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Register routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start the message scheduler
  startScheduler();
  
  console.log('Server initialization complete');
}).on('error', (error: Error) => {
  console.error('Failed to start server:', error);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  const db = container.resolve(Database) as Database;
  await db.close();
  server.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  const db = container.resolve(Database) as Database;
  await db.close();
  server.close();
  process.exit(0);
});

export default app;
