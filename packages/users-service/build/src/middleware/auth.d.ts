/// <reference types="pino" />
/// <reference types="koa" />
/// <reference types="koa-joi-router" />
/// <reference types="koa-bodyparser" />
import { HydraApi } from '../services/hydra';
export declare function createAuthMiddleware(hydra: HydraApi): (ctx: import("koa").ParameterizedContext<any, {
    logger: import("pino").Logger;
    tokenService: import("../services/token-service").TokenService;
}>, next: () => Promise<any>) => Promise<void>;
