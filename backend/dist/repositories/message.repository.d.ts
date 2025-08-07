import { Database } from '../db/database';
import { ScheduledMessage, MessageStatus } from '../models/ScheduledMessage';
export declare class MessageRepository {
    private db;
    constructor(db: Database);
    private initializeTable;
    saveScheduledMessage(message: ScheduledMessage): Promise<void>;
    getScheduledMessage(id: string): Promise<ScheduledMessage | null>;
    getScheduledMessagesByUser(userId: string): Promise<ScheduledMessage[]>;
    getAllScheduledMessages(): Promise<ScheduledMessage[]>;
    updateMessageStatus(id: string, status: MessageStatus, errorMessage?: string): Promise<void>;
    deleteScheduledMessage(id: string): Promise<void>;
}
