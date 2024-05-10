'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var node_url = require('node:url');
var node_util = require('node:util');
var headers = require('./headers.js');
var body = require('./body.js');
var is = require('./utils/is.js');
var getSearch = require('./utils/get-search.js');
var referrer = require('./utils/referrer.js');

/**
 * Request.js
 *
 * Request class contains server only options
 *
 * All spec algorithm step numbers are based on https://fetch.spec.whatwg.org/commit-snapshots/ae716822cb3a61843226cd090eefc6589446c1d2/.
 */
const INTERNALS = Symbol('Request internals');
/**
 * Check if `obj` is an instance of Request.
 *
 * @param  {*} object
 * @return {boolean}
 */
const isRequest = object => {
    return (typeof object === 'object' &&
        typeof object[INTERNALS] === 'object');
};
const doBadDataWarn = node_util.deprecate(() => { }, '.data is not a valid RequestInit property, use .body instead', 'https://github.com/node-fetch/node-fetch/issues/1000 (request)');
/**
 * Request class
 *
 * Ref: https://fetch.spec.whatwg.org/#request-class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request extends body["default"] {
    constructor(input, init = {}) {
        let parsedURL;
        // Normalize input and force URL to be encoded as UTF-8 (https://github.com/node-fetch/node-fetch/issues/245)
        if (isRequest(input)) {
            parsedURL = new URL(input.url);
        }
        else {
            parsedURL = new URL(input);
            input = {};
        }
        if (parsedURL.username !== '' || parsedURL.password !== '') {
            throw new TypeError(`${parsedURL} is an url with embedded credentials.`);
        }
        let method = init.method || input.method || 'GET';
        if (/^(delete|get|head|options|post|put)$/i.test(method)) {
            method = method.toUpperCase();
        }
        if (!isRequest(init) && 'data' in init) {
            doBadDataWarn();
        }
        // eslint-disable-next-line no-eq-null, eqeqeq
        if ((init.body != null || (isRequest(input) && input.body !== null)) &&
            (method === 'GET' || method === 'HEAD')) {
            throw new TypeError('Request with GET/HEAD method cannot have body');
        }
        const inputBody = init.body ?
            init.body :
            (isRequest(input) && input.body !== null ?
                body.clone(input) :
                null);
        super(inputBody, {
            size: init.size || input.size || 0
        });
        const headers$1 = new headers["default"](init.headers || input.headers || {});
        if (inputBody !== null && !headers$1.has('Content-Type')) {
            const contentType = body.extractContentType(inputBody);
            if (contentType) {
                headers$1.set('Content-Type', contentType);
            }
        }
        let signal = isRequest(input) ?
            input.signal :
            null;
        if ('signal' in init) {
            signal = init.signal;
        }
        // eslint-disable-next-line no-eq-null, eqeqeq
        if (signal != null && !is.isAbortSignal(signal)) {
            throw new TypeError('Expected signal to be an instanceof AbortSignal or EventTarget');
        }
        // §5.4, Request constructor steps, step 15.1
        // eslint-disable-next-line no-eq-null, eqeqeq
        let referrer = init.referrer == null ? input.referrer : init.referrer;
        if (referrer === '') {
            // §5.4, Request constructor steps, step 15.2
            referrer = 'no-referrer';
        }
        else if (referrer) {
            // §5.4, Request constructor steps, step 15.3.1, 15.3.2
            const parsedReferrer = new URL(referrer);
            // §5.4, Request constructor steps, step 15.3.3, 15.3.4
            referrer = /^about:(\/\/)?client$/.test(parsedReferrer) ? 'client' : parsedReferrer;
        }
        else {
            referrer = undefined;
        }
        this[INTERNALS] = {
            method,
            redirect: init.redirect || input.redirect || 'follow',
            headers: headers$1,
            parsedURL,
            signal,
            referrer
        };
        // Node-fetch-only options
        this.follow = init.follow === undefined ? (input.follow === undefined ? 20 : input.follow) : init.follow;
        this.compress = init.compress === undefined ? (input.compress === undefined ? true : input.compress) : init.compress;
        this.counter = init.counter || input.counter || 0;
        this.agent = init.agent || input.agent;
        this.highWaterMark = init.highWaterMark || input.highWaterMark || 16384;
        this.insecureHTTPParser = init.insecureHTTPParser || input.insecureHTTPParser || false;
        // §5.4, Request constructor steps, step 16.
        // Default is empty string per https://fetch.spec.whatwg.org/#concept-request-referrer-policy
        this.referrerPolicy = init.referrerPolicy || input.referrerPolicy || '';
    }
    /** @returns {string} */
    get method() {
        return this[INTERNALS].method;
    }
    /** @returns {string} */
    get url() {
        return node_url.format(this[INTERNALS].parsedURL);
    }
    /** @returns {Headers} */
    get headers() {
        return this[INTERNALS].headers;
    }
    get redirect() {
        return this[INTERNALS].redirect;
    }
    /** @returns {AbortSignal} */
    get signal() {
        return this[INTERNALS].signal;
    }
    // https://fetch.spec.whatwg.org/#dom-request-referrer
    get referrer() {
        if (this[INTERNALS].referrer === 'no-referrer') {
            return '';
        }
        if (this[INTERNALS].referrer === 'client') {
            return 'about:client';
        }
        if (this[INTERNALS].referrer) {
            return this[INTERNALS].referrer.toString();
        }
        return undefined;
    }
    get referrerPolicy() {
        return this[INTERNALS].referrerPolicy;
    }
    set referrerPolicy(referrerPolicy) {
        this[INTERNALS].referrerPolicy = referrer.validateReferrerPolicy(referrerPolicy);
    }
    /**
     * Clone this request
     *
     * @return  Request
     */
    clone() {
        return new Request(this);
    }
    get [Symbol.toStringTag]() {
        return 'Request';
    }
}
Object.defineProperties(Request.prototype, {
    method: { enumerable: true },
    url: { enumerable: true },
    headers: { enumerable: true },
    redirect: { enumerable: true },
    clone: { enumerable: true },
    signal: { enumerable: true },
    referrer: { enumerable: true },
    referrerPolicy: { enumerable: true }
});
/**
 * Convert a Request to Node.js http request options.
 *
 * @param {Request} request - A Request instance
 * @return The options object to be passed to http.request
 */
const getNodeRequestOptions = request => {
    const { parsedURL } = request[INTERNALS];
    const headers$1 = new headers["default"](request[INTERNALS].headers);
    // Fetch step 1.3
    if (!headers$1.has('Accept')) {
        headers$1.set('Accept', '*/*');
    }
    // HTTP-network-or-cache fetch steps 2.4-2.7
    let contentLengthValue = null;
    if (request.body === null && /^(post|put)$/i.test(request.method)) {
        contentLengthValue = '0';
    }
    if (request.body !== null) {
        const totalBytes = body.getTotalBytes(request);
        // Set Content-Length if totalBytes is a number (that is not NaN)
        if (typeof totalBytes === 'number' && !Number.isNaN(totalBytes)) {
            contentLengthValue = String(totalBytes);
        }
    }
    if (contentLengthValue) {
        headers$1.set('Content-Length', contentLengthValue);
    }
    // 4.1. Main fetch, step 2.6
    // > If request's referrer policy is the empty string, then set request's referrer policy to the
    // > default referrer policy.
    if (request.referrerPolicy === '') {
        request.referrerPolicy = referrer.DEFAULT_REFERRER_POLICY;
    }
    // 4.1. Main fetch, step 2.7
    // > If request's referrer is not "no-referrer", set request's referrer to the result of invoking
    // > determine request's referrer.
    if (request.referrer && request.referrer !== 'no-referrer') {
        request[INTERNALS].referrer = referrer.determineRequestsReferrer(request);
    }
    else {
        request[INTERNALS].referrer = 'no-referrer';
    }
    // 4.5. HTTP-network-or-cache fetch, step 6.9
    // > If httpRequest's referrer is a URL, then append `Referer`/httpRequest's referrer, serialized
    // >  and isomorphic encoded, to httpRequest's header list.
    if (request[INTERNALS].referrer instanceof URL) {
        headers$1.set('Referer', request.referrer);
    }
    // HTTP-network-or-cache fetch step 2.11
    if (!headers$1.has('User-Agent')) {
        headers$1.set('User-Agent', 'node-fetch');
    }
    // HTTP-network-or-cache fetch step 2.15
    if (request.compress && !headers$1.has('Accept-Encoding')) {
        headers$1.set('Accept-Encoding', 'gzip, deflate, br');
    }
    let { agent } = request;
    if (typeof agent === 'function') {
        agent = agent(parsedURL);
    }
    if (!headers$1.has('Connection') && !agent) {
        headers$1.set('Connection', 'close');
    }
    // HTTP-network fetch step 4.2
    // chunked encoding is handled by Node.js
    const search = getSearch.getSearch(parsedURL);
    // Pass the full URL directly to request(), but overwrite the following
    // options:
    const options = {
        // Overwrite search to retain trailing ? (issue #776)
        path: parsedURL.pathname + search,
        // The following options are not expressed in the URL
        method: request.method,
        headers: headers$1[Symbol.for('nodejs.util.inspect.custom')](),
        insecureHTTPParser: request.insecureHTTPParser,
        agent
    };
    return {
        /** @type {URL} */
        parsedURL,
        options
    };
};

exports["default"] = Request;
exports.getNodeRequestOptions = getNodeRequestOptions;
