/// <reference types="node" />
import BigNumber from './_bignumber.js';
import type { Aggregated, Input, Output } from '../types';
export declare const magic: Buffer;
export declare const integerToBytes: (x: number) => any[];
export declare const bigNumberToBytes: (x: any) => Buffer;
export declare const putUvarInt: (x: number) => any[];
export declare class Encoder {
    buf: Buffer;
    constructor(buf: Buffer | undefined);
    hex(): string;
    write(buf: Buffer): void;
    writeBytes(buf: Buffer): void;
    writeSlice(buf: Buffer): void;
    writeInt(i: number): void;
    writeUint16(i: number): void;
    writeUint32(i: number): void;
    writeUint64(i: bigint): void;
    writeInteger(i: typeof BigNumber): void;
    writeUUID(id: string): void;
    encodeInput(input: Input): void;
    encodeOutput(output: Output): void;
    encodeAggregatedSignature(js: Aggregated): void;
    encodeSignature(sm: {
        [key: number]: string;
    }): void;
}
export default Encoder;
