import { Hash, Input } from './utils.js';
declare class MD5 extends Hash<MD5> {
    blockLen: number;
    outputLen: number;
    protected _buffer: Uint8Array;
    digest(): Uint8Array;
    digestInto(buf: Uint8Array): void;
    _cloneInto(to: MD5 | undefined): MD5;
    destroy(): void;
    update(buf: Input): this;
}
export declare let md5: {
    (message: Input): Uint8Array;
    outputLen: number;
    blockLen: number;
    create(): Hash<MD5>;
};
export {};
