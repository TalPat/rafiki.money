export declare type TokenServiceConfig = {
    issuerUrl: string;
    clientId: string;
    clientSecret: string;
    tokenRefreshTime: number;
};
export declare class TokenService {
    private _issuerUrl;
    private _clientId;
    private _clientSecret;
    private _tokenRefreshTime;
    private _client;
    private _token;
    constructor(config: TokenServiceConfig);
    setup(): Promise<void>;
    getAccessToken(): Promise<string>;
}
