import { type CHash } from '@noble/hashes/utils.js';
import type { ECDSA as CurveFn } from '@noble/curves/abstract/weierstrass.js';
import type { EdDSA as CurveFnEDDSA } from '@noble/curves/abstract/edwards.js';
type Input = string | Uint8Array;
type Hex = string | Uint8Array;
type Digest = 'binary' | 'hex' | 'base64';
declare const hash: (request: Input, hash: CHash, digest?: Digest) => any;
declare const hmac: (request: Input, secret: Input, hash: CHash, digest?: Digest) => any;
declare function ecdsa(request: Hex, secret: Hex, curve: CurveFn, prehash?: CHash, fixedLength?: boolean): {
    r: string;
    s: string;
    v: number;
};
declare function eddsa(request: Hex, secret: Input, curve: CurveFnEDDSA): string;
declare function crc32(str: any, signed?: boolean): number;
export { hash, hmac, crc32, ecdsa, eddsa, };
