export declare type Hex = Uint8Array | string;
export declare type PrivKey = Hex | bigint;
export declare type CHash = {
    (message: Uint8Array | string): Uint8Array;
    blockLen: number;
    outputLen: number;
    create(opts?: {
        dkLen?: number;
    }): any;
};
export declare type FHash = (message: Uint8Array | string) => Uint8Array;
export declare function bytesToHex(bytes: Uint8Array): string;
export declare function numberToHexUnpadded(num: number | bigint): string;
export declare function hexToNumber(hex: string): bigint;
export declare function hexToBytes(hex: string): Uint8Array;
export declare function bytesToNumberBE(bytes: Uint8Array): bigint;
export declare function bytesToNumberLE(bytes: Uint8Array): bigint;
export declare const numberToBytesBE: (n: bigint, len: number) => Uint8Array;
export declare const numberToBytesLE: (n: bigint, len: number) => Uint8Array;
export declare const numberToVarBytesBE: (n: bigint) => Uint8Array;
export declare function ensureBytes(title: string, hex: Hex, expectedLength?: number): Uint8Array;
export declare function concatBytes(...arrs: Uint8Array[]): Uint8Array;
export declare function equalBytes(b1: Uint8Array, b2: Uint8Array): boolean;
export declare function utf8ToBytes(str: string): Uint8Array;
export declare function bitLen(n: bigint): any;
export declare const bitGet: (n: bigint, pos: number) => bigint;
export declare const bitSet: (n: bigint, pos: number, value: boolean) => bigint;
export declare const bitMask: (n: number) => bigint;
declare type Pred<T> = (v: Uint8Array) => T | undefined;
/**
 * Minimal HMAC-DRBG from NIST 800-90 for RFC6979 sigs.
 * @returns function that will call DRBG until 2nd arg returns something meaningful
 * @example
 *   const drbg = createHmacDRBG<Key>(32, 32, hmac);
 *   drbg(seed, bytesToKey); // bytesToKey must return Key or undefined
 */
export declare function createHmacDrbg<T>(hashLen: number, qByteLen: number, hmacFn: (key: Uint8Array, ...messages: Uint8Array[]) => Uint8Array): (seed: Uint8Array, predicate: Pred<T>) => T;
declare const validatorFns: {
    readonly bigint: (val: any) => boolean;
    readonly function: (val: any) => boolean;
    readonly boolean: (val: any) => boolean;
    readonly string: (val: any) => boolean;
    readonly isSafeInteger: (val: any) => boolean;
    readonly array: (val: any) => boolean;
    readonly field: (val: any, object: any) => any;
    readonly hash: (val: any) => boolean;
};
declare type Validator = keyof typeof validatorFns;
declare type ValMap<T extends Record<string, any>> = {
    [K in keyof T]?: Validator;
};
export declare function validateObject<T extends Record<string, any>>(object: T, validators: ValMap<T>, optValidators?: ValMap<T>): T;
export {};
