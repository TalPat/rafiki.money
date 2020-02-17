"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const got_1 = __importDefault(require("got"));
const http_plugin_1 = require("../utils/http-plugin");
const ilp_protocol_stream_1 = require("ilp-protocol-stream");
const ILP_UPLINK_URL = process.env.ILP_UPLINK_URL || 'https://localhost:3001';
exports.Pay = async (agreementId, amount, authToken, destinationAccount, sharedSecret) => {
    try {
        const URL = ILP_UPLINK_URL + `/agreements/${agreementId}/ilp`;
        const plugin = new http_plugin_1.HttpPlugin(URL, authToken);
        const connection = await ilp_protocol_stream_1.createConnection({
            plugin,
            destinationAccount,
            sharedSecret: Buffer.from(sharedSecret, 'base64')
        });
        const stream = connection.createStream();
        await stream.sendTotal(amount);
        await stream.end();
    }
    catch (e) {
        throw new Error('');
    }
};
exports.queryPaymentPointer = async (paymentPointer) => {
    const endpoint = new URL(paymentPointer.startsWith('$')
        ? 'https://' + paymentPointer.substring(1)
        : paymentPointer);
    endpoint.pathname = endpoint.pathname === '/'
        ? '/.well-known/pay'
        : endpoint.pathname;
    const response = await got_1.default(endpoint.href, {
        json: true,
        headers: { accept: 'application/spsp4+json, application/spsp+json' }
    });
    if (response.statusCode !== 200) {
        throw new Error('got error response from spsp payment pointer.' +
            ' endpoint="' + endpoint.href + '"' +
            ' status=' + response.statusCode +
            ' message="' + (await response.body.toString()) + '"');
    }
    const json = await response.body;
    return {
        destinationAccount: json.destination_account,
        sharedSecret: json.shared_secret
    };
};
//# sourceMappingURL=stream.js.map