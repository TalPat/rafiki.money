"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("../winston");
const models_1 = require("../models");
const logger = winston_1.log.child({ component: 'Agreements Transaction Controller' });
async function store(ctx) {
    logger.debug('Create agreement transaction request', { body: ctx.request.body, headers: ctx.request.headers });
    const agreementId = ctx.request.params['id'];
    const { amount } = ctx.request.body;
    try {
        const agreement = await models_1.Agreement.query().where('id', agreementId).first();
        if (!agreement)
            throw new Error('agreement not found');
        if (agreement.cancelled)
            throw new Error('cancelled agreement');
        await ctx.agreementBucket.take(agreement, amount);
        ctx.response.status = 201;
    }
    catch (error) {
        logger.error(error.message);
        ctx.response.status = 403;
    }
}
exports.store = store;
//# sourceMappingURL=agreementsTransactionController.js.map