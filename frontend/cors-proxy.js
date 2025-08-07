// Simple CORS proxy for development - using CommonJS style
// Rename this file to cors-proxy.cjs to run properly
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
  // No path rewrite - pass all requests directly to the target
  pathRewrite: null,
  onProxyRes: function (proxyRes, req, res) {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    // Add additional CORS headers to ensure browser compatibility
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,HEAD,PUT,PATCH,POST,DELETE';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  },
  logLevel: 'debug',
  // Increase timeout for the proxy to handle slow connections
  proxyTimeout: 30000,
  timeout: 30000
});

// Add error handling for the proxy
app.use((err, req, res, next) => {
  console.error('Proxy Error:', err);
  res.status(500).send('Proxy error: ' + err.message);
});

// Use the proxy for /api requests
app.use('/api', apiProxy);

// Start the proxy server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`CORS Proxy running on http://localhost:${PORT}`);
});

console.log('To use the proxy, set VITE_API_URL=http://localhost:8080/api');
