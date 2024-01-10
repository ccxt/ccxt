/**
 * Response class
 *
 * Ref: https://fetch.spec.whatwg.org/#response-class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
export default class Response extends Body {
    /**
     * @param {string} url    The URL that the new response is to originate from.
     * @param {number} status An optional status code for the response (e.g., 302.)
     * @returns {Response}    A Response object.
     */
    static redirect(url: string, status?: number): Response;
    static error(): Response;
    static json(data?: any, init?: {}): Response;
    constructor(body?: any, options?: {});
    get type(): string;
    get url(): any;
    get status(): any;
    /**
     * Convenience property representing if the request ended normally
     */
    get ok(): boolean;
    get redirected(): boolean;
    get statusText(): any;
    get headers(): Headers;
    get highWaterMark(): any;
    /**
     * Clone this response
     *
     * @return  Response
     */
    clone(): Response;
    get [Symbol.toStringTag](): string;
    [INTERNALS]: {
        type: string;
        url: any;
        status: any;
        statusText: any;
        headers: Headers;
        counter: any;
        highWaterMark: any;
    };
}
import Body from "./body.js";
import Headers from "./headers.js";
declare const INTERNALS: unique symbol;
export {};
