/*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) */
export declare function assertNumber(n: number): void;
export interface Coder<F, T> {
    encode(from: F): T;
    decode(to: T): F;
}
export interface BytesCoder extends Coder<Uint8Array, string> {
    encode: (data: Uint8Array) => string;
    decode: (str: string) => Uint8Array;
}
declare type Chain = [Coder<any, any>, ...Coder<any, any>[]];
declare type Input<F> = F extends Coder<infer T, any> ? T : never;
declare type Output<F> = F extends Coder<any, infer T> ? T : never;
declare type First<T> = T extends [infer U, ...any[]] ? U : never;
declare type Last<T> = T extends [...any[], infer U] ? U : never;
declare type Tail<T> = T extends [any, ...infer U] ? U : never;
declare type AsChain<C extends Chain, Rest = Tail<C>> = {
    [K in keyof C]: Coder<Input<C[K]>, Input<K extends keyof Rest ? Rest[K] : any>>;
};
declare function chain<T extends Chain & AsChain<T>>(...args: T): Coder<Input<First<T>>, Output<Last<T>>>;
declare type Alphabet = string[] | string;
declare function alphabet(alphabet: Alphabet): Coder<number[], string[]>;
declare function join(separator?: string): Coder<string[], string>;
declare function padding(bits: number, chr?: string): Coder<string[], string[]>;
declare function radix(num: number): Coder<Uint8Array, number[]>;
declare function radix2(bits: number, revPadding?: boolean): Coder<Uint8Array, number[]>;
declare function checksum(len: number, fn: (data: Uint8Array) => Uint8Array): Coder<Uint8Array, Uint8Array>;
export declare const utils: {
    alphabet: typeof alphabet;
    chain: typeof chain;
    checksum: typeof checksum;
    radix: typeof radix;
    radix2: typeof radix2;
    join: typeof join;
    padding: typeof padding;
};
export declare const base16: BytesCoder;
export declare const base32: BytesCoder;
export declare const base32hex: BytesCoder;
export declare const base32crockford: BytesCoder;
export declare const base64: BytesCoder;
export declare const base64url: BytesCoder;
export declare const base58: BytesCoder;
export declare const base58flickr: BytesCoder;
export declare const base58xrp: BytesCoder;
export declare const base58xmr: BytesCoder;
export declare const base58check: (sha256: (data: Uint8Array) => Uint8Array) => BytesCoder;
export interface Bech32Decoded {
    prefix: string;
    words: number[];
}
export interface Bech32DecodedWithArray {
    prefix: string;
    words: number[];
    bytes: Uint8Array;
}
export declare const bech32: {
    encode: (prefix: string, words: number[] | Uint8Array, limit?: number | false) => string;
    decode: (str: string, limit?: number | false) => Bech32Decoded;
    decodeToBytes: (str: string) => Bech32DecodedWithArray;
    decodeUnsafe: (str: string, limit?: number | false | undefined) => Bech32Decoded | undefined;
    fromWords: (to: number[]) => Uint8Array;
    fromWordsUnsafe: (to: number[]) => Uint8Array | undefined;
    toWords: (from: Uint8Array) => number[];
};
export declare const bech32m: {
    encode: (prefix: string, words: number[] | Uint8Array, limit?: number | false) => string;
    decode: (str: string, limit?: number | false) => Bech32Decoded;
    decodeToBytes: (str: string) => Bech32DecodedWithArray;
    decodeUnsafe: (str: string, limit?: number | false | undefined) => Bech32Decoded | undefined;
    fromWords: (to: number[]) => Uint8Array;
    fromWordsUnsafe: (to: number[]) => Uint8Array | undefined;
    toWords: (from: Uint8Array) => number[];
};
export declare const utf8: BytesCoder;
export declare const hex: BytesCoder;
declare const CODERS: {
    utf8: BytesCoder;
    hex: BytesCoder;
    base16: BytesCoder;
    base32: BytesCoder;
    base64: BytesCoder;
    base64url: BytesCoder;
    base58: BytesCoder;
    base58xmr: BytesCoder;
};
declare type CoderType = keyof typeof CODERS;
export declare const bytesToString: (type: CoderType, bytes: Uint8Array) => string;
export declare const str: (type: CoderType, bytes: Uint8Array) => string;
export declare const stringToBytes: (type: CoderType, str: string) => Uint8Array;
export declare const bytes: (type: CoderType, str: string) => Uint8Array;
export {};
