"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = __importDefault(require("knex"));
const objection_1 = require("objection");
const knexConfig = require('../../knexfile');
exports.refreshDatabase = async () => {
    const knex = knex_1.default({
        ...knexConfig.testing
    });
    await knex.migrate.rollback(knexConfig, true);
    await knex.migrate.latest();
    objection_1.Model.knex(knex);
    return knex;
};
//# sourceMappingURL=index.js.map