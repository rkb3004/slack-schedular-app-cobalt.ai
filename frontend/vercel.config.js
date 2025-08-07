// vercel.config.js
module.exports = {
  // Skip TypeScript checking to speed up builds
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Enable source maps in production
  productionBrowserSourceMaps: true,
  
  // Set environment variables
  env: {
    VITE_API_URL: "https://slack-schedular-app-cobalt-ai-1.onrender.com",
  },
  
  // Output directory configuration
  distDir: 'dist',
  
  // Build command configuration
  build: {
    env: {
      VITE_API_URL: "https://slack-schedular-app-cobalt-ai-1.onrender.com",
    },
  },
};
