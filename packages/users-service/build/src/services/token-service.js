"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openid_client_1 = require("openid-client");
class TokenService {
    constructor(config) {
        this._issuerUrl = config.issuerUrl;
        this._clientId = config.clientId;
        this._clientSecret = config.clientSecret;
        this._tokenRefreshTime = config.tokenRefreshTime;
        this.setup();
    }
    async setup() {
        const issuer = await openid_client_1.Issuer.discover(this._issuerUrl);
        this._client = new issuer.Client({
            client_id: this._clientId,
            client_secret: this._clientSecret
        });
    }
    async getAccessToken() {
        if (!this._client) {
            await this.setup();
        }
        return new Promise((resolve, reject) => {
            if (!this._token || this._token.expired()) {
                this._client.grant({
                    grant_type: 'client_credentials'
                }).then((token) => {
                    this._token = token;
                    console.log('token from hydra', token);
                    resolve(this._token.access_token);
                }).catch((error) => { reject(error); });
            }
            else {
                resolve(this._token.access_token);
            }
        });
    }
}
exports.TokenService = TokenService;
//# sourceMappingURL=token-service.js.map