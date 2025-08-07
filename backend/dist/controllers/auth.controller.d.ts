import { Request, Response } from 'express';
export declare const slackOAuthRedirect: (req: Request, res: Response) => void;
export declare const slackOAuthCallback: (req: Request, res: Response) => void;
export declare const getUserInfo: (req: Request, res: Response) => void;
export declare const getSlackScopesInfo: (req: Request, res: Response) => void;
export declare const debugTokenExchange: (req: Request, res: Response) => Promise<void>;
