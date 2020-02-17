"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objection_1 = require("objection");
const uuid_1 = require("uuid");
class SignupSession extends objection_1.Model {
    static get tableName() {
        return 'signupSessions';
    }
    $beforeInsert() {
        this.id = uuid_1.v4();
    }
    $formatJson() {
        return {
            id: this.id,
            userId: this.userId,
            expiresAt: this.expiresAt
        };
    }
}
exports.SignupSession = SignupSession;
//# sourceMappingURL=signupSession.js.map