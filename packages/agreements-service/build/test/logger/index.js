"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston = __importStar(require("winston"));
const stream_1 = require("stream");
const format = winston.format.json({
    replacer: (key, value) => {
        return typeof value === 'bigint'
            ? value.toString()
            : value;
    }
});
setTimeout(() => {
    let stream;
    beforeEach(() => {
        stream = new stream_1.PassThrough();
        stream.pause();
        winston.configure({
            level: 'silly',
            format,
            transports: new winston.transports.Stream({ stream, format })
        });
    });
    afterEach(() => {
        if (this && this.currentTest
            && this.currentTest.state !== 'passed'
            && stream.readableLength > 0) {
            process.stderr.write("==== LOGS: start ====\r\n");
            stream.pipe(process.stderr, { end: false });
            stream.write("<==== LOGS: end ====\r\n");
            stream.end();
        }
    });
});
//# sourceMappingURL=index.js.map