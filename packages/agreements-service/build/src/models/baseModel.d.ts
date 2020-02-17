import { Model } from 'objection';
export declare class BaseModel extends Model {
    constructor();
    id: string;
    createdAt: number;
    updatedAt: number;
    $beforeInsert(): void;
    $beforeUpdate(): void;
}
