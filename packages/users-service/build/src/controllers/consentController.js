"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const koa_joi_router_1 = require("koa-joi-router");
const hydra_1 = require("../services/hydra");
const accounts_1 = require("../services/accounts");
const user_1 = require("../models/user");
const INTENTS_URL = process.env.INTENTS_URL || 'http://localhost:3001/intents';
const MANDATES_URL = process.env.MANDATES_URL || 'http://localhost:3001/mandates';
const BASE_PAYMENT_POINTER_URL = process.env.BASE_PAYMENT_POINTER_URL || '$rafiki.money/p';
function getAgreementUrlFromScopes(scopes) {
    const agreementScopes = scopes.filter(scope => {
        return scope.startsWith('intents.') || scope.startsWith('mandates.');
    });
    if (agreementScopes.length > 1) {
        throw new Error('Can only ask for single agreement scope at a time');
    }
    if (agreementScopes.length === 0) {
        return undefined;
    }
    return agreementScopes[0].startsWith('intents.')
        ? INTENTS_URL + '/' + agreementScopes[0].slice(8) : MANDATES_URL + '/' + agreementScopes[0].slice(9);
}
exports.getAgreementUrlFromScopes = getAgreementUrlFromScopes;
async function getUsersPaymentPointer(userId) {
    const user = await user_1.User.query().where('id', userId).first();
    if (!user) {
        throw new Error('No user found to create mandate scope. userId=' + userId);
    }
    return `${BASE_PAYMENT_POINTER_URL}/${user.username}`;
}
async function generateAccessAndIdTokenInfo(scopes, userId, assert, accountId) {
    const agreementUrl = getAgreementUrlFromScopes(scopes);
    if (!agreementUrl) {
        return {
            accessTokenInfo: {},
            idTokenInfo: {}
        };
    }
    assert(accountId, 400, 'accountId is required when accepting consent for intent/mandate');
    const agreement = await axios_1.default.get(agreementUrl).then(resp => resp.data);
    const usersPaymentPointer = await getUsersPaymentPointer(userId);
    if (agreement.scope) {
        assert(agreement.scope === usersPaymentPointer, 401, 'You are not allowed to give consent to this agreement.');
    }
    const updateScopeData = { accountId, userId };
    if (agreementUrl.match(/mandate/)) {
        updateScopeData['scope'] = usersPaymentPointer;
    }
    const updatedAgreement = await axios_1.default.patch(agreementUrl, updateScopeData).then(resp => resp.data);
    return {
        accessTokenInfo: {
            interledger: {
                agreement: updatedAgreement
            }
        },
        idTokenInfo: {
            interledger: {
                agreement: updatedAgreement
            }
        }
    };
}
exports.generateAccessAndIdTokenInfo = generateAccessAndIdTokenInfo;
async function show(ctx) {
    const challenge = ctx.request.query['consent_challenge'];
    ctx.logger.debug('Getting consent request', { challenge });
    const consentRequest = await hydra_1.hydra.getConsentRequest(challenge).catch(error => {
        ctx.logger.error(error, 'error in login request');
        throw error;
    });
    ctx.logger.debug('Got hydra consent request', { consentRequest });
    if (consentRequest['skip'] || consentRequest['client'].client_id === 'frontend-client' || consentRequest['client'].client_id === 'wallet-gui-service') {
        const acceptConsent = await hydra_1.hydra.acceptConsentRequest(challenge, {
            remember: true,
            remember_for: 0,
            grant_scope: consentRequest['requested_scope'],
            grant_access_token_audience: consentRequest['requested_access_token_audience'],
            session: {}
        }).catch(error => {
            ctx.logger.error('Error with hydra accepting consent', { error });
            throw error;
        });
        ctx.body = {
            redirectTo: acceptConsent['redirect_to']
        };
        return;
    }
    const grantScopes = Array.from(consentRequest['requested_scope']);
    const agreementUrl = getAgreementUrlFromScopes(grantScopes);
    ctx.logger.debug('grantScopes and agreementUrl', { grantScopes, agreementUrl });
    let accountList = undefined;
    if (agreementUrl) {
        const token = await ctx.tokenService.getAccessToken();
        ctx.logger.debug('access token', { token });
        accountList = await accounts_1.accounts.getUserAccounts(consentRequest['subject'], token);
        ctx.logger.debug('Got account list', { accountList });
    }
    ctx.body = {
        requestedScopes: consentRequest['requested_scope'],
        client: consentRequest['client'],
        user: consentRequest['subject'],
        accounts: accountList,
        agreementUrl
    };
}
exports.show = show;
async function store(ctx) {
    const challenge = ctx.request.query['consent_challenge'];
    const { accepts, scopes, accountId } = ctx.request.body;
    ctx.logger.debug('Post consent request', { body: ctx.request.body, challenge });
    if (!accepts) {
        const rejectConsent = await hydra_1.hydra.rejectConsentRequest(challenge, {
            error: 'access_denied',
            error_description: 'The resource owner denied the request'
        }).catch(error => {
            ctx.logger.error('error rejecting hydra consent');
            throw error;
        });
        ctx.body = {
            redirectTo: rejectConsent['redirect_to']
        };
        return;
    }
    const consentRequest = await hydra_1.hydra.getConsentRequest(challenge);
    ctx.logger.debug('consent request from hydra', { consentRequest });
    const { accessTokenInfo, idTokenInfo } = await generateAccessAndIdTokenInfo(scopes, consentRequest['subject'], ctx.assert, accountId);
    ctx.logger.debug('Making accept request to hydra', { accessTokenInfo, idTokenInfo });
    const acceptConsent = await hydra_1.hydra.acceptConsentRequest(challenge, {
        remember: true,
        remember_for: 0,
        grant_scope: scopes,
        grant_access_token_audience: consentRequest['requested_access_token_audience'],
        session: {
            access_token: accessTokenInfo,
            id_token: idTokenInfo
        }
    }).catch(error => {
        ctx.logger.error('Error with hydra accepting consent', { error });
        throw error;
    });
    ctx.body = {
        redirectTo: acceptConsent['redirect_to']
    };
}
exports.store = store;
function getValidation() {
    return {
        validate: {
            query: {
                consent_challenge: koa_joi_router_1.Joi.string().required().error(new Error('consent_challenge is required.'))
            }
        }
    };
}
exports.getValidation = getValidation;
function storeValidation() {
    return {
        validate: {
            type: 'json',
            body: {
                accepts: koa_joi_router_1.Joi.bool().required(),
                scopes: koa_joi_router_1.Joi.array().items(koa_joi_router_1.Joi.string()).required(),
                accountId: koa_joi_router_1.Joi.number().integer().greater(0).optional()
            },
            query: {
                consent_challenge: koa_joi_router_1.Joi.string().required().error(new Error('consent_challenge is required.'))
            }
        }
    };
}
exports.storeValidation = storeValidation;
//# sourceMappingURL=consentController.js.map