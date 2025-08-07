"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const database_1 = require("./db/database");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const validate_routes_1 = __importDefault(require("./routes/validate.routes"));
const scheduler_1 = require("./services/scheduler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const allowedOrigins = [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://127.0.0.1:3000',
    'https://127.0.0.1:3000'
];
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false
}));
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        console.log(`CORS request from origin: ${origin}`);
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.get('/health', (_, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});
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
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, 'views'));
app.use('/api', auth_routes_1.default);
app.use('/validator', validate_routes_1.default);
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
const db = new database_1.Database();
const startServer = async () => {
    try {
        console.log('Database connected');
        (0, scheduler_1.startScheduler)();
        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV}`);
            console.log(`Slack redirect URI: ${process.env.REDIRECT_URI}`);
            console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
            console.log(`Allowed CORS origins: ${JSON.stringify(allowedOrigins)}`);
        });
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
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map