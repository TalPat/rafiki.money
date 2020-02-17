import { Context } from 'koa';
import { AgreementBucketInterface } from './services/agreementBucket';
export interface AppContext extends Context {
    agreementBucket: AgreementBucketInterface;
}
export declare class App {
    private _agreementBucket;
    private _koa;
    private _router;
    private _server;
    constructor(_agreementBucket: AgreementBucketInterface);
    listen(port: number): void;
    shutdown(): void;
    private _setupRoutes;
}
