"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objection_1 = require("objection");
class User extends objection_1.Model {
    static get tableName() {
        return 'users';
    }
    $beforeInsert() {
        this.createdAt = Math.floor(new Date().getTime() / 1000);
        this.updatedAt = Math.floor(new Date().getTime() / 1000);
    }
    $beforeUpdate() {
        this.updatedAt = Math.floor(new Date().getTime() / 1000);
    }
    $formatJson() {
        return {
            id: this.id,
            username: this.username,
            defaultAccountId: this.defaultAccountId
        };
    }
}
exports.User = User;
//# sourceMappingURL=user.js.map