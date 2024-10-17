/// <reference types="node" />
import { edwardsToMontgomeryPriv } from './_noble-curves/ed25519.js';
export declare const getRandomBytes: (len?: number) => Buffer;
export declare const edwards25519: {
    scalar: Readonly<import("./_noble-curves/abstract/modular.js").IField<bigint> & Required<Pick<import("./_noble-curves/abstract/modular.js").IField<bigint>, "isOdd">>>;
    x25519: import("./_noble-curves/abstract/montgomery.js").CurveFn;
    edwardsToMontgomery: typeof import("./_noble-curves/ed25519.js").edwardsToMontgomeryPub;
    edwardsToMontgomeryPriv: typeof edwardsToMontgomeryPriv;
    setBytesWithClamping: (x: Buffer) => bigint;
    setCanonicalBytes: (x: Buffer) => bigint;
    setUniformBytes: (x: Buffer) => bigint;
    isReduced: (x: Buffer) => boolean;
    publicFromPrivate: (priv: Buffer) => Buffer;
    scalarBaseMult: (x: bigint) => Buffer;
    scalarBaseMultToPoint: (x: bigint) => import("./_noble-curves/abstract/edwards.js").ExtPointType;
    sign: (msg: Buffer, key: Buffer) => Buffer;
    newPoint: (x: Buffer) => import("./_noble-curves/abstract/edwards.js").ExtPointType;
    keyMultPubPriv: (pub: Buffer, priv: Buffer) => Buffer;
    hashScalar: (k: Buffer, index: number) => bigint;
};
