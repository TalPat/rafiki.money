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
describe('Cancel mandate', () => {
    let db;
    let app;
    let mandate;
    beforeEach(async () => {
        db = await db_1.refreshDatabase();
        app = new src_1.App(agreementBucket);
        app.listen(4000);
        mandate = await src_1.Agreement.query().insertAndFetch({
            amount: '100',
            assetCode: 'USD',
            assetScale: 2,
            type: 'mandate'
        });
    });
    afterEach(async () => {
        app.shutdown();
        await src_1.Agreement.query().delete();
        await db.destroy();
    });
    test('cancel a valid mandate should return 200', async () => {
        let timestamp = new Date().getTime();
        const { status, data } = await axios_1.default.patch('http://localhost:4000/mandates/' + mandate.id, {
            cancelled: timestamp
        });
        expect(status).toEqual(200);
        expect(data.cancelled).toEqual(timestamp);
        const editedMandate = await mandate.$query();
        expect(editedMandate.isMandate()).toBe(true);
        expect(editedMandate.accountId).toBeNull();
        expect(editedMandate.amount).toEqual(mandate.amount);
        expect(editedMandate.assetCode).toEqual(mandate.assetCode);
        expect(editedMandate.assetScale).toEqual(mandate.assetScale);
    });
    test('cancel a non-existant mandate should return 404', async () => {
        let timestamp = new Date().getTime();
        try {
            await axios_1.default.patch('http://localhost:4000/mandates/123', {
                cancelled: timestamp
            });
        }
        catch (error) {
            const { status } = error.response;
            expect(status).toEqual(404);
            return;
        }
        expect(false).toBe(true);
    });
    test('cancel a mandate that has already been cancelled should rerturn 400', async () => {
        let timestamp = new Date().getTime();
        let cancelledmandate = await src_1.Agreement.query().insertAndFetch({
            amount: '100',
            assetCode: 'USD',
            assetScale: 2,
            type: 'mandate',
            cancelled: timestamp
        });
        try {
            await axios_1.default.patch('http://localhost:4000/mandates/' + cancelledmandate.id, {
                cancelled: timestamp
            });
        }
        catch (error) {
            const { status } = error.response;
            expect(status).toEqual(400);
            return;
        }
        expect(false).toBe(true);
    });
});
describe('retrieve agreements by state', () => {
    let db;
    let app;
    let normalMandate;
    let expiredMandate;
    let cancelledMandate;
    let timestamp = new Date().getTime();
    let testUserId = 5;
    beforeEach(async () => {
        db = await db_1.refreshDatabase();
        app = new src_1.App(agreementBucket);
        app.listen(4000);
        normalMandate = await src_1.Agreement.query().insertAndFetch({
            amount: '100',
            assetCode: 'USD',
            assetScale: 2,
            userId: testUserId,
            type: 'mandate',
            expiry: timestamp + 1000000
        });
        expiredMandate = await src_1.Agreement.query().insertAndFetch({
            amount: '100',
            assetCode: 'USD',
            assetScale: 2,
            userId: testUserId,
            type: 'mandate',
            expiry: timestamp - 1000
        });
        cancelledMandate = await src_1.Agreement.query().insertAndFetch({
            amount: '100',
            assetCode: 'USD',
            assetScale: 2,
            userId: testUserId,
            type: 'mandate',
            cancelled: timestamp,
            expiry: timestamp + 1000000
        });
    });
    afterEach(async () => {
        app.shutdown();
        await src_1.Agreement.query().delete();
        await db.destroy();
    });
    test('retirieving valid agreement should have matching ids and return 200', async () => {
        const { status, data } = await axios_1.default.get(`http://localhost:4000/mandates/?userId=${testUserId}&state=active`);
        console.log(`http://localhost:4000/mandates/?userId=${testUserId}&state=active`, data, normalMandate);
        expect(status).toEqual(200);
        expect(data.length).toEqual(1);
        expect(data[0].id).toEqual(normalMandate.id);
    });
    test('retirieving expired agreement should have matching ids and return 200', async () => {
        const { status, data } = await axios_1.default.get(`http://localhost:4000/mandates/?userId=${testUserId}&state=expired`);
        console.log(data);
        expect(status).toEqual(200);
        expect(data.length).toEqual(1);
        expect(data[0].id).toEqual(expiredMandate.id);
    });
    test('retirieving cancelled agreement should have matching ids and return 200', async () => {
        const { status, data } = await axios_1.default.get(`http://localhost:4000/mandates/?userId=${testUserId}&state=cancelled`);
        console.log(data);
        expect(status).toEqual(200);
        expect(data.length).toEqual(1);
        expect(data[0].id).toEqual(cancelledMandate.id);
    });
});
//# sourceMappingURL=cancel.test.js.map