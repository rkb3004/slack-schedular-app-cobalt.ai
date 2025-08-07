// CORS proxy for development using CommonJS syntax
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Get target from environment variable or use default
const TARGET = process.env.PROXY_TARGET || 'https://slack-schedular-app-cobalt-ai.onrender.com';
console.log(`Using target: ${TARGET}`);

// Configure proxy middleware
const apiProxy = createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api' // Keep the /api prefix
  },
  onProxyRes: function(proxyRes) {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,HEAD,PUT,PATCH,POST,DELETE';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  },
  logLevel: 'debug'
});

// Use the proxy for all requests
app.use('/api', apiProxy);

// Add CORS headers to all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Default route
app.get('/', (req, res) => {
  res.send('Proxy server is running. Use /api/* to proxy requests.');
});

// Start the server
const PORT = process.env.PORT || 8081; // Changed to 8081 to avoid conflicts
app.listen(PORT, () => {
  console.log(`CORS Proxy running on http://localhost:${PORT}`);
  console.log(`Proxying requests to ${TARGET}`);
});
