/// <reference types="node" />
/// <reference types="node" />
/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
export default class Body {
    constructor(body: any, { size }?: {
        size?: number;
    });
    size: number;
    get body(): any;
    get bodyUsed(): boolean;
    /**
     * Decode response as ArrayBuffer
     *
     * @return  Promise
     */
    arrayBuffer(): Promise<ArrayBuffer>;
    /**
     * Return raw response as Blob
     *
     * @return Promise
     */
    blob(): Promise<Blob>;
    /**
     * Decode response as json
     *
     * @return  Promise
     */
    json(): Promise<any>;
    /**
     * Decode response as text
     *
     * @return  Promise
     */
    text(): Promise<string>;
    buffer: () => Promise<Buffer>;
    [INTERNALS]: {
        body: any;
        stream: any;
        boundary: any;
        disturbed: boolean;
        error: any;
    };
}
export function clone(instance: any, highWaterMark: any): any;
export function extractContentType(body: any, request: any): string | null;
export function getTotalBytes(request: any): number | null;
export function writeToStream(dest: Stream.Writable, { body }: {
    body: any;
}): Promise<void>;
import { Buffer } from "buffer";
declare const INTERNALS: unique symbol;
import Stream from "node:stream";
export {};
