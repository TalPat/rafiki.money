export declare type SPSPResponse = {
    destinationAccount: string;
    sharedSecret: string;
};
export declare const Pay: (agreementId: string, amount: string, authToken: string, destinationAccount: string, sharedSecret: string) => Promise<any>;
export declare const queryPaymentPointer: (paymentPointer: string) => Promise<SPSPResponse>;
