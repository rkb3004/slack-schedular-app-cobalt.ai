"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cors_1 = require("cors");
const dotenv_1 = require("dotenv");
const node_cron_1 = require("node-cron");
// Load environment variables first
dotenv_1.default.config();
// Import after env variables are loaded
const container_1 = require("./container");
const message_service_1 = require("./services/message.service");
const auth_routes_1 = require("./routes/auth.routes");
const slack_routes_1 = require("./routes/slack.routes");
const message_routes_1 = require("./routes/message.routes");
const database_1 = require("./db/database");
// Initialize express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Set up routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/slack', slack_routes_1.default);
app.use('/api/messages', message_routes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
// Schedule task to process scheduled messages (runs every minute)
node_cron_1.default.schedule('* * * * *', async () => {
    console.log('Processing scheduled messages...');
    try {
        const messageService = (0, container_1.resolveInstance)(message_service_1.MessageService);
        await messageService.processScheduledMessages();
    }
    catch (error) {
        console.error('Error in scheduled task:', error);
    }
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received. Closing HTTP server and database');
    const db = (0, container_1.resolveInstance)(database_1.Database);
    await db.close();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT signal received. Closing HTTP server and database');
    const db = (0, container_1.resolveInstance)(database_1.Database);
    await db.close();
    process.exit(0);
});
exports.default = app;
