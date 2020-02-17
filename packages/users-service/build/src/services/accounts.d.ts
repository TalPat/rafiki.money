import { AxiosResponse } from 'axios';
export declare const accounts: {
    getUserAccounts(userId: string, token: string): Promise<AxiosResponse<any>>;
};
