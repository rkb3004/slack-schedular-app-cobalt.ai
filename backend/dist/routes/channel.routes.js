"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const container_1 = require("../container");
const slack_controller_1 = require("../controllers/slack.controller");
const router = (0, express_1.Router)();
const slackController = (0, container_1.resolveInstance)(slack_controller_1.SlackController);
// Get available channels from connected Slack workspace
router.get('/', auth_middleware_1.default, slackController.getSlackChannels);
exports.default = router;
