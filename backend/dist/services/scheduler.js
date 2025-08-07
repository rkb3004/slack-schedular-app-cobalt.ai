"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScheduler = startScheduler;
exports.stopScheduler = stopScheduler;
const node_cron_1 = __importDefault(require("node-cron"));
const message_service_1 = require("./message.service");
const container_1 = require("../container");
let scheduler = null;
function startScheduler() {
    if (scheduler) {
        console.log('Scheduler already running');
        return;
    }
    scheduler = node_cron_1.default.schedule('* * * * *', async () => {
        console.log('Checking for scheduled messages to send...');
        try {
            const messageService = (0, container_1.resolveInstance)(message_service_1.MessageService);
            await messageService.processScheduledMessages();
        }
        catch (error) {
            console.error('Error processing scheduled messages:', error);
        }
    });
    console.log('Message scheduler started');
}
function stopScheduler() {
    if (scheduler) {
        scheduler.stop();
        scheduler = null;
        console.log('Message scheduler stopped');
    }
}
//# sourceMappingURL=scheduler.js.map