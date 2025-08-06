"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cors_1 = require("cors");
const dotenv_1 = require("dotenv");
const helmet_1 = require("helmet");
const morgan_1 = require("morgan");
const path_1 = require("path");
// Load environment variables first, using the correct path
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
// Import dependencies after env vars are loaded
const container_1 = require("./container");
const scheduler_1 = require("./services/scheduler");
const routes_1 = require("./routes");
const database_1 = require("./db/database");
// Initialize the app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Set up middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
// Register routes
app.use('/api', routes_1.default);
// Health check endpoint
app.get('/health', (_, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Start the message scheduler
    (0, scheduler_1.startScheduler)();
    console.log('Server initialization complete');
}).on('error', (error) => {
    console.error('Failed to start server:', error);
});
// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    const db = container_1.container.resolve(database_1.Database);
    await db.close();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    const db = container_1.container.resolve(database_1.Database);
    await db.close();
    process.exit(0);
});
exports.default = app;
