export declare const hydra: {
    getLoginRequest: (challenge: string) => Promise<any>;
    acceptLoginRequest: (challenge: string, body: any) => Promise<any>;
    rejectLoginRequest: (challenge: string, body: any) => Promise<any>;
    getConsentRequest: (challenge: string) => Promise<any>;
    acceptConsentRequest: (challenge: string, body: any) => Promise<any>;
    rejectConsentRequest: (challenge: string, body: any) => Promise<any>;
    getLogoutRequest: (challenge: string) => Promise<any>;
    acceptLogoutRequest: (challenge: string) => Promise<any>;
    rejectLogoutRequest: (challenge: string) => Promise<any>;
    introspectToken: (token: string) => Promise<any>;
    createToken: (params: URLSearchParams) => Promise<any>;
};
