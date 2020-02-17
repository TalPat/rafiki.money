/// <reference types="node" />
import { EventEmitter } from 'events';
declare type PacketHandler = (data: Buffer) => Promise<Buffer>;
export declare class HttpPlugin extends EventEmitter {
    private _outgoingUrl;
    private _outgoingAuthToken;
    private _connected;
    private _dataHandler?;
    constructor(_outgoingUrl: string, _outgoingAuthToken: string);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendData(data: Buffer): Promise<Buffer>;
    isConnected(): boolean;
    registerDataHandler(handler: PacketHandler): void;
    deregisterDataHandler(): void;
    registerMoneyHandler(): void;
    deregisterMoneyHandler(): void;
    sendMoney(): Promise<void>;
}
export {};
