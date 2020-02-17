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
const cors_1 = __importDefault(require("@koa/cors"));
const hydra_1 = require("./services/hydra");
const UsersController = __importStar(require("./controllers/userController"));
const LoginController = __importStar(require("./controllers/loginController"));
const LogoutController = __importStar(require("./controllers/logoutController"));
const ConsentController = __importStar(require("./controllers/consentController"));
const PaymentPointerController = __importStar(require("./controllers/payment-pointer"));
const Oauth2ClientController = __importStar(require("./controllers/oauth2ClientController"));
const auth_1 = require("./middleware/auth");
class App {
    constructor(logger, tokenService) {
        this._koa = new koa_1.default();
        this._koa.context.tokenService = tokenService;
        this._koa.context.logger = logger;
        this._router = koa_joi_router_1.default();
        this._koa.use(cors_1.default());
        this._setupRoutes();
        this._koa.use(koa_bodyparser_1.default());
        this._koa.use(this._router.middleware());
    }
    listen(port) {
        this._server = this._koa.listen(port);
    }
    shutdown() {
        if (this._server) {
            this._server.close();
        }
    }
    _setupRoutes() {
        this._router.post('/users', UsersController.createValidation(), UsersController.store);
        this._router.patch('/users/:id', UsersController.update);
        this._router.get('/users/me', [auth_1.createAuthMiddleware(hydra_1.hydra), UsersController.show]);
        this._router.get('/login', LoginController.getValidation(), LoginController.show);
        this._router.post('/login', LoginController.createValidation(), LoginController.store);
        this._router.post('/logout', LogoutController.store);
        this._router.get('/consent', ConsentController.getValidation(), ConsentController.show);
        this._router.post('/consent', ConsentController.storeValidation(), ConsentController.store);
        this._router.get('/p/:username', PaymentPointerController.show);
        this._router.post('/oauth2/clients', Oauth2ClientController.createValidation(), Oauth2ClientController.store);
    }
}
exports.App = App;
//# sourceMappingURL=app.js.map