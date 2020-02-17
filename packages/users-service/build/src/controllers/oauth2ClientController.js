"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const koa_joi_router_1 = require("koa-joi-router");
const hydra_1 = require("../services/hydra");
async function store(ctx) {
    ctx.logger.info('Register Oauth2 client request', { body: ctx.request.body });
    const clientDetails = ctx.request.body;
    try {
        const client = await hydra_1.hydra.createOauthClient(clientDetails);
        ctx.body = client;
    }
    catch (error) {
        ctx.logger.error('Could not register client on oauth provider.', { error: error.response });
        ctx.status = 500;
        ctx.message = 'Could not register client on oauth provider.';
    }
}
exports.store = store;
function createValidation() {
    return {
        validate: {
            type: 'json',
            body: koa_joi_router_1.Joi.object({
                client_id: koa_joi_router_1.Joi.string().required(),
                client_name: koa_joi_router_1.Joi.string().optional(),
                scope: koa_joi_router_1.Joi.string().optional(),
                logo_uri: koa_joi_router_1.Joi.string().optional(),
                response_types: koa_joi_router_1.Joi.array().items(koa_joi_router_1.Joi.string()).optional(),
                grant_types: koa_joi_router_1.Joi.array().items(koa_joi_router_1.Joi.string()).optional(),
                redirect_uris: koa_joi_router_1.Joi.array().items(koa_joi_router_1.Joi.string()).optional(),
                token_endpoint_auth_method: koa_joi_router_1.Joi.string().optional()
            })
        }
    };
}
exports.createValidation = createValidation;
//# sourceMappingURL=oauth2ClientController.js.map