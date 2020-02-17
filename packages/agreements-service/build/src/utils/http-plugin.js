"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const axios_1 = __importDefault(require("axios"));
class HttpPlugin extends events_1.EventEmitter {
    constructor(_outgoingUrl, _outgoingAuthToken) {
        super();
        this._outgoingUrl = _outgoingUrl;
        this._outgoingAuthToken = _outgoingAuthToken;
    }
    async connect() {
        if (this._connected)
            return;
        this._connected = true;
        this.emit('connect');
    }
    async disconnect() {
        if (!this._connected)
            return;
        this._connected = false;
        this.emit('disconnect');
    }
    async sendData(data) {
        if (!this._connected) {
            throw new Error('plugin is not connected.');
        }
        return axios_1.default.post(this._outgoingUrl, data, {
            responseType: 'arraybuffer',
            headers: {
                'content-type': 'application/octet-stream',
                authorization: `Bearer ${this._outgoingAuthToken}`
            }
        }).then(response => response.data);
    }
    isConnected() {
        return this._connected;
    }
    registerDataHandler(handler) {
        this._dataHandler = handler;
    }
    deregisterDataHandler() {
        delete this._dataHandler;
    }
    registerMoneyHandler() {
    }
    deregisterMoneyHandler() {
    }
    async sendMoney() {
    }
}
exports.HttpPlugin = HttpPlugin;
//# sourceMappingURL=http-plugin.js.map