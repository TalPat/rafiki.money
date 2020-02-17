import { AxiosResponse } from 'axios';
export declare type Oauth2ClientDetails = {
    client_id: string;
    client_name: string;
    scope: string;
    response_types: string[];
    grant_types: string[];
    redirect_uris: string[];
    logo_uri: string;
};
export interface HydraApi {
    introspectToken: (token: string) => Promise<any>;
    getLoginRequest: (challenge: string) => Promise<AxiosResponse>;
    acceptLoginRequest: (challenge: string, body: any) => Promise<AxiosResponse>;
    rejectLoginRequest: (challenge: string, body: any) => Promise<AxiosResponse>;
    getConsentRequest: (challenge: string) => Promise<AxiosResponse>;
    acceptConsentRequest: (challenge: string, body: any) => Promise<AxiosResponse>;
    rejectConsentRequest: (challenge: string, body: any) => Promise<AxiosResponse>;
    getLogoutRequest: (challenge: string) => Promise<AxiosResponse>;
    acceptLogoutRequest: (challenge: string) => Promise<AxiosResponse>;
    rejectLogoutRequest: (challenge: string) => Promise<AxiosResponse>;
    createOauthClient: (clientDetails: Oauth2ClientDetails) => Promise<AxiosResponse>;
}
export declare const hydra: HydraApi;
export interface TokenInfo {
    active: boolean;
    scope?: string;
    client_id?: string;
    username?: string;
    token_type?: string;
    exp?: number;
    iat?: number;
    nbf?: number;
    sub?: string;
    aud?: string;
    iss?: string;
    jti?: string;
}
