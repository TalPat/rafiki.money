import Koa from 'koa';
import { Logger } from 'pino';
import { TokenService } from './services/token-service';
export declare type AppContext<T = any> = Koa.ParameterizedContext<T, {
    logger: Logger;
    tokenService: TokenService;
}>;
export declare class App {
    private _koa;
    private _router;
    private _server;
    constructor(logger: Logger, tokenService: TokenService);
    listen(port: number | string): void;
    shutdown(): void;
    private _setupRoutes;
}
