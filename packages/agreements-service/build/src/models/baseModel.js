"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objection_1 = require("objection");
const uuid_1 = require("uuid");
class BaseModel extends objection_1.Model {
    constructor() {
        super();
    }
    $beforeInsert() {
        this.id = uuid_1.v4();
        this.createdAt = Math.floor(new Date().getTime() / 1000);
        this.updatedAt = Math.floor(new Date().getTime() / 1000);
    }
    $beforeUpdate() {
        this.updatedAt = Math.floor(new Date().getTime() / 1000);
    }
}
exports.BaseModel = BaseModel;
//# sourceMappingURL=baseModel.js.map