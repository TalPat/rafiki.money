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
describe('Create mandate', () => {
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
    test('can create mandate without user and account', async () => {
        const postData = {
            description: 'Test transaction',
            asset: {
                scale: 2,
                code: 'USD'
            },
            amount: '500'
        };
        expect(await src_1.Agreement.query()).toEqual([]);
        const { status, data } = await axios_1.default.post('http://localhost:4000/mandates', postData);
        expect(status).toEqual(201);
        expect(data.amount).toEqual('500');
        expect(data.asset).toEqual({ scale: 2, code: 'USD' });
        const mandate = await src_1.Agreement.query().where('id', data['id']).first();
        expect(mandate).toBeDefined();
        expect(mandate.isMandate()).toBe(true);
        expect(mandate.amount).toEqual('500');
        expect(mandate.description).toEqual('Test transaction');
        expect(mandate.assetCode).toEqual('USD');
        expect(mandate.assetScale).toEqual(2);
    });
    test('can create mandate with user and account', async () => {
        const postData = {
            description: 'Test transaction',
            asset: {
                scale: 2,
                code: 'USD'
            },
            amount: '500',
            userId: '1',
            accountId: '1',
            subject: 'awesome-service'
        };
        expect(await src_1.Agreement.query()).toEqual([]);
        const { status, data } = await axios_1.default.post('http://localhost:4000/mandates', postData);
        expect(status).toEqual(201);
        expect(data.amount).toEqual('500');
        expect(data.asset).toEqual({ scale: 2, code: 'USD' });
        const mandate = await src_1.Agreement.query().where('id', data['id']).first();
        expect(mandate).toBeDefined();
        expect(mandate.isMandate()).toBe(true);
        expect(mandate.amount).toEqual('500');
        expect(mandate.description).toEqual('Test transaction');
        expect(mandate.assetCode).toEqual('USD');
        expect(mandate.assetScale).toEqual(2);
        expect(mandate.userId).toEqual(1);
        expect(mandate.accountId).toEqual(1);
        expect(mandate.subject).toEqual('awesome-service');
    });
    test('defaults the start of the mandate to now', async () => {
        const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 1434412800000);
        const postData = {
            asset: {
                scale: 2,
                code: 'USD'
            },
            amount: '500'
        };
        expect(await src_1.Agreement.query()).toEqual([]);
        const { status, data } = await axios_1.default.post('http://localhost:4000/mandates', postData);
        expect(status).toEqual(201);
        expect(data.start).toEqual(1434412800000);
        const mandate = await src_1.Agreement.query().where('id', data['id']).first();
        expect(mandate).toBeDefined();
        expect(mandate.isMandate()).toBe(true);
        expect(mandate.start).toEqual(1434412800000);
        dateNowSpy.mockRestore();
    });
    test('sets the start of the mandate to the given start time', async () => {
        const postData = {
            asset: {
                scale: 2,
                code: 'USD'
            },
            amount: '500',
            start: 1434412800000
        };
        expect(await src_1.Agreement.query()).toEqual([]);
        const { status, data } = await axios_1.default.post('http://localhost:4000/mandates', postData);
        expect(status).toEqual(201);
        expect(data.start).toEqual(1434412800000);
        const mandate = await src_1.Agreement.query().where('id', data['id']).first();
        expect(mandate).toBeDefined();
        expect(mandate.isMandate()).toBe(true);
        expect(mandate.start).toEqual(1434412800000);
    });
    test('defaults expiry null', async () => {
        const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 1434412800000);
        const postData = {
            asset: {
                scale: 2,
                code: 'USD'
            },
            amount: '500'
        };
        expect(await src_1.Agreement.query()).toEqual([]);
        const { status, data } = await axios_1.default.post('http://localhost:4000/mandates', postData);
        expect(status).toEqual(201);
        expect(data.expiry).toEqual(undefined);
        const mandate = await src_1.Agreement.query().where('id', data['id']).first();
        expect(mandate).toBeDefined();
        expect(mandate.isMandate()).toBe(true);
        expect(mandate.expiry).toEqual(null);
        dateNowSpy.mockRestore();
    });
    test('sets the expiry to the given expiry', async () => {
        const postData = {
            asset: {
                scale: 2,
                code: 'USD'
            },
            amount: '500',
            expiry: 1434412800000
        };
        expect(await src_1.Agreement.query()).toEqual([]);
        const { status, data } = await axios_1.default.post('http://localhost:4000/mandates', postData);
        expect(status).toEqual(201);
        expect(data.expiry).toEqual(1434412800000);
        const mandate = await src_1.Agreement.query().where('id', data['id']).first();
        expect(mandate).toBeDefined();
        expect(mandate.isMandate()).toBe(true);
        expect(mandate.expiry).toEqual(1434412800000);
    });
    test('sets the scope to the given scope', async () => {
        const postData = {
            scope: '$wallet.example/alice',
            asset: {
                scale: 2,
                code: 'USD'
            },
            amount: '500',
            expiry: 1434412800000
        };
        expect(await src_1.Agreement.query()).toEqual([]);
        const { status, data } = await axios_1.default.post('http://localhost:4000/mandates', postData);
        expect(status).toEqual(201);
        expect(data.expiry).toEqual(1434412800000);
        const mandate = await src_1.Agreement.query().where('id', data['id']).first();
        expect(mandate).toBeDefined();
        expect(mandate.isMandate()).toBe(true);
        expect(mandate.scope).toEqual('$wallet.example/alice');
    });
});
describe('Edit mandate', () => {
    let db;
    let app;
    let mandate;
    beforeEach(async () => {
        db = await db_1.refreshDatabase();
        app = new src_1.App(agreementBucket);
        app.listen(4000);
        mandate = await src_1.Agreement.query().insertAndFetch({ amount: '100', assetCode: 'USD', assetScale: 2, type: 'mandate' });
        await src_1.Agreement.query().insertAndFetch({ amount: '100', assetCode: 'USD', assetScale: 2, userId: 5, type: 'mandate' });
    });
    afterEach(async () => {
        app.shutdown();
        await src_1.Agreement.query().delete();
        await db.destroy();
    });
    test('can edit userId', async () => {
        expect(mandate.userId).toBeNull();
        const { status, data } = await axios_1.default.patch('http://localhost:4000/mandates/' + mandate.id, {
            userId: 4
        });
        expect(status).toEqual(200);
        expect(data.userId).toEqual(4);
        const editedMandate = await mandate.$query();
        expect(editedMandate.isMandate()).toBe(true);
        expect(editedMandate.userId).toEqual(4);
        expect(editedMandate.accountId).toBeNull();
        expect(editedMandate.amount).toEqual(mandate.amount);
        expect(editedMandate.assetCode).toEqual(mandate.assetCode);
        expect(editedMandate.assetScale).toEqual(mandate.assetScale);
    });
    test('can edit accountId', async () => {
        expect(mandate.userId).toBeNull();
        const { status, data } = await axios_1.default.patch('http://localhost:4000/mandates/' + mandate.id, {
            accountId: 3
        });
        expect(status).toEqual(200);
        expect(data.accountId).toEqual(3);
        const editedMandate = await mandate.$query();
        expect(editedMandate.accountId).toEqual(3);
        expect(editedMandate.userId).toBeNull();
        expect(editedMandate.amount).toEqual(mandate.amount);
        expect(editedMandate.assetCode).toEqual(mandate.assetCode);
        expect(editedMandate.assetScale).toEqual(mandate.assetScale);
    });
    test('can edit scope', async () => {
        expect(mandate.scope).toBeNull();
        const { status, data } = await axios_1.default.patch('http://localhost:4000/mandates/' + mandate.id, {
            scope: 'https://wallet.example/alice'
        });
        expect(status).toEqual(200);
        expect(data.scope).toEqual('https://wallet.example/alice');
        const editedMandate = await mandate.$query();
        expect(editedMandate.scope).toEqual('https://wallet.example/alice');
        expect(editedMandate.userId).toBeNull();
        expect(editedMandate.amount).toEqual(mandate.amount);
        expect(editedMandate.assetCode).toEqual(mandate.assetCode);
        expect(editedMandate.assetScale).toEqual(mandate.assetScale);
    });
    test('cant edit other fields', async () => {
        try {
            await axios_1.default.patch('http://localhost:4000/mandates/' + mandate.id, {
                start: Date.now(),
                expiry: Date.now()
            });
        }
        catch (error) {
            expect(error.response.status).toEqual(400);
            return;
        }
        expect(false).toBe(true);
    });
    test('cant edit an intent', async () => {
        const intent = await src_1.Agreement.query().insertAndFetch({ scope: '$wallet.example/alice', callback: 'http://localhost:3000/ilpcallback', assetCode: 'USD', assetScale: 2, type: 'intent' });
        try {
            await axios_1.default.patch('http://localhost:4000/mandates/' + intent.id, {});
        }
        catch (error) {
            expect(error.response.status).toEqual(404);
            return;
        }
        expect(false).toBe(true);
    });
});
//# sourceMappingURL=crud.test.js.map