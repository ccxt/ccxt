import * as ut from './utils.js';
import { FHash, Hex } from './utils.js';
import { Group, GroupConstructor, BasicCurve, AffinePoint } from './curve.js';
export declare type CurveType = BasicCurve<bigint> & {
    a: bigint;
    d: bigint;
    hash: FHash;
    randomBytes: (bytesLength?: number) => Uint8Array;
    adjustScalarBytes?: (bytes: Uint8Array) => Uint8Array;
    domain?: (data: Uint8Array, ctx: Uint8Array, phflag: boolean) => Uint8Array;
    uvRatio?: (u: bigint, v: bigint) => {
        isValid: boolean;
        value: bigint;
    };
    preHash?: FHash;
    mapToCurve?: (scalar: bigint[]) => AffinePoint<bigint>;
};
declare function validateOpts(curve: CurveType): Readonly<{
    readonly nBitLength: number;
    readonly nByteLength: number;
    readonly Fp: import("./modular.js").Field<bigint>;
    readonly n: bigint;
    readonly h: bigint;
    readonly hEff?: bigint;
    readonly Gx: bigint;
    readonly Gy: bigint;
    readonly allowInfinityPoint?: boolean;
    readonly a: bigint;
    readonly d: bigint;
    readonly hash: ut.FHash;
    readonly randomBytes: (bytesLength?: number) => Uint8Array;
    readonly adjustScalarBytes?: (bytes: Uint8Array) => Uint8Array;
    readonly domain?: (data: Uint8Array, ctx: Uint8Array, phflag: boolean) => Uint8Array;
    readonly uvRatio?: (u: bigint, v: bigint) => {
        isValid: boolean;
        value: bigint;
    };
    readonly preHash?: ut.FHash;
    readonly mapToCurve?: (scalar: bigint[]) => AffinePoint<bigint>;
}>;
export interface ExtPointType extends Group<ExtPointType> {
    readonly ex: bigint;
    readonly ey: bigint;
    readonly ez: bigint;
    readonly et: bigint;
    assertValidity(): void;
    multiply(scalar: bigint): ExtPointType;
    multiplyUnsafe(scalar: bigint): ExtPointType;
    isSmallOrder(): boolean;
    isTorsionFree(): boolean;
    clearCofactor(): ExtPointType;
    toAffine(iz?: bigint): AffinePoint<bigint>;
}
export interface ExtPointConstructor extends GroupConstructor<ExtPointType> {
    new (x: bigint, y: bigint, z: bigint, t: bigint): ExtPointType;
    fromAffine(p: AffinePoint<bigint>): ExtPointType;
    fromHex(hex: Hex): ExtPointType;
    fromPrivateKey(privateKey: Hex): ExtPointType;
}
export declare type CurveFn = {
    CURVE: ReturnType<typeof validateOpts>;
    getPublicKey: (privateKey: Hex) => Uint8Array;
    sign: (message: Hex, privateKey: Hex) => Uint8Array;
    verify: (sig: Hex, message: Hex, publicKey: Hex) => boolean;
    ExtendedPoint: ExtPointConstructor;
    utils: {
        randomPrivateKey: () => Uint8Array;
        getExtendedPublicKey: (key: Hex) => {
            head: Uint8Array;
            prefix: Uint8Array;
            scalar: bigint;
            point: ExtPointType;
            pointBytes: Uint8Array;
        };
    };
};
export declare function twistedEdwards(curveDef: CurveType): CurveFn;
export {};
