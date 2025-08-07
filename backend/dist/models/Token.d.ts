export declare class TokenEntity {
    id?: number;
    userId?: string;
    teamId?: string;
    teamName?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    scope?: string;
    botUserId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface Token {
    userId: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
}
