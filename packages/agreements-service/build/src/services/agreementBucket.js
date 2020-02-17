"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const iso8601_duration_1 = require("iso8601-duration");
class AgreementBucket {
    constructor(_redis, _namespace = 'agreements') {
        this._redis = _redis;
        this._namespace = _namespace;
        this._redis.defineCommand('take', {
            numberOfKeys: 2,
            lua: fs.readFileSync(path.resolve(__dirname, 'take.lua')).toString()
        });
        this._redis.defineCommand('getBalance', {
            numberOfKeys: 2,
            lua: fs.readFileSync(path.resolve(__dirname, 'agreement-balance.lua')).toString()
        });
    }
    async getFillLevel(agreement) {
        const balanceKey = `${this._namespace}:${agreement.id}:balance`;
        const intervalKey = `${this._namespace}:${agreement.id}:timestamp`;
        const intervalStart = agreement.interval ? this.currentIntervalStart(agreement.start, agreement.interval, agreement.cycles) : agreement.start;
        return this._redis.getBalance(balanceKey, intervalKey, intervalStart);
    }
    async take(agreement, amount) {
        const balanceKey = `${this._namespace}:${agreement.id}:balance`;
        const intervalKey = `${this._namespace}:${agreement.id}:timestamp`;
        const intervalStart = agreement.interval ? this.currentIntervalStart(agreement.start, agreement.interval, agreement.cycles) : agreement.start;
        const maxAmount = agreement.amount;
        if (this.hasExpired(agreement.expiry)) {
            throw new Error('Agreement Expired');
        }
        const result = await this._redis.take(balanceKey, intervalKey, maxAmount, intervalStart, amount);
        if (result === 0) {
            throw new Error('No funds available for interval');
        }
    }
    hasExpired(expiry) {
        return expiry !== null && Date.now() >= expiry;
    }
    currentIntervalStart(start, interval, cycles) {
        const currentTime = Date.now();
        const timeElapsedSinceStart = currentTime - start;
        const duration = iso8601_duration_1.toSeconds(iso8601_duration_1.parse(interval)) * 1000;
        const elapsedCycles = timeElapsedSinceStart / duration;
        if (cycles !== null && elapsedCycles > cycles) {
            throw new Error('Exceeded agreement allowable cycles');
        }
        return start + duration * Math.floor(elapsedCycles);
    }
}
exports.AgreementBucket = AgreementBucket;
//# sourceMappingURL=agreementBucket.js.map