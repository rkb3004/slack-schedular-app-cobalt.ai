"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const web_api_1 = require("@slack/web-api");
const uuid_1 = require("uuid");
class MessageService {
    constructor(messageRepository, slackAuthService) {
        this.messageRepository = messageRepository;
        this.slackAuthService = slackAuthService;
    }
    async sendMessageImmediately(userId, channel, text) {
        try {
            const accessToken = await this.slackAuthService.getAccessToken(userId);
            const client = new web_api_1.WebClient(accessToken);
            const result = await client.chat.postMessage({
                channel,
                text,
                as_user: true
            });
            if (!result.ok) {
                throw new Error(`Failed to send message: ${result.error}`);
            }
        }
        catch (error) {
            console.error('Error sending message immediately:', error);
            throw error;
        }
    }
    async scheduleMessageForLater(userId, channel, text, scheduledTime) {
        try {
            if (scheduledTime.getTime() <= Date.now()) {
                throw new Error('Scheduled time must be in the future');
            }
            const messageId = (0, uuid_1.v4)();
            await this.messageRepository.saveScheduledMessage({
                id: messageId,
                userId,
                channel,
                text,
                scheduledTime
            });
            return messageId;
        }
        catch (error) {
            console.error('Error scheduling message:', error);
            throw error;
        }
    }
    async getScheduledMessages(userId) {
        try {
            return await this.messageRepository.getScheduledMessagesByUser(userId);
        }
        catch (error) {
            console.error('Error getting scheduled messages:', error);
            throw error;
        }
    }
    async cancelScheduledMessage(id) {
        try {
            const message = await this.messageRepository.getScheduledMessage(id);
            if (!message) {
                throw new Error('Scheduled message not found');
            }
            await this.messageRepository.deleteScheduledMessage(id);
        }
        catch (error) {
            console.error('Error cancelling scheduled message:', error);
            throw error;
        }
    }
    async processScheduledMessages() {
        try {
            const now = new Date();
            const messages = await this.messageRepository.getAllScheduledMessages();
            const messagesToSend = messages.filter(msg => msg.scheduledTime.getTime() <= now.getTime());
            console.log(`Found ${messagesToSend.length} messages to process`);
            for (const message of messagesToSend) {
                try {
                    console.log(`Sending scheduled message ${message.id} to channel ${message.channel}`);
                    await this.sendMessageImmediately(message.userId, message.channel, message.text);
                    await this.messageRepository.deleteScheduledMessage(message.id);
                    console.log(`Message ${message.id} sent and removed from queue`);
                }
                catch (error) {
                    console.error(`Failed to send scheduled message ${message.id}:`, error);
                }
            }
        }
        catch (error) {
            console.error('Error processing scheduled messages:', error);
        }
    }
}
exports.MessageService = MessageService;
//# sourceMappingURL=message.service.js.map