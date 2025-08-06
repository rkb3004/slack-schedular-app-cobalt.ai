import { WebClient } from '@slack/web-api';
import { v4 as uuidv4 } from 'uuid';
import { MessageRepository } from '../repositories/message.repository';
import { SlackAuthService } from './slackAuth.service';

interface ScheduledMessage {
  id: string;
  userId: string;
  channel: string;
  text: string;
  scheduledTime: Date;
}

export class MessageService {
  private messageRepository: MessageRepository;
  private slackAuthService: SlackAuthService;
  
  constructor(messageRepository: MessageRepository, slackAuthService: SlackAuthService) {
    this.messageRepository = messageRepository;
    this.slackAuthService = slackAuthService;
  }
  
  async sendMessageImmediately(userId: string, channel: string, text: string): Promise<void> {
    try {
      const accessToken = await this.slackAuthService.getAccessToken(userId);
      const client = new WebClient(accessToken);
      
      const result = await client.chat.postMessage({
        channel,
        text,
        as_user: true
      });
      
      if (!result.ok) {
        throw new Error(`Failed to send message: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending message immediately:', error);
      throw error;
    }
  }
  
  async scheduleMessageForLater(userId: string, channel: string, text: string, scheduledTime: Date): Promise<string> {
    try {
      // Validate scheduled time is in the future
      if (scheduledTime.getTime() <= Date.now()) {
        throw new Error('Scheduled time must be in the future');
      }
      
      const messageId = uuidv4();
      
      // Save message to database
      await this.messageRepository.saveScheduledMessage({
        id: messageId,
        userId,
        channel,
        text,
        scheduledTime
      });
      
      return messageId;
    } catch (error) {
      console.error('Error scheduling message:', error);
      throw error;
    }
  }
  
  async getScheduledMessages(userId: string): Promise<ScheduledMessage[]> {
    try {
      return await this.messageRepository.getScheduledMessagesByUser(userId);
    } catch (error) {
      console.error('Error getting scheduled messages:', error);
      throw error;
    }
  }
  
  async cancelScheduledMessage(id: string): Promise<void> {
    try {
      const message = await this.messageRepository.getScheduledMessage(id);
      
      if (!message) {
        throw new Error('Scheduled message not found');
      }
      
      await this.messageRepository.deleteScheduledMessage(id);
    } catch (error) {
      console.error('Error cancelling scheduled message:', error);
      throw error;
    }
  }
  
  async processScheduledMessages(): Promise<void> {
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
        } catch (error) {
          console.error(`Failed to send scheduled message ${message.id}:`, error);
          // We don't delete the message, so it can be retried next time
          // But we could implement a retry count to avoid endless retries
        }
      }
    } catch (error) {
      console.error('Error processing scheduled messages:', error);
    }
  }
}
