import { CHash, Input } from '../../static_dependencies/noble-hashes/utils.js';
import { CurveFn } from '../../static_dependencies/noble-curves/abstract/weierstrass.js';
import { CurveFn as CurveFnEDDSA } from '../../static_dependencies/noble-curves/abstract/edwards.js';
import { Hex } from '../../static_dependencies/noble-curves/abstract/utils.js';
declare type Digest = 'binary' | 'hex' | 'base64';
declare const hash: (request: Input, hash: CHash, digest?: Digest) => any;
declare const hmac: (request: Input, secret: Input, hash: CHash, digest?: Digest) => any;
declare function ecdsa(request: Hex, secret: Hex, curve: CurveFn, prehash?: CHash): {
    r: string;
    s: string;
    v: number;
};
declare function eddsa(request: Hex, secret: Hex, curve: CurveFnEDDSA): string;
declare function crc32(str: any, signed?: boolean): number;
export { hash, hmac, crc32, ecdsa, eddsa, };
