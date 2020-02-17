"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = __importDefault(require("knex"));
const DATABASE_CONNECTION_STRING = process.env.DATABASE_CONNECTION_STRING || ':memory:';
const knex = knex_1.default(DATABASE_CONNECTION_STRING);
const start = async () => {
    console.log('Migrating Database');
    await knex.migrate.latest();
    console.log('Finished migrating Database');
    await knex.destroy();
};
start().catch(error => {
    console.log('error running migration', error);
});
//# sourceMappingURL=migrate.js.map