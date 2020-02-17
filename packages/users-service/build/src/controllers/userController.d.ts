import { Context } from 'koa';
import { Config } from 'koa-joi-router';
import { AppContext } from '../app';
export declare function show(ctx: AppContext): Promise<void>;
export declare function store(ctx: AppContext): Promise<void>;
export declare function update(ctx: Context): Promise<void>;
export declare function createValidation(): Config;
