import { Database } from '../db/database';
import { ScheduledMessage, MessageStatus } from '../models/ScheduledMessage';

export class MessageRepository {
  private db: Database;
  
  constructor(db: Database) {
    this.db = db;
    this.initializeTable();
  }
  
  private async initializeTable(): Promise<void> {
    try {
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS scheduled_messages (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          channel TEXT NOT NULL,
          text TEXT NOT NULL,
          scheduledTime TIMESTAMP WITH TIME ZONE NOT NULL,
          status TEXT DEFAULT 'scheduled',
          errorMessage TEXT
        )
      `);
    } catch (error) {
      console.error('Error initializing message table:', error);
      throw new Error('Failed to initialize database');
    }
  }
  
  async saveScheduledMessage(message: ScheduledMessage): Promise<void> {
    try {
      await this.db.execute(
        `INSERT INTO scheduled_messages (id, userId, channel, text, scheduledTime, status, errorMessage)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          message.id, 
          message.userId, 
          message.channel, 
          message.text, 
          message.scheduledTime.toISOString(),
          message.status || MessageStatus.SCHEDULED,
          message.errorMessage || null
        ]
      );
    } catch (error) {
      console.error('Error saving scheduled message:', error);
      throw new Error('Failed to save scheduled message');
    }
  }
  
  async getScheduledMessage(id: string): Promise<ScheduledMessage | null> {
    try {
      const result = await this.db.query(
        `SELECT * FROM scheduled_messages WHERE id = $1`,
        [id]
      );
      
      if (result && result.length > 0) {
        return {
          id: result[0].id,
          userId: result[0].userId,
          channel: result[0].channel,
          text: result[0].text,
          scheduledTime: new Date(result[0].scheduledTime),
          status: result[0].status as MessageStatus || MessageStatus.SCHEDULED,
          errorMessage: result[0].errorMessage
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting scheduled message:', error);
      throw new Error('Failed to retrieve scheduled message');
    }
  }
  
  async getScheduledMessagesByUser(userId: string): Promise<ScheduledMessage[]> {
    try {
      const results = await this.db.query(
        `SELECT * FROM scheduled_messages WHERE userId = $1 ORDER BY scheduledTime ASC`,
        [userId]
      );
      
      return results.map(row => ({
        id: row.id,
        userId: row.userId,
        channel: row.channel,
        text: row.text,
        scheduledTime: new Date(row.scheduledTime),
        status: row.status as MessageStatus || MessageStatus.SCHEDULED,
        errorMessage: row.errorMessage
      }));
    } catch (error) {
      console.error('Error getting user scheduled messages:', error);
      throw new Error('Failed to retrieve scheduled messages');
    }
  }
  
  async getAllScheduledMessages(): Promise<ScheduledMessage[]> {
    try {
      let query = `SELECT * FROM scheduled_messages`;
      
      try {
        // Try with status column filter
        const results = await this.db.query(
          `SELECT * FROM scheduled_messages WHERE status = $1 ORDER BY scheduledTime ASC`,
          [MessageStatus.SCHEDULED]
        );
        
        return results.map(row => ({
          id: row.id,
          userId: row.userId,
          channel: row.channel,
          text: row.text,
          scheduledTime: new Date(row.scheduledTime),
          status: row.status as MessageStatus || MessageStatus.SCHEDULED,
          errorMessage: row.errorMessage
        }));
      } catch (error) {
        // Fallback to querying without status filter if column doesn't exist
        console.log('Falling back to query without status filter due to:', error);
        const results = await this.db.query(
          `SELECT * FROM scheduled_messages ORDER BY scheduledTime ASC`
        );
        
        return results.map(row => ({
          id: row.id,
          userId: row.userId,
          channel: row.channel,
          text: row.text,
          scheduledTime: new Date(row.scheduledTime),
          status: MessageStatus.SCHEDULED, // Default status
          errorMessage: undefined
        }));
      }
    } catch (error) {
      console.error('Error getting all scheduled messages:', error);
      throw new Error('Failed to retrieve all scheduled messages');
    }
  }
  
  async updateMessageStatus(id: string, status: MessageStatus, errorMessage?: string): Promise<void> {
    try {
      await this.db.execute(
        `UPDATE scheduled_messages SET status = $1, errorMessage = $2 WHERE id = $3`,
        [status, errorMessage || null, id]
      );
    } catch (error) {
      console.error('Error updating message status:', error);
      throw new Error('Failed to update message status');
    }
  }
  
  async deleteScheduledMessage(id: string): Promise<void> {
    try {
      await this.db.execute(
        `DELETE FROM scheduled_messages WHERE id = $1`,
        [id]
      );
    } catch (error) {
      console.error('Error deleting scheduled message:', error);
      throw new Error('Failed to delete scheduled message');
    }
  }
}
