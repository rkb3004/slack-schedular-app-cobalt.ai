import { TokenRepository } from '../repositories/token.repository';
export declare class SlackAuthService {
    private tokenRepository;
    private clientId;
    private clientSecret;
    private redirectUri;
    constructor(tokenRepository: TokenRepository);
    exchangeCodeForToken(code: string, userId: string): Promise<void>;
    getAccessToken(userId: string): Promise<string>;
    private refreshToken;
    disconnectUser(userId: string): Promise<void>;
}
