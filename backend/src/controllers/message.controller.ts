import { Request, Response } from 'express';
import { MessageService } from '../services/message.service';

export class MessageController {
  private messageService: MessageService;
  
  constructor(messageService: MessageService) {
    this.messageService = messageService;
  }
  
  sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { channel, text } = req.body;
      const userId = req.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      
      if (!channel || !text) {
        res.status(400).json({ error: 'Channel and text are required' });
        return;
      }
      
      await this.messageService.sendMessageImmediately(userId, channel, text);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Handle token/auth specific errors differently
      if (error instanceof Error && error.message && (
          error.message.includes('token') || 
          error.message.includes('auth') || 
          error.message.includes('permission'))
      ) {
        res.status(401).json({ 
          error: 'Authentication error with Slack', 
          requiresSlackAuth: true 
        });
      } else {
        res.status(500).json({ error: 'Failed to send message' });
      }
    }
  };
  
  scheduleMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { channel, text, scheduledTime } = req.body;
      const userId = req.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      
      if (!channel || !text || !scheduledTime) {
        res.status(400).json({ error: 'Channel, text, and scheduledTime are required' });
        return;
      }
      
      const scheduledDate = new Date(scheduledTime);
      if (isNaN(scheduledDate.getTime())) {
        res.status(400).json({ error: 'Invalid scheduledTime format' });
        return;
      }
      
      const messageId = await this.messageService.scheduleMessageForLater(
        userId, 
        channel, 
        text, 
        scheduledDate
      );
      
      res.status(201).json({ success: true, messageId });
    } catch (error) {
      console.error('Error scheduling message:', error);
      
      if (error instanceof Error && error.message === 'Scheduled time must be in the future') {
        res.status(400).json({ error: error.message });
      } else if (error instanceof Error && error.message && (
          error.message.includes('token') || 
          error.message.includes('auth') || 
          error.message.includes('permission'))
      ) {
        res.status(401).json({ 
          error: 'Authentication error with Slack', 
          requiresSlackAuth: true 
        });
      } else {
        res.status(500).json({ error: 'Failed to schedule message' });
      }
    }
  };
  
  getScheduledMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      
      const messages = await this.messageService.getScheduledMessages(userId);
      res.status(200).json({ messages });
    } catch (error) {
      console.error('Error getting scheduled messages:', error);
      res.status(500).json({ error: 'Failed to get scheduled messages' });
    }
  };
  
  cancelScheduledMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      
      if (!id) {
        res.status(400).json({ error: 'Message ID is required' });
        return;
      }
      
      await this.messageService.cancelScheduledMessage(id);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error canceling scheduled message:', error);
      
      if (error instanceof Error && error.message && error.message.includes('not found')) {
        res.status(404).json({ error: 'Scheduled message not found' });
      } else {
        res.status(500).json({ error: 'Failed to cancel scheduled message' });
      }
    }
  };
}
