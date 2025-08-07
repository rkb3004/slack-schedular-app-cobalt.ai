import { MessageRepository } from '../repositories/message.repository';
import { SlackAuthService } from './slackAuth.service';
interface ScheduledMessage {
    id: string;
    userId: string;
    channel: string;
    text: string;
    scheduledTime: Date;
}
export declare class MessageService {
    private messageRepository;
    private slackAuthService;
    constructor(messageRepository: MessageRepository, slackAuthService: SlackAuthService);
    sendMessageImmediately(userId: string, channel: string, text: string): Promise<void>;
    scheduleMessageForLater(userId: string, channel: string, text: string, scheduledTime: Date): Promise<string>;
    getScheduledMessages(userId: string): Promise<ScheduledMessage[]>;
    cancelScheduledMessage(id: string): Promise<void>;
    processScheduledMessages(): Promise<void>;
}
export {};
