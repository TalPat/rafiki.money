import { Model } from 'objection';
export declare type UserInfo = {
    id: number;
    username: string;
    password: string;
    defaultAccountId: string;
};
export declare class User extends Model {
    static get tableName(): string;
    id: number;
    createdAt: number;
    updatedAt: number;
    username: string;
    password: string;
    defaultAccountId: string;
    $beforeInsert(): void;
    $beforeUpdate(): void;
    $formatJson(): Partial<UserInfo>;
}
