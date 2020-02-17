import { Model } from 'objection';
export declare class SignupSession extends Model {
    static get tableName(): string;
    id: string;
    userId: number;
    expiresAt: number;
    $beforeInsert(): void;
    $formatJson(): {
        id: string;
        userId: number;
        expiresAt: number;
    };
}
