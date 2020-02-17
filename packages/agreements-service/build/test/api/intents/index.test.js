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
    let managedIntent;
    let unmanagedIntent;
    let db;
    beforeEach(async () => {
        db = await db_1.refreshDatabase();
        app = new src_1.App(agreementBucket);
        app.listen(4000);
        await src_1.Agreement.query().insert({ assetCode: 'USD', assetScale: 2, callback: 'http://localhost:3000/ilpcallback', scope: '$wallet.example.com/alice', userId: 1, type: 'intent' });
        await src_1.Agreement.query().insert({ assetCode: 'USD', assetScale: 2, amount: '500', scope: '$wallet.example.com/alice', userId: 1, type: 'mandate' });
        managedIntent = await src_1.Agreement.query().insertAndFetch({ assetCode: 'USD', assetScale: 2, callback: 'http://localhost:3000/ilpcallback', scope: '$wallet.example.com/alice', userId: 2, type: 'intent' });
        unmanagedIntent = await src_1.Agreement.query().insertAndFetch({ assetCode: 'USD', assetScale: 2, secret: 'secret', secretSalt: 'salt', scope: '$wallet.example.com/alice', userId: 2, type: 'intent' });
    });
    afterEach(async () => {
        app.shutdown();
        await src_1.Agreement.query().delete();
        await db.destroy();
    });
    test('can retrieve intents for a user\'s wallet account', async () => {
        const { data } = await axios_1.default.get('http://localhost:4000/intents?userId=2');
        expect(data.length).toBe(2);
        expect([data[0].id, data[1].id]).toEqual([managedIntent.id, unmanagedIntent.id]);
        const returnedManagedIntent = data[0].id === managedIntent.id ? data[0] : data[1];
        const returnedUnmanagedIntent = data[1].id === unmanagedIntent.id ? data[1] : data[0];
        expect(returnedManagedIntent.destination).toEqual(`test.wallet.intents.${managedIntent.id}`);
        expect(returnedManagedIntent.balance).toEqual(0);
        expect(returnedUnmanagedIntent.destination).toEqual(`test.wallet.intents.${unmanagedIntent.id}`);
        expect(returnedUnmanagedIntent.balance).toEqual(0);
        expect(returnedUnmanagedIntent.secret).not.toBeDefined();
        expect(returnedUnmanagedIntent.secretSalt).toEqual('salt');
        expect(returnedUnmanagedIntent.secretHash).toEqual(crypto_1.createHmac('SHA256', 'salt').update('secret').digest('base64'));
    });
});
//# sourceMappingURL=index.test.js.map