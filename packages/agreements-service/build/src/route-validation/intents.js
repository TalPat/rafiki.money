"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_joi_router_1 = __importDefault(require("koa-joi-router"));
const Joi = koa_joi_router_1.default.Joi;
exports.store = {
    validate: {
        type: 'json',
        body: Joi.object({
            scope: Joi.string().required(),
            asset: Joi.object({
                code: Joi.string().required(),
                scale: Joi.number().integer().greater(0).required()
            }).required(),
            callback: Joi.string().optional(),
            secret: Joi.string().when('callback', { is: Joi.exist(), then: Joi.forbidden().error(new Error('Specify either callback or secret.')), otherwise: Joi.required().error(new Error('Specify either callback or secret.')) })
        })
    }
};
//# sourceMappingURL=intents.js.map