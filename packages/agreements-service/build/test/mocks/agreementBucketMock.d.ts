import { AgreementBucketInterface } from "../../src/services/agreementBucket";
import { Agreement } from "../../src/models";
export declare class AgreementBucketMock implements AgreementBucketInterface {
    getFillLevel(agreement: Agreement): Promise<number>;
    take(agreement: Agreement, amount: number): Promise<void>;
}
