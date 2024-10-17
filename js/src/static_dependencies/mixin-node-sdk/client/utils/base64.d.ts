/// <reference types="node" />
/**
 * mixin uses raw url encoding as default for base64 process
 * base64RawURLEncode is the standard raw, unpadded base64 encoding
 * base64RawURLDecode is same as encode
 * like Golang version https://pkg.go.dev/encoding/base64#Encoding
 */
export declare const base64RawURLEncode: (raw: Buffer | Uint8Array | string) => string;
export declare const base64RawURLDecode: (raw: string | Buffer) => Buffer;
