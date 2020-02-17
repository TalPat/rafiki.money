"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createAuthMiddleware(hydra) {
    return async (ctx, next) => {
        const { header } = ctx;
        ctx.logger.debug('Auth middleware.', { header });
        let token = '';
        if (header && header.authorization) {
            const parts = header.authorization.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                token = parts[1];
            }
        }
        ctx.assert(typeof token === 'string' && token !== '', 401, 'No auth token found.');
        ctx.logger.debug('Auth middleware. token', { token });
        const introspection = await hydra.introspectToken(token).catch(error => {
            ctx.logger.error('error introspecting token', { errorResponse: error });
            throw error;
        });
        ctx.logger.debug('Introspected token', { introspection });
        if (!introspection.active) {
            ctx.status = 401;
            return;
        }
        ctx.state.user = introspection;
        await next();
    };
}
exports.createAuthMiddleware = createAuthMiddleware;
//# sourceMappingURL=auth.js.map