"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenRepository = void 0;
class TokenRepository {
    constructor(db) {
        this.db = db;
    }
    async saveTokens(userId, accessToken, refreshToken, expiresAt) {
        try {
            await this.db.execute(`INSERT INTO slack_tokens (userId, accessToken, refreshToken, expiresAt)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (userId) DO UPDATE SET
         accessToken = $2,
         refreshToken = $3,
         expiresAt = $4`, [userId, accessToken, refreshToken, expiresAt.toISOString()]);
        }
        catch (error) {
            console.error('Error saving tokens:', error);
            throw new Error('Failed to save tokens');
        }
    }
    async getTokens(userId) {
        try {
            const result = await this.db.query(`SELECT userId, accessToken, refreshToken, expiresAt FROM slack_tokens WHERE userId = $1`, [userId]);
            if (result && result.length > 0) {
                return {
                    userId: result[0].userId,
                    accessToken: result[0].accessToken,
                    refreshToken: result[0].refreshToken,
                    expiresAt: new Date(result[0].expiresAt)
                };
            }
            return null;
        }
        catch (error) {
            console.error('Error getting tokens:', error);
            throw new Error('Failed to retrieve tokens');
        }
    }
    async deleteTokens(userId) {
        try {
            await this.db.execute(`DELETE FROM slack_tokens WHERE userId = $1`, [userId]);
        }
        catch (error) {
            console.error('Error deleting tokens:', error);
            throw new Error('Failed to delete tokens');
        }
    }
}
exports.TokenRepository = TokenRepository;
