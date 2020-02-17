import { Config } from 'koa-joi-router';
import { AppContext } from '../app';
export declare function store(ctx: AppContext): Promise<void>;
export declare function createValidation(): Config;
