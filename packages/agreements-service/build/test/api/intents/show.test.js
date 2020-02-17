"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
const src_1 = require("../../../src");
const agreementBucket_1 = require("../../../src/services/agreementBucket");
const db_1 = require("../../db");
const MockRedis = require('ioredis-mock');
const mockRedis = new MockRedis();
const agreementBucket = new agreementBucket_1.AgreementBucket(mockRedis);
describe('Getting an Intent', () => {
    let app;
    let db;
    beforeEach(async () => {
        db = await db_1.refreshDatabase();
        app = new src_1.App(agreementBucket);
        app.listen(4000);
    });
    afterEach(async () => {
        app.shutdown();
        await src_1.Agreement.query().delete();
        await db.destroy();
    });
    test('does not leak secret for an un-managed intent', async () => {
        const intent = await src_1.Agreement.query().insertAndFetch({ scope: '$wallet.example.alice', assetCode: 'USD', assetScale: 2, secret: 'secret', secretSalt: 'salt', type: 'intent' });
        const { data } = await axios_1.default.get(`http://localhost:4000/intents/${intent.id}`);
        expect(data.secret).not.toBeDefined();
        expect(data.secretSalt).toEqual('salt');
        expect(data.secretHash).toEqual(crypto_1.createHmac('SHA256', 'salt').update('secret').digest('base64'));
    });
    test('shows the balance as how much has been "taken" from the agreement bucket', async () => {
        const intent = await src_1.Agreement.query().insertAndFetch({ scope: '$wallet.example.alice', assetCode: 'USD', assetScale: 2, secret: 'secret', secretSalt: 'salt', start: Date.now(), type: 'intent' });
        const response = await axios_1.default.get(`http://localhost:4000/intents/${intent.id}`);
        expect(response.data.balance).toEqual(0);
        await agreementBucket.take(intent, 10);
        const response2 = await axios_1.default.get(`http://localhost:4000/intents/${intent.id}`);
        expect(response2.data.balance).toEqual(10);
    });
    test('sets the destination to <configured address>.intents.<intent id>', async () => {
        const intent = await src_1.Agreement.query().insertAndFetch({ scope: '$wallet.example.alice', assetCode: 'USD', assetScale: 2, callback: 'http://localhost:3000/ilpcallback', type: 'intent' });
        const { data } = await axios_1.default.get(`http://localhost:4000/intents/${intent.id}`);
        expect(data.secret).not.toBeDefined();
        expect(data.destination).toEqual(`test.wallet.intents.${intent.id}`);
    });
    test('returns 404 for a mandate id', async () => {
        const mandate = await src_1.Agreement.query().insertAndFetch({ scope: '$wallet.example/bob', amount: '100', assetCode: 'USD', assetScale: 2, userId: 5, type: 'mandate' });
        try {
            await axios_1.default.get(`http://localhost:4000/intents/${mandate.id}`);
        }
        catch (error) {
            expect(error.response.status).toEqual(404);
            return;
        }
        expect(false).toBe(true);
    });
});
//# sourceMappingURL=show.test.js.map