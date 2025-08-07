import { Request, Response } from 'express';
import { SlackAuthService } from '../services/slackAuth.service';
export declare class SlackController {
    private slackAuthService;
    constructor(slackAuthService: SlackAuthService);
    handleOAuthCallback: (req: Request, res: Response) => Promise<void>;
    getSlackChannels: (req: Request, res: Response) => Promise<void>;
    checkConnection: (req: Request, res: Response) => Promise<void>;
}
