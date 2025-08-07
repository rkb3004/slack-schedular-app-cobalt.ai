// A simpler version of the config that doesn't rely on import.meta.env
// We'll use this as a fallback for TypeScript compatibility

// Default values
const defaultConfig = {
  API_URL: 'https://slack-schedular-app-cobalt-ai-1.onrender.com',
  FALLBACK_API_URL: 'http://localhost:8080'
};

// This will be replaced at build time by Vite
const env = {
  VITE_API_URL: typeof process !== 'undefined' && process.env.VITE_API_URL || defaultConfig.API_URL
};

export default env;
