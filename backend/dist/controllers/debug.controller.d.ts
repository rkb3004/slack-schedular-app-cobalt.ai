import { Request, Response } from 'express';
import { SlackAuthService } from '../services/slackAuth.service';
export declare class DebugController {
    private slackAuthService;
    constructor(slackAuthService: SlackAuthService);
    getOAuthConfig: (req: Request, res: Response) => Promise<void>;
    generateTestUrl: (req: Request, res: Response) => void;
}
