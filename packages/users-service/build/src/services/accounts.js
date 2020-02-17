"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const accountsUrl = process.env.ACCOUNTS_URL || 'http://localhost:3001';
exports.accounts = {
    async getUserAccounts(userId, token) {
        const url = new URL(`accounts?userId=${userId}`, accountsUrl);
        return axios_1.default.get(url.toString(), {
            headers: {
                authorization: 'Bearer ' + token
            },
            timeout: 5000
        }).then(resp => resp.data);
    }
};
//# sourceMappingURL=accounts.js.map