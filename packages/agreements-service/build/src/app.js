"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const koa_joi_router_1 = __importDefault(require("koa-joi-router"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const koa_cors_1 = __importDefault(require("koa-cors"));
const http_1 = require("http");
const agreementsTransactionController_1 = require("./controllers/agreementsTransactionController");
const winston_1 = require("./winston");
const IntentsController = __importStar(require("./controllers/intentsController"));
const MandatesController = __importStar(require("./controllers/mandatesController"));
const MandatesSpendController = __importStar(require("./controllers/mandatesSpendController"));
const IntentValidation = __importStar(require("./route-validation/intents"));
const MandatesValidation = __importStar(require("./route-validation/mandates"));
const logger = winston_1.log.child({ component: 'App' });
class App {
    constructor(_agreementBucket) {
        this._agreementBucket = _agreementBucket;
        this._koa = new koa_1.default();
        this._router = koa_joi_router_1.default();
        this._koa.use(koa_cors_1.default());
        this._setupRoutes();
        this._koa.use(koa_bodyparser_1.default());
        this._koa.use(this._router.middleware());
        this._koa.context.agreementBucket = this._agreementBucket;
    }
    listen(port) {
        logger.info('App listening on port: ' + port);
        this._server = http_1.createServer(this._koa.callback()).listen(port);
    }
    shutdown() {
        if (this._server) {
            this._server.close();
        }
    }
    _setupRoutes() {
        this._router.post('/agreements/:id/transactions', agreementsTransactionController_1.store);
        this._router.get('/', (ctx) => { ctx.status = 200; });
        this._router.get('/intents', IntentsController.index);
        this._router.post('/intents', IntentValidation.store, IntentsController.store);
        this._router.get('/intents/:id', IntentsController.show);
        this._router.post('/mandates', MandatesValidation.store, MandatesController.store);
        this._router.get('/mandates', MandatesController.index);
        this._router.patch('/mandates/:id', MandatesValidation.update, MandatesController.update);
        this._router.get('/mandates/:id', MandatesController.show);
        this._router.post('/mandates/:id/spend', MandatesSpendController.store);
    }
}
exports.App = App;
//# sourceMappingURL=app.js.map