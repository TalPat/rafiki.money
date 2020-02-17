"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const koa_joi_router_1 = require("koa-joi-router");
const user_1 = require("../models/user");
const hydra_1 = require("../../src/services/hydra");
const signupSession_1 = require("../models/signupSession");
async function show(ctx) {
    const challenge = ctx.request.query.login_challenge;
    ctx.logger.debug('Get login request', { challenge });
    const loginRequest = await hydra_1.hydra.getLoginRequest(challenge).catch(error => {
        ctx.logger.error(error, 'error in login request');
        throw error;
    });
    const requestUrl = new URL(loginRequest['request_url']);
    const signupSessionId = requestUrl.searchParams.get('signupSessionId');
    const session = signupSessionId ? await signupSession_1.SignupSession.query().where('id', signupSessionId).first() : null;
    if (session) {
        const now = Date.now();
        if (session.expiresAt > now) {
            const acceptLogin = await hydra_1.hydra.acceptLoginRequest(challenge, { subject: session.userId,
                remember: true,
                remember_for: 604800
            }).catch(error => {
                ctx.logger.error(error, 'error in accept login request');
                throw error;
            });
            ctx.status = 200;
            ctx.body = { redirectTo: acceptLogin['redirect_to'] };
            return;
        }
    }
    if (loginRequest['skip']) {
        const acceptLogin = await hydra_1.hydra.acceptLoginRequest(challenge, { subject: loginRequest['subject'],
            remember: true,
            remember_for: 604800
        }).catch(error => {
            ctx.logger.error(error, 'error in accept login request');
            throw error;
        });
        ctx.status = 200;
        ctx.body = { redirectTo: acceptLogin['redirect_to'] };
        return;
    }
    ctx.status = 200;
    ctx.body = { redirectTo: null };
}
exports.show = show;
async function store(ctx) {
    const { username, password } = ctx.request.body;
    const challenge = ctx.request.query.login_challenge;
    ctx.logger.debug('Post login request', { username: username, challenge });
    const user = await user_1.User.query().where('username', username).first();
    ctx.assert(user, 401, 'Invalid username or password.');
    ctx.assert(await bcrypt_1.default.compare(password, user.password), 401, 'Invalid username or password.');
    const acceptLogin = await hydra_1.hydra.acceptLoginRequest(challenge, {
        subject: user.id.toString(),
        remember: true,
        remember_for: 604800
    }).catch(error => {
        ctx.logger.error(error, 'error in accept login request');
        throw error;
    });
    ctx.body = {
        redirectTo: acceptLogin['redirect_to']
    };
}
exports.store = store;
function createValidation() {
    return {
        validate: {
            type: 'json',
            query: {
                login_challenge: koa_joi_router_1.Joi.string().required().error(new Error('login_challenge is required.'))
            },
            body: koa_joi_router_1.Joi.object({
                username: koa_joi_router_1.Joi.string().required(),
                password: koa_joi_router_1.Joi.string().required()
            })
        }
    };
}
exports.createValidation = createValidation;
function getValidation() {
    return {
        validate: {
            query: {
                login_challenge: koa_joi_router_1.Joi.string().required().error(new Error('login_challenge is required.'))
            }
        }
    };
}
exports.getValidation = getValidation;
//# sourceMappingURL=loginController.js.map