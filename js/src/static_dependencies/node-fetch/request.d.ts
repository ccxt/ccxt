/**
 * Request class
 *
 * Ref: https://fetch.spec.whatwg.org/#request-class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
export default class Request extends Body {
    constructor(input: any, init?: {});
    follow: any;
    compress: any;
    counter: any;
    agent: any;
    highWaterMark: any;
    insecureHTTPParser: any;
    set referrerPolicy(arg: any);
    get referrerPolicy(): any;
    /** @returns {string} */
    get method(): string;
    /** @returns {string} */
    get url(): string;
    /** @returns {Headers} */
    get headers(): Headers;
    get redirect(): any;
    /** @returns {AbortSignal} */
    get signal(): AbortSignal;
    get referrer(): any;
    /**
     * Clone this request
     *
     * @return  Request
     */
    clone(): Request;
    get [Symbol.toStringTag](): string;
    [INTERNALS]: {
        method: any;
        redirect: any;
        headers: Headers;
        parsedURL: URL;
        signal: any;
        referrer: any;
    };
}
export function getNodeRequestOptions(request: Request): {
    /** @type {URL} */
    parsedURL: URL;
    options: {
        path: string;
        method: string;
        headers: any;
        insecureHTTPParser: any;
        agent: any;
    };
};
import Body from "./body.js";
import Headers from "./headers.js";
declare const INTERNALS: unique symbol;
export {};
