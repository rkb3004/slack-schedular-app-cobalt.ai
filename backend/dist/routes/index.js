"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = require("./auth.routes");
const slack_routes_1 = require("./slack.routes");
const message_routes_1 = require("./message.routes");
const channel_routes_1 = require("./channel.routes");
const router = (0, express_1.Router)();
// Register route handlers
router.use('/auth', auth_routes_1.default);
router.use('/slack', slack_routes_1.default);
router.use('/messages', message_routes_1.default);
router.use('/channels', channel_routes_1.default);
exports.default = router;
