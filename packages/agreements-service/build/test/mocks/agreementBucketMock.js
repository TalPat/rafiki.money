"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AgreementBucketMock {
    async getFillLevel(agreement) {
        return Number(agreement.amount);
    }
    async take(agreement, amount) {
        if (amount > Number(agreement.amount)) {
            throw new Error('Too much taken');
        }
        return;
    }
}
exports.AgreementBucketMock = AgreementBucketMock;
//# sourceMappingURL=agreementBucketMock.js.map