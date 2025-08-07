import { Database } from '../db/database';
interface TokenData {
    userId: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
}
export declare class TokenRepository {
    private db;
    constructor(db: Database);
    saveTokens(userId: string, accessToken: string, refreshToken: string, expiresAt: Date): Promise<void>;
    getTokens(userId: string): Promise<TokenData | null>;
    deleteTokens(userId: string): Promise<void>;
}
export {};
