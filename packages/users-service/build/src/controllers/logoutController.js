"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hydra_1 = require("../services/hydra");
async function store(ctx) {
    const challenge = ctx.request.query.logout_challenge;
    const acceptLogout = await hydra_1.hydra.acceptLogoutRequest(challenge).catch(error => {
        ctx.logger.error(error, 'error in accept login request');
        throw error;
    });
    ctx.body = {
        redirectTo: acceptLogout['redirect_to']
    };
}
exports.store = store;
//# sourceMappingURL=logoutController.js.map