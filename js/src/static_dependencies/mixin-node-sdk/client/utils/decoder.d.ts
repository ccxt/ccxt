/// <reference types="node" />
import type { Input, Output } from '../types';
export declare const bytesToInterger: (b: Buffer) => number;
export declare class Decoder {
    buf: Buffer;
    constructor(buf: Buffer);
    subarray(start: number, end?: number): Buffer;
    read(offset: number): void;
    readByte(): number;
    readBytes(): string;
    readInt(): number;
    readUint32(): number;
    readUInt64(): bigint;
    readUUID(): Buffer;
    readInteger(): number;
    decodeInput(): Input;
    decodeOutput(): Output;
    decodeSignature(): Record<number, string>;
}
