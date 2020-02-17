"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const baseModel_1 = require("./baseModel");
const crypto_1 = require("crypto");
class Agreement extends baseModel_1.BaseModel {
    static get tableName() {
        return 'agreements';
    }
    isMandate() {
        return this.type === 'mandate';
    }
    get secretHash() {
        if (this.secret && this.secretSalt) {
            return crypto_1.createHmac('SHA256', this.secretSalt).update(this.secret).digest('base64');
        }
        return undefined;
    }
    $formatJson() {
        return {
            id: this.id,
            asset: {
                code: this.assetCode,
                scale: this.assetScale
            },
            description: this.description || undefined,
            userId: this.userId || undefined,
            accountId: this.accountId || undefined,
            subject: this.subject || undefined,
            amount: this.amount || undefined,
            start: this.start || undefined,
            expiry: this.expiry || undefined,
            interval: this.interval || undefined,
            cycles: this.cycles || undefined,
            cap: this.cap || undefined,
            secretSalt: this.secretSalt || undefined,
            secretHash: this.secretHash || undefined,
            scope: this.scope || undefined,
            callback: this.callback || undefined,
            cancelled: this.cancelled || undefined
        };
    }
}
exports.Agreement = Agreement;
//# sourceMappingURL=agreement.js.map