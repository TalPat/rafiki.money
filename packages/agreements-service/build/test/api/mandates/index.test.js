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
describe('Index mandates', () => {
    let app;
    let mandate;
    let db;
    beforeEach(async () => {
        db = await db_1.refreshDatabase();
        app = new src_1.App(agreementBucket);
        app.listen(4000);
        mandate = await src_1.Agreement.query().insertAndFetch({ scope: '$wallet.example/alice', amount: '100', assetCode: 'USD', assetScale: 2, userId: 4, type: 'mandate' });
        await src_1.Agreement.query().insertAndFetch({ scope: '$wallet.example/alice', callback: 'http://localhost:3000/ilpcallback', amount: '100', assetCode: 'USD', assetScale: 2, userId: 4, type: 'intent' });
        await src_1.Agreement.query().insertAndFetch({ scope: '$wallet.example/bob', amount: '100', assetCode: 'USD', assetScale: 2, userId: 5, type: 'mandate' });
    });
    afterEach(async () => {
        app.shutdown();
        await src_1.Agreement.query().delete();
        await db.destroy();
    });
    test('can retrieve mandates for users wallet account', async () => {
        const { data } = await axios_1.default.get('http://localhost:4000/mandates?userId=4');
        expect(data.length).toEqual(1);
        expect(data[0].id).toEqual(mandate.id);
        expect(data[0].amount).toEqual(mandate.amount);
        expect(data[0].balance).toEqual(100);
        expect(data[0].asset.code).toEqual(mandate.assetCode);
        expect(data[0].asset.scale).toEqual(mandate.assetScale);
        expect(data[0].userId).toEqual(mandate.userId);
    });
});
//# sourceMappingURL=index.test.js.map