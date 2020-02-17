import { Agreement } from '../models';
import { Redis } from 'ioredis';
export interface AgreementBucketInterface {
    getFillLevel: (agreement: Agreement) => Promise<number>;
    take: (agreement: Agreement, amount: number) => void;
}
export declare class AgreementBucket implements AgreementBucketInterface {
    private _redis;
    private _namespace;
    constructor(_redis: Redis, _namespace?: string);
    getFillLevel(agreement: Agreement): Promise<number>;
    take(agreement: Agreement, amount: number): Promise<void>;
    private hasExpired;
    private currentIntervalStart;
}
