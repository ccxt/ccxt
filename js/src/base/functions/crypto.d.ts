/// <reference types="node" />
declare const hash: (request: any, hash?: string, digest?: string) => any;
declare const hmac: (request: any, secret: any, hash?: string, digest?: string) => any;
declare function rsa(request: any, secret: any, alg?: string): string | Buffer;
/**
 * @return {string}
 */
declare function jwt(request: any, secret: any, alg?: string): string;
declare function ecdsa(request: any, secret: any, algorithm?: string, hashFunction?: any, fixedLength?: boolean): {
    r: string;
    s: string;
    v: any;
};
declare function eddsa(request: any, secret: any, algorithm?: string): string;
declare const totp: (secret: any) => string;
declare function crc32(str: any, signed?: boolean): number;
export { hash, hmac, jwt, totp, rsa, ecdsa, eddsa, crc32, };
