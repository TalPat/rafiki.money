import { BaseModel } from './baseModel';
import { Pojo } from 'objection';
export declare class Agreement extends BaseModel {
    static get tableName(): string;
    assetCode: string;
    assetScale: number;
    amount: string;
    description: string;
    start: number;
    expiry: number;
    interval: string;
    cycles: number;
    cap: boolean;
    userId: number;
    accountId: number;
    subject: string;
    secret: string;
    secretSalt: string;
    scope: string;
    callback: string;
    type: string;
    cancelled: number;
    isMandate(): boolean;
    get secretHash(): string | undefined;
    $formatJson(): Pojo;
}
