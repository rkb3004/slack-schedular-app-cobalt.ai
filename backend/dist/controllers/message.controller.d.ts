import { Request, Response } from 'express';
import { MessageService } from '../services/message.service';
export declare class MessageController {
    private messageService;
    constructor(messageService: MessageService);
    sendMessage: (req: Request, res: Response) => Promise<void>;
    scheduleMessage: (req: Request, res: Response) => Promise<void>;
    getScheduledMessages: (req: Request, res: Response) => Promise<void>;
    cancelScheduledMessage: (req: Request, res: Response) => Promise<void>;
}
