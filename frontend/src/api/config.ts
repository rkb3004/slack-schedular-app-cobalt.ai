// API configuration
import env from '../config';

// Get API URL from our simplified config file
const PRIMARY_API_URL = env.VITE_API_URL;
// Fallback to local proxy in development if available
const FALLBACK_API_URL = 'http://localhost:8080';

// Remove trailing slash if present
const normalizeUrl = (url: string) => url.endsWith('/') ? url.slice(0, -1) : url;

export const BASE_API_URL = normalizeUrl(PRIMARY_API_URL);
export const FALLBACK_URL = normalizeUrl(FALLBACK_API_URL);

// For debugging
console.log('API Base URL:', BASE_API_URL);

// Auth endpoints - Based on server configuration
// The routes in the backend are mounted as app.use('/api', routes);
export const AUTH_ENDPOINTS = {
  // Using the path that matches our backend routes mounted as /api
  SLACK_URL: `${BASE_API_URL}/api/slack/url`,
  // This should match the REDIRECT_URI in the backend .env
  SLACK_CALLBACK: `${BASE_API_URL}/api/slack/callback`,
};

// Message endpoints
export const MESSAGE_ENDPOINTS = {
  SEND: `${BASE_API_URL}/api/messages/send`,
  SCHEDULE: `${BASE_API_URL}/api/messages/schedule`,
  SCHEDULED: `${BASE_API_URL}/api/messages/scheduled`,
  CANCEL: (id: string) => `${BASE_API_URL}/api/messages/scheduled/${id}`,
};

// Slack endpoints
export const SLACK_ENDPOINTS = {
  CHANNELS: `${BASE_API_URL}/api/slack/channels`,
};