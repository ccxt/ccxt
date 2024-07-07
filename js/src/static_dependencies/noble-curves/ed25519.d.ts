import { ExtPointType } from './abstract/edwards.js';
import { Hex } from './abstract/utils.js';
import * as htf from './abstract/hash-to-curve.js';
import { AffinePoint } from './abstract/curve.js';
export declare const ED25519_TORSION_SUBGROUP: string[];
export declare const ed25519: import("./abstract/edwards.js").CurveFn;
export declare const ed25519ctx: import("./abstract/edwards.js").CurveFn;
export declare const ed25519ph: import("./abstract/edwards.js").CurveFn;
export declare const x25519: import("./abstract/montgomery.js").CurveFn;
declare const hashToCurve: (msg: Uint8Array, options?: htf.htfBasicOpts) => htf.H2CPoint<bigint>, encodeToCurve: (msg: Uint8Array, options?: htf.htfBasicOpts) => htf.H2CPoint<bigint>;
export { hashToCurve, encodeToCurve };
declare type ExtendedPoint = ExtPointType;
/**
 * Each ed25519/ExtendedPoint has 8 different equivalent points. This can be
 * a source of bugs for protocols like ring signatures. Ristretto was created to solve this.
 * Ristretto point operates in X:Y:Z:T extended coordinates like ExtendedPoint,
 * but it should work in its own namespace: do not combine those two.
 * https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-ristretto255-decaf448
 */
export declare class RistrettoPoint {
    private readonly ep;
    static BASE: RistrettoPoint;
    static ZERO: RistrettoPoint;
    constructor(ep: ExtendedPoint);
    static fromAffine(ap: AffinePoint<bigint>): RistrettoPoint;
    /**
     * Takes uniform output of 64-bit hash function like sha512 and converts it to `RistrettoPoint`.
     * The hash-to-group operation applies Elligator twice and adds the results.
     * **Note:** this is one-way map, there is no conversion from point to hash.
     * https://ristretto.group/formulas/elligator.html
     * @param hex 64-bit output of a hash function
     */
    static hashToCurve(hex: Hex): RistrettoPoint;
    /**
     * Converts ristretto-encoded string to ristretto point.
     * https://ristretto.group/formulas/decoding.html
     * @param hex Ristretto-encoded 32 bytes. Not every 32-byte string is valid ristretto encoding
     */
    static fromHex(hex: Hex): RistrettoPoint;
    /**
     * Encodes ristretto point to Uint8Array.
     * https://ristretto.group/formulas/encoding.html
     */
    toRawBytes(): Uint8Array;
    toHex(): string;
    toString(): string;
    equals(other: RistrettoPoint): boolean;
    add(other: RistrettoPoint): RistrettoPoint;
    subtract(other: RistrettoPoint): RistrettoPoint;
    multiply(scalar: bigint): RistrettoPoint;
    multiplyUnsafe(scalar: bigint): RistrettoPoint;
}
export declare const hash_to_ristretto255: (msg: Uint8Array, options: htf.htfBasicOpts) => RistrettoPoint;
