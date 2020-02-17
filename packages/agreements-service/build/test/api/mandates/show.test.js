"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const src_1 = require("../../../src");
const agreementBucket_1 = require("../../../src/services/agreementBucket");
const db_1 = require("../../db");
const MockRedis = require('ioredis-mock');
const mockRedis = new MockRedis();
const agreementBucket = new agreementBucket_1.AgreementBucket(mockRedis);
describe('Show mandate', () => {
    let app;
    let mandate;
    let db;
    beforeEach(async () => {
        db = await db_1.refreshDatabase();
        app = new src_1.App(agreementBucket);
        app.listen(4000);
        mandate = await src_1.Agreement.query().insertAndFetch({ scope: '$wallet.example/alice', amount: '100', assetCode: 'USD', assetScale: 2, userId: 4, accountId: 3, type: 'mandate' });
        await src_1.Agreement.query().insertAndFetch({ scope: '$wallet.example/alice', amount: '100', assetCode: 'USD', assetScale: 2, userId: 5, type: 'mandate' });
    });
    afterEach(async () => {
        app.shutdown();
        await src_1.Agreement.query().delete();
        await db.destroy();
    });
    test('can retrieve mandate by id', async () => {
        const { status, data } = await axios_1.default.get('http://localhost:4000/mandates/' + mandate.id);
        expect(status).toEqual(200);
        expect(data.id).toEqual(mandate.id);
        expect(data.amount).toEqual(mandate.amount);
        expect(data.asset).toEqual({ code: mandate.assetCode, scale: mandate.assetScale });
        expect(data.userId).toEqual(mandate.userId);
        expect(data.accountId).toEqual(mandate.accountId);
        expect(data.balance).toEqual(100);
    });
    test('returns 404 if mandate does not exist', async () => {
        try {
            await axios_1.default.get('http://localhost:4000/mandates/123');
        }
        catch (error) {
            const { status } = error.response;
            expect(status).toEqual(404);
            return;
        }
        expect(false).toBe(true);
    });
    test('returns 404 if id belongs to an intent', async () => {
        const intent = await src_1.Agreement.query().insertAndFetch({ scope: '$wallet.example/alice', callback: 'http://localhost:3000/ilpcallback', assetCode: 'USD', assetScale: 2, type: 'intent' });
        try {
            await axios_1.default.get('http://localhost:4000/mandates/' + intent.id);
        }
        catch (error) {
            const { status } = error.response;
            expect(status).toEqual(404);
            return;
        }
        expect(false).toBe(true);
    });
});
//# sourceMappingURL=show.test.js.map