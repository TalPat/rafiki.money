#!/usr/bin/env node
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston = __importStar(require("winston"));
const app_1 = require("./app");
const knex_1 = __importDefault(require("knex"));
const objection_1 = require("objection");
const agreementBucket_1 = require("./services/agreementBucket");
const ioredis_1 = __importDefault(require("ioredis"));
const PORT = Number(process.env.PORT) || 3002;
const DATABASE_CONNECTION_STRING = process.env.DATABASE_CONNECTION_STRING || ':memory:';
const DATABASE_CLIENT = process.env.DATABASE_CLIENT || 'sqlite3';
const REDIS_URI = process.env.REDIS_URI;
const stringify = (value) => typeof value === 'bigint' ? value.toString() : JSON.stringify(value);
const formatter = winston.format.printf(({ service, level, message, component, timestamp, ...metaData }) => {
    return `${timestamp} [${service}${component ? '-' + component : ''}] ${level}: ${message}` + (metaData ? ' meta data: ' + stringify(metaData) : '');
});
winston.configure({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(winston.format.colorize(), winston.format.timestamp(), winston.format.align(), formatter),
    defaultMeta: { service: 'ishara' },
    transports: [
        new winston.transports.Console()
    ]
});
const knex = knex_1.default({
    client: DATABASE_CLIENT,
    connection: DATABASE_CONNECTION_STRING
});
console.log('db conn string', DATABASE_CONNECTION_STRING);
objection_1.Model.knex(knex);
const redis = new ioredis_1.default(REDIS_URI);
const agreementBucket = new agreementBucket_1.AgreementBucket(redis);
const app = new app_1.App(agreementBucket);
const gracefulShutdown = async () => {
    app.shutdown();
};
const start = async () => {
    let shuttingDown = false;
    process.on('SIGINT', async () => {
        try {
            if (shuttingDown) {
                winston.warn('received second SIGINT during graceful shutdown, exiting forcefully.');
                process.exit(1);
                return;
            }
            shuttingDown = true;
            await gracefulShutdown();
            process.exit(0);
        }
        catch (err) {
            const errInfo = (err && typeof err === 'object' && err.stack) ? err.stack : err;
            winston.error('error while shutting down. error=%s', errInfo);
            process.exit(1);
        }
    });
    if (knex.client.config.connection.filename === ':memory:') {
        await knex.migrate.latest();
    }
    else {
        const status = await knex.migrate.status().catch(error => {
            winston.error('Error getting migrations status.', { error });
            winston.info('Please ensure your run the migrations before starting Ishara');
            process.exit(1);
        });
        if (status !== 0) {
            winston.error('You need to run the latest migrations before running Ishara');
            process.exit(1);
        }
    }
    app.listen(PORT);
};
start().catch(e => {
    const errInfo = (e && typeof e === 'object' && e.stack) ? e.stack : e;
    winston.error(errInfo);
});
//# sourceMappingURL=start.js.map