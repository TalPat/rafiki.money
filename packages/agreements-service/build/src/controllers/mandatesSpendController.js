"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const winston_1 = require("../winston");
const stream_1 = require("../services/stream");
const logger = winston_1.log.child({ component: 'Mandates Spend Controller' });
async function store(ctx) {
    logger.debug('Mandate spend request', { body: ctx.request.body, headers: ctx.request.headers });
    const { headers } = ctx;
    try {
        const mandateId = ctx.request.params['id'];
        const mandate = await models_1.Agreement.query().where('id', mandateId).andWhere('type', 'mandate').first();
        const authToken = getToken(headers);
        const { paymentPointer, amount } = ctx.request.body;
        if (!mandate) {
            ctx.response.status = 404;
            ctx.response.message = 'No mandate found';
            return;
        }
        const spspDetails = await stream_1.queryPaymentPointer(paymentPointer);
        try {
            await stream_1.Pay(mandateId, amount, authToken, spspDetails.destinationAccount, spspDetails.sharedSecret);
        }
        catch (error) {
            logger.error('Error sending payment', { error });
        }
        ctx.response.status = 201;
    }
    catch (error) {
        logger.error(error.message);
        throw error;
    }
}
exports.store = store;
const getToken = (header) => {
    if (header && header.authorization) {
        const parts = header.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            return parts[1];
        }
    }
};
//# sourceMappingURL=mandatesSpendController.js.map