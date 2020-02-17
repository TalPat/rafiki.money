import { Config } from 'koa-joi-router';
import { AppContext } from '../app';
import { Context } from 'koa';
export declare function getAgreementUrlFromScopes(scopes: string[]): string | undefined;
export declare function generateAccessAndIdTokenInfo(scopes: string[], userId: string, assert: Context['assert'], accountId?: number): Promise<{
    accessTokenInfo: {
        [k: string]: any;
    };
    idTokenInfo: {
        [k: string]: any;
    };
}>;
export declare function show(ctx: AppContext): Promise<void>;
export declare function store(ctx: AppContext): Promise<void>;
export declare function getValidation(): Config;
export declare function storeValidation(): Config;
