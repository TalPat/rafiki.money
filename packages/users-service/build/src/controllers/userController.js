"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = require("../models/user");
const koa_joi_router_1 = require("koa-joi-router");
const signupSession_1 = require("../models/signupSession");
async function show(ctx) {
    ctx.logger.debug('Get me request');
    ctx.assert(ctx.state.user && ctx.state.user.sub, 401);
    const user = await user_1.User.query().where('id', ctx.state.user.sub).first();
    ctx.assert(user, 404, 'User not found');
    ctx.body = user.$formatJson();
}
exports.show = show;
async function store(ctx) {
    const { username, password } = ctx.request.body;
    ctx.logger.debug(`Creating user ${username}`);
    const salt = await bcrypt_1.default.genSalt();
    const hashedPassword = bcrypt_1.default.hashSync(password, salt);
    const usersWithUsername = await user_1.User.query().where('userName', username);
    ctx.assert(usersWithUsername.length === 0, 400, 'Username is already taken.');
    const user = await user_1.User.query().insertAndFetch({ username, password: hashedPassword });
    const expiresAt = (new Date(Date.now() + 1000 * 30)).getTime();
    const signupSession = await signupSession_1.SignupSession.query().insertAndFetch({ userId: user.id, expiresAt });
    ctx.body = {
        ...user.$formatJson(),
        signupSessionId: signupSession.id
    };
}
exports.store = store;
async function update(ctx) {
    const { body } = ctx.request;
    ctx.logger.debug(`Updating user ${ctx.request.params.id}`);
    const user = await user_1.User.query().findById(ctx.request.params.id);
    ctx.assert(user, 404);
    if (body.password) {
        const salt = await bcrypt_1.default.genSalt();
        const hashedPassword = bcrypt_1.default.hashSync(ctx.request.body.password, salt);
        await user.$query().update({ password: hashedPassword });
    }
    if (body.defaultAccountId) {
        await user.$query().update({ defaultAccountId: body.defaultAccountId });
    }
    ctx.response.status = 200;
}
exports.update = update;
function createValidation() {
    return {
        validate: {
            type: 'json',
            body: koa_joi_router_1.Joi.object().keys({
                username: koa_joi_router_1.Joi.string().required(),
                password: koa_joi_router_1.Joi.string().required()
            })
        }
    };
}
exports.createValidation = createValidation;
//# sourceMappingURL=userController.js.map