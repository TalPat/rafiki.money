"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const src_1 = require("../../src");
const agreementBucketMock_1 = require("../mocks/agreementBucketMock");
const db_1 = require("../db");
const agreementBucketMock = new agreementBucketMock_1.AgreementBucketMock();
describe('Agreement Transaction', () => {
    let app;
    let agreement;
    let db;
    let cancelledAgreement;
    let timestamp = new Date().getTime();
    beforeEach(async () => {
        db = await db_1.refreshDatabase();
        app = new src_1.App(agreementBucketMock);
        app.listen(4000);
        agreement = await src_1.Agreement.query().insertAndFetch({ amount: '100', assetCode: 'USD', assetScale: 2, userId: 4, accountId: 3 });
        cancelledAgreement = await src_1.Agreement.query().insertAndFetch({ amount: '100', assetCode: 'USD', assetScale: 2, userId: 4, accountId: 3, cancelled: timestamp });
    });
    afterEach(async () => {
        app.shutdown();
        await src_1.Agreement.query().delete();
        await db.destroy();
    });
    test('Posting transaction with available amount returns 201', async () => {
        const { status } = await axios_1.default.post(`http://localhost:4000/agreements/${agreement.id}/transactions`, {
            amount: 50
        });
        expect(status).toEqual(201);
    });
    test('Posting transaction with not available amount returns 403', async () => {
        try {
            const { status } = await axios_1.default.post(`http://localhost:4000/agreements/${agreement.id}/transactions`, {
                amount: 200
            });
        }
        catch (error) {
            const { status } = error.response;
            expect(status).toEqual(403);
            return;
        }
        expect(false).toBe(true);
    });
    test('Posting a transaction that is cancelled returns 403', async () => {
        try {
            const { status } = await axios_1.default.post(`http://localhost:4000/agreements/${cancelledAgreement.id}/transactions`, {
                amount: 10
            });
        }
        catch (error) {
            const { status } = error.response;
            expect(status).toEqual(403);
            return;
        }
        expect(false).toBe(true);
    });
});
//# sourceMappingURL=agreementTransaction.test.js.map