"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
const app_1 = require("./app");
const objection_1 = require("objection");
const token_service_1 = require("./services/token-service");
const Knex = require("knex");
const logger = pino_1.default();
logger.level = process.env.LOG_LEVEL || 'info';
const PORT = process.env.PORT || 3000;
const KNEX_CLIENT = process.env.KNEX_CLIENT || 'sqlite3';
const knex = KNEX_CLIENT === 'mysql' ? Knex({
    client: 'mysql',
    connection: {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    }
}) : Knex({
    client: 'sqlite3',
    connection: {
        filename: ':memory:'
    }
});
const tokenService = new token_service_1.TokenService({
    clientId: process.env.OAUTH_CLIENT_ID || 'wallet-users-service',
    clientSecret: process.env.OAUTH_CLIENT_SECRET || '',
    issuerUrl: process.env.OAUTH_ISSUER_URL || 'https://auth.rafiki.money',
    tokenRefreshTime: 0
});
const app = new app_1.App(logger, tokenService);
exports.gracefulShutdown = async () => {
    logger.info('shutting down.');
    app.shutdown();
    await knex.destroy();
};
exports.start = async () => {
    let shuttingDown = false;
    process.on('SIGINT', async () => {
        try {
            if (shuttingDown) {
                logger.warn('received second SIGINT during graceful shutdown, exiting forcefully.');
                process.exit(1);
                return;
            }
            shuttingDown = true;
            await exports.gracefulShutdown();
            logger.info('completed graceful shutdown.');
        }
        catch (err) {
            const errInfo = (err && typeof err === 'object' && err.stack) ? err.stack : err;
            logger.error('error while shutting down. error=%s', errInfo);
            process.exit(1);
        }
    });
    await knex.migrate.latest();
    objection_1.Model.knex(knex);
    app.listen(PORT);
    logger.info(`Listening on ${PORT}`);
};
if (!module.parent) {
    exports.start().catch(e => {
        const errInfo = (e && typeof e === 'object' && e.stack) ? e.stack : e;
        logger.error(errInfo);
    });
}
//# sourceMappingURL=index.js.map