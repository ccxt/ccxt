export declare function mod(a: bigint, b: bigint): bigint;
/**
 * Efficiently exponentiate num to power and do modular division.
 * Unsafe in some contexts: uses ladder, so can expose bigint bits.
 * @example
 * powMod(2n, 6n, 11n) // 64n % 11n == 9n
 */
export declare function pow(num: bigint, power: bigint, modulo: bigint): bigint;
export declare function pow2(x: bigint, power: bigint, modulo: bigint): bigint;
export declare function invert(number: bigint, modulo: bigint): bigint;
export declare function tonelliShanks(P: bigint): <T>(Fp: Field<T>, n: T) => T;
export declare function FpSqrt(P: bigint): <T>(Fp: Field<T>, n: T) => T;
export declare const isNegativeLE: (num: bigint, modulo: bigint) => boolean;
export interface Field<T> {
    ORDER: bigint;
    BYTES: number;
    BITS: number;
    MASK: bigint;
    ZERO: T;
    ONE: T;
    create: (num: T) => T;
    isValid: (num: T) => boolean;
    is0: (num: T) => boolean;
    neg(num: T): T;
    inv(num: T): T;
    sqrt(num: T): T;
    sqr(num: T): T;
    eql(lhs: T, rhs: T): boolean;
    add(lhs: T, rhs: T): T;
    sub(lhs: T, rhs: T): T;
    mul(lhs: T, rhs: T | bigint): T;
    pow(lhs: T, power: bigint): T;
    div(lhs: T, rhs: T | bigint): T;
    addN(lhs: T, rhs: T): T;
    subN(lhs: T, rhs: T): T;
    mulN(lhs: T, rhs: T | bigint): T;
    sqrN(num: T): T;
    isOdd?(num: T): boolean;
    pow(lhs: T, power: bigint): T;
    invertBatch: (lst: T[]) => T[];
    toBytes(num: T): Uint8Array;
    fromBytes(bytes: Uint8Array): T;
    cmov(a: T, b: T, c: boolean): T;
}
export declare function validateField<T>(field: Field<T>): Field<T>;
export declare function FpPow<T>(f: Field<T>, num: T, power: bigint): T;
export declare function FpInvertBatch<T>(f: Field<T>, nums: T[]): T[];
export declare function FpDiv<T>(f: Field<T>, lhs: T, rhs: T | bigint): T;
export declare function FpIsSquare<T>(f: Field<T>): (x: T) => boolean;
export declare function nLength(n: bigint, nBitLength?: number): {
    nBitLength: number;
    nByteLength: number;
};
declare type FpField = Field<bigint> & Required<Pick<Field<bigint>, 'isOdd'>>;
export declare function Fp(ORDER: bigint, bitLen?: number, isLE?: boolean, redef?: Partial<Field<bigint>>): Readonly<FpField>;
export declare function FpSqrtOdd<T>(Fp: Field<T>, elm: T): T;
export declare function FpSqrtEven<T>(Fp: Field<T>, elm: T): T;
/**
 * FIPS 186 B.4.1-compliant "constant-time" private key generation utility.
 * Can take (n+8) or more bytes of uniform input e.g. from CSPRNG or KDF
 * and convert them into private scalar, with the modulo bias being neglible.
 * Needs at least 40 bytes of input for 32-byte private key.
 * https://research.kudelskisecurity.com/2020/07/28/the-definitive-guide-to-modulo-bias-and-how-to-avoid-it/
 * @param hash hash output from SHA3 or a similar function
 * @returns valid private scalar
 */
export declare function hashToPrivateScalar(hash: string | Uint8Array, groupOrder: bigint, isLE?: boolean): bigint;
export {};
