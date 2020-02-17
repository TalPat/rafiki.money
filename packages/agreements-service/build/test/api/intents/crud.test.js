"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
const crypto_2 = require("crypto");
const src_1 = require("../../../src");
const agreementBucketMock_1 = require("../../mocks/agreementBucketMock");
const db_1 = require("../../db");
const agreementBucketMock = new agreementBucketMock_1.AgreementBucketMock();
describe('Intent creation', () => {
    let app;
    let db;
    beforeEach(async () => {
        db = await db_1.refreshDatabase();
        app = new src_1.App(agreementBucketMock);
        app.listen(4000);
    });
    afterEach(async () => {
        app.shutdown();
        await src_1.Agreement.query().delete();
        await db.destroy();
    });
    test('uses a 32 byte salt to create a hash of the given secret for an un-managed intent', async () => {
        const secret = crypto_1.randomBytes(32).toString('base64');
        expect(await src_1.Agreement.query()).toEqual([]);
        const { headers, status, data } = await axios_1.default.post('http://localhost:4000/intents', {
            scope: "$wallet.example/alice",
            secret,
            asset: {
                scale: 2,
                code: 'USD',
            }
        });
        expect(status).toEqual(201);
        expect(headers['location']).toEqual(`http://localhost:4000/intents/${data.id}`);
        expect(typeof data.secretSalt).toBe('string');
        expect(Buffer.from(data.secretSalt, 'base64').length).toBe(32);
        const hmacSecret = crypto_2.createHmac('SHA256', data.secretSalt).update(secret).digest().toString('base64');
        expect(data.secretHash).toEqual(hmacSecret);
        expect(data.asset).toEqual({ scale: 2, code: 'USD' });
        expect(data.scope).toEqual("$wallet.example/alice");
        expect(data.amount).not.toBeDefined();
        expect(data.callback).not.toBeDefined();
        expect((await src_1.Agreement.query().first()).isMandate()).toBe(false);
    });
    test('does not hash a secret when a callback is specified for a managed intent', async () => {
        expect(await src_1.Agreement.query()).toEqual([]);
        const { headers, status, data } = await axios_1.default.post('http://localhost:4000/intents', {
            scope: "$wallet.example/alice",
            callback: 'http://localhost:3001/ilpcallback',
            asset: {
                scale: 2,
                code: 'USD',
            }
        });
        expect(status).toEqual(201);
        expect(headers['location']).toEqual(`http://localhost:4000/intents/${data.id}`);
        expect(data.callback).toEqual('http://localhost:3001/ilpcallback');
        expect(data.asset).toEqual({ scale: 2, code: 'USD' });
        expect(data.scope).toEqual("$wallet.example/alice");
        expect(data.amount).not.toBeDefined();
        expect(data.secretHash).not.toBeDefined();
        expect(data.secretSalt).not.toBeDefined();
        expect((await src_1.Agreement.query().first()).isMandate()).toBe(false);
    });
    test('returns the destination as <configured address>.intents.<intent id>', async () => {
        expect(await src_1.Agreement.query()).toEqual([]);
        const { data } = await axios_1.default.post('http://localhost:4000/intents', {
            scope: "$wallet.example/alice",
            callback: 'http://localhost:3001/ilpcallback',
            asset: {
                scale: 2,
                code: 'USD',
            }
        });
        expect(data.destination).toEqual(`test.wallet.intents.${data.id}`);
    });
    test('returns 400 when callback and secret are specified', async () => {
        expect(await src_1.Agreement.query()).toEqual([]);
        const secret = crypto_1.randomBytes(32).toString('base64');
        try {
            await axios_1.default.post('http://localhost:4000/intents', {
                scope: "$wallet.example/alice",
                secret,
                callback: 'http://localhost:3001/ilpcallback',
                asset: {
                    scale: 2,
                    code: 'USD',
                }
            });
        }
        catch (error) {
            expect(error.response.status).toEqual(400);
            expect(error.response.data).toEqual('Specify either callback or secret.');
            return;
        }
        expect(false).toBe(true);
    });
    test('returns 400 when neither callback or secret are specified', async () => {
        expect(await src_1.Agreement.query()).toEqual([]);
        try {
            await axios_1.default.post('http://localhost:4000/intents', {
                scope: "$wallet.example/alice",
                asset: {
                    scale: 2,
                    code: 'USD',
                }
            });
        }
        catch (error) {
            expect(error.response.status).toEqual(400);
            expect(error.response.data).toEqual('Specify either callback or secret.');
            return;
        }
        expect(false).toBe(true);
    });
});
//# sourceMappingURL=crud.test.js.map