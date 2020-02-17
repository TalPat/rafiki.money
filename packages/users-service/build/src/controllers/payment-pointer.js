"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../models/user");
const crypto_1 = require("ilp-protocol-stream/src/crypto");
const crypto_2 = require("crypto");
const INTENTS_URL = process.env.INTENTS_URL || 'http://localhost:3001/intents';
const MANDATES_URL = process.env.MANDATES_URL || 'http://localhost:3001/mandates';
const SUPPORTED_ASSETS = process.env.SUPPORTED_ASSETS || JSON.stringify(['USD']);
const AUTHORIZATION_URL = process.env.AUTHORIZATION_URL || 'http://localhost:9000/oauth2/auth';
const ISSUER_URL = process.env.ISSUER_URL || 'http://localhost:9000/';
const TOKEN_URL = process.env.TOKEN_URL || 'http://localhost:9000/oauth2/token';
const STREAM_SERVER_SECRET = process.env.STREAM_SERVER_SECRET ? Buffer.from(process.env.STREAM_SERVER_SECRET, 'hex') : crypto_2.randomBytes(32);
const ILP_STREAM_SUBADDRESS = process.env.ILP_STREAM_SUBADDRESS || 'test.wallet';
const base64url = (buffer) => {
    return buffer.toString('base64')
        .replace(/=+$/, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
};
async function show(ctx) {
    ctx.logger.debug('Payment pointer request', { path: ctx.request.path });
    const username = ctx.request.params.username;
    const user = await user_1.User.query().where('username', username).first();
    ctx.assert(user, 404, 'No user found.');
    if (ctx.get('Accept').indexOf('application/spsp4+json') !== -1) {
        const token = base64url(crypto_1.generateToken());
        const sharedSecret = crypto_1.generateSharedSecretFromToken(STREAM_SERVER_SECRET, Buffer.from(token, 'ascii'));
        if (user && !user.defaultAccountId) {
            ctx.status = 404;
            return;
        }
        const destinationAccount = `${ILP_STREAM_SUBADDRESS}.${user.defaultAccountId}.${token}`;
        ctx.body = {
            destination_account: destinationAccount,
            shared_secret: sharedSecret.toString('base64')
        };
        ctx.set('Content-Type', 'application/spsp4+json');
        ctx.set('Access-Control-Allow-Origin', '*');
    }
    else {
        ctx.body = {
            payment_intents_endpoint: INTENTS_URL,
            payment_mandates_endpoint: MANDATES_URL,
            payment_assets_supported: JSON.parse(SUPPORTED_ASSETS),
            issuer_endpoint: ISSUER_URL,
            authorization_endpoint: AUTHORIZATION_URL,
            token_endpoint: TOKEN_URL
        };
    }
}
exports.show = show;
//# sourceMappingURL=payment-pointer.js.map