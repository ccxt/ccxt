'use strict';

var headers = require('./headers.js');
var body = require('./body.js');
var isRedirect = require('./utils/is-redirect.js');

// ----------------------------------------------------------------------------
const INTERNALS = Symbol('Response internals');
/**
 * Response class
 *
 * Ref: https://fetch.spec.whatwg.org/#response-class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response extends body["default"] {
    constructor(body$1 = null, options = {}) {
        super(body$1, options);
        // eslint-disable-next-line no-eq-null, eqeqeq, no-negated-condition
        const status = options.status != null ? options.status : 200;
        const headers$1 = new headers["default"](options.headers);
        if (body$1 !== null && !headers$1.has('Content-Type')) {
            const contentType = body.extractContentType(body$1);
            if (contentType) {
                headers$1.append('Content-Type', contentType);
            }
        }
        this[INTERNALS] = {
            type: 'default',
            url: options.url,
            status,
            statusText: options.statusText || '',
            headers: headers$1,
            counter: options.counter,
            highWaterMark: options.highWaterMark
        };
    }
    get type() {
        return this[INTERNALS].type;
    }
    get url() {
        return this[INTERNALS].url || '';
    }
    get status() {
        return this[INTERNALS].status;
    }
    /**
     * Convenience property representing if the request ended normally
     */
    get ok() {
        return this[INTERNALS].status >= 200 && this[INTERNALS].status < 300;
    }
    get redirected() {
        return this[INTERNALS].counter > 0;
    }
    get statusText() {
        return this[INTERNALS].statusText;
    }
    get headers() {
        return this[INTERNALS].headers;
    }
    get highWaterMark() {
        return this[INTERNALS].highWaterMark;
    }
    /**
     * Clone this response
     *
     * @return  Response
     */
    clone() {
        return new Response(body.clone(this, this.highWaterMark), {
            type: this.type,
            url: this.url,
            status: this.status,
            statusText: this.statusText,
            headers: this.headers,
            ok: this.ok,
            redirected: this.redirected,
            size: this.size,
            highWaterMark: this.highWaterMark
        });
    }
    /**
     * @param {string} url    The URL that the new response is to originate from.
     * @param {number} status An optional status code for the response (e.g., 302.)
     * @returns {Response}    A Response object.
     */
    static redirect(url, status = 302) {
        if (!isRedirect.isRedirect(status)) {
            throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
        }
        return new Response(null, {
            headers: {
                location: new URL(url).toString()
            },
            status
        });
    }
    static error() {
        const response = new Response(null, { status: 0, statusText: '' });
        response[INTERNALS].type = 'error';
        return response;
    }
    static json(data = undefined, init = {}) {
        const body = JSON.stringify(data);
        if (body === undefined) {
            throw new TypeError('data is not JSON serializable');
        }
        const headers$1 = new headers["default"](init && init.headers);
        if (!headers$1.has('content-type')) {
            headers$1.set('content-type', 'application/json');
        }
        return new Response(body, {
            ...init,
            headers: headers$1
        });
    }
    get [Symbol.toStringTag]() {
        return 'Response';
    }
}
Object.defineProperties(Response.prototype, {
    type: { enumerable: true },
    url: { enumerable: true },
    status: { enumerable: true },
    ok: { enumerable: true },
    redirected: { enumerable: true },
    statusText: { enumerable: true },
    headers: { enumerable: true },
    clone: { enumerable: true }
});

module.exports = Response;
