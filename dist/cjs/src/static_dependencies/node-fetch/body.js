'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Stream = require('node:stream');
var node_util = require('node:util');
var node_buffer = require('node:buffer');
var fetchError = require('./errors/fetch-error.js');
var base = require('./errors/base.js');
var is = require('./utils/is.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Stream__default = /*#__PURE__*/_interopDefaultLegacy(Stream);

// ----------------------------------------------------------------------------
const pipeline = node_util.promisify(Stream__default["default"].pipeline);
const INTERNALS = Symbol('Body internals');
/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Body {
    constructor(body, { size = 0 } = {}) {
        let boundary = null;
        if (body === null) {
            // Body is undefined or null
            body = null;
        }
        else if (is.isURLSearchParameters(body)) {
            // Body is a URLSearchParams
            body = node_buffer.Buffer.from(body.toString());
        }
        else if (is.isBlob(body)) ;
        else if (node_buffer.Buffer.isBuffer(body)) ;
        else if (node_util.types.isAnyArrayBuffer(body)) {
            // Body is ArrayBuffer
            body = node_buffer.Buffer.from(body);
        }
        else if (ArrayBuffer.isView(body)) {
            // Body is ArrayBufferView
            body = node_buffer.Buffer.from(body.buffer, body.byteOffset, body.byteLength);
        }
        else if (body instanceof Stream__default["default"]) ; /* else if (body instanceof FormData) {
            Body is FormData
            body = formDataToBlob(body);
            boundary = body.type.split('=')[1];
        } */
        else {
            // None of the above
            // coerce to string then buffer
            body = node_buffer.Buffer.from(String(body));
        }
        let stream = body;
        if (node_buffer.Buffer.isBuffer(body)) {
            stream = Stream__default["default"].Readable.from(body);
        }
        else if (is.isBlob(body)) {
            stream = Stream__default["default"].Readable.from(body.stream());
        }
        this[INTERNALS] = {
            body,
            stream,
            boundary,
            disturbed: false,
            error: null
        };
        this.size = size;
        if (body instanceof Stream__default["default"]) {
            body.on('error', error_ => {
                const error = error_ instanceof base.FetchBaseError ?
                    error_ :
                    new fetchError.FetchError(`Invalid response body while trying to fetch ${this.url}: ${error_.message}`, 'system', error_);
                this[INTERNALS].error = error;
            });
        }
    }
    get body() {
        return this[INTERNALS].stream;
    }
    get bodyUsed() {
        return this[INTERNALS].disturbed;
    }
    /**
     * Decode response as ArrayBuffer
     *
     * @return  Promise
     */
    async arrayBuffer() {
        const { buffer, byteOffset, byteLength } = await consumeBody(this);
        return buffer.slice(byteOffset, byteOffset + byteLength);
    }
    /*async formData() {
        const ct = this.headers.get('content-type');

        if (ct.startsWith('application/x-www-form-urlencoded')) {
            const formData = new FormData();
            const parameters = new URLSearchParams(await this.text());

            for (const [name, value] of parameters) {
                formData.append(name, value);
            }

            return formData;
        }

        const {toFormData} = await import('./utils/multipart-parser.js');
        return toFormData(this.body, ct);
    }*/
    /**
     * Return raw response as Blob
     *
     * @return Promise
     */
    async blob() {
        const ct = (this.headers && this.headers.get('content-type')) || (this[INTERNALS].body && this[INTERNALS].body.type) || '';
        const buf = await this.arrayBuffer();
        return new Blob([buf], {
            type: ct
        });
    }
    /**
     * Decode response as json
     *
     * @return  Promise
     */
    async json() {
        const text = await this.text();
        return JSON.parse(text);
    }
    /**
     * Decode response as text
     *
     * @return  Promise
     */
    async text() {
        const buffer = await consumeBody(this);
        return new TextDecoder().decode(buffer);
    }
    /**
     * Decode response as buffer (non-spec api)
     *
     * @return  Promise
     */
    buffer() {
        return consumeBody(this);
    }
}
Body.prototype.buffer = node_util.deprecate(Body.prototype.buffer, 'Please use \'response.arrayBuffer()\' instead of \'response.buffer()\'', 'node-fetch#buffer');
// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
    body: { enumerable: true },
    bodyUsed: { enumerable: true },
    arrayBuffer: { enumerable: true },
    blob: { enumerable: true },
    json: { enumerable: true },
    text: { enumerable: true },
    data: { get: node_util.deprecate(() => { }, 'data doesn\'t exist, use json(), text(), arrayBuffer(), or body instead', 'https://github.com/node-fetch/node-fetch/issues/1000 (response)') }
});
/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return Promise
 */
async function consumeBody(data) {
    if (data[INTERNALS].disturbed) {
        throw new TypeError(`body used already for: ${data.url}`);
    }
    data[INTERNALS].disturbed = true;
    if (data[INTERNALS].error) {
        throw data[INTERNALS].error;
    }
    const { body } = data;
    // Body is null
    if (body === null) {
        return node_buffer.Buffer.alloc(0);
    }
    /* c8 ignore next 3 */
    if (!(body instanceof Stream__default["default"])) {
        return node_buffer.Buffer.alloc(0);
    }
    // Body is stream
    // get ready to actually consume the body
    const accum = [];
    let accumBytes = 0;
    try {
        for await (const chunk of body) {
            if (data.size > 0 && accumBytes + chunk.length > data.size) {
                const error = new fetchError.FetchError(`content size at ${data.url} over limit: ${data.size}`, 'max-size');
                body.destroy(error);
                throw error;
            }
            accumBytes += chunk.length;
            accum.push(chunk);
        }
    }
    catch (error) {
        const error_ = error instanceof base.FetchBaseError ? error : new fetchError.FetchError(`Invalid response body while trying to fetch ${data.url}: ${error.message}`, 'system', error);
        throw error_;
    }
    if (body.readableEnded === true || body._readableState.ended === true) {
        try {
            if (accum.every(c => typeof c === 'string')) {
                return node_buffer.Buffer.from(accum.join(''));
            }
            return node_buffer.Buffer.concat(accum, accumBytes);
        }
        catch (error) {
            throw new fetchError.FetchError(`Could not create Buffer from response body for ${data.url}: ${error.message}`, 'system', error);
        }
    }
    else {
        throw new fetchError.FetchError(`Premature close of server response while trying to fetch ${data.url}`);
    }
}
/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed   instance       Response or Request instance
 * @param   String  highWaterMark  highWaterMark for both PassThrough body streams
 * @return  Mixed
 */
const clone = (instance, highWaterMark) => {
    let p1;
    let p2;
    let { body } = instance[INTERNALS];
    // Don't allow cloning a used body
    if (instance.bodyUsed) {
        throw new Error('cannot clone body after it is used');
    }
    // Check that body is a stream and not form-data object
    // note: we can't clone the form-data object without having it as a dependency
    if ((body instanceof Stream__default["default"]) && (typeof body.getBoundary !== 'function')) {
        // Tee instance body
        p1 = new Stream.PassThrough({ highWaterMark });
        p2 = new Stream.PassThrough({ highWaterMark });
        body.pipe(p1);
        body.pipe(p2);
        // Set instance body to teed body and return the other teed body
        instance[INTERNALS].stream = p1;
        body = p2;
    }
    return body;
};
const getNonSpecFormDataBoundary = node_util.deprecate(body => body.getBoundary(), 'form-data doesn\'t follow the spec and requires special treatment. Use alternative package', 'https://github.com/node-fetch/node-fetch/issues/1167');
/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param {any} body Any options.body input
 * @returns {string | null}
 */
const extractContentType = (body, request) => {
    // Body is null or undefined
    if (body === null) {
        return null;
    }
    // Body is string
    if (typeof body === 'string') {
        return 'text/plain;charset=UTF-8';
    }
    // Body is a URLSearchParams
    if (is.isURLSearchParameters(body)) {
        return 'application/x-www-form-urlencoded;charset=UTF-8';
    }
    // Body is blob
    if (is.isBlob(body)) {
        return body.type || null;
    }
    // Body is a Buffer (Buffer, ArrayBuffer or ArrayBufferView)
    if (node_buffer.Buffer.isBuffer(body) || node_util.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
        return null;
    }
    // if (body instanceof FormData) {
    // 	return `multipart/form-data; boundary=${request[INTERNALS].boundary}`;
    // }
    // Detect form data input from form-data module
    if (body && typeof body.getBoundary === 'function') {
        return `multipart/form-data;boundary=${getNonSpecFormDataBoundary(body)}`;
    }
    // Body is stream - can't really do much about this
    if (body instanceof Stream__default["default"]) {
        return null;
    }
    // Body constructor defaults other things to string
    return 'text/plain;charset=UTF-8';
};
/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param {any} obj.body Body object from the Body instance.
 * @returns {number | null}
 */
const getTotalBytes = request => {
    const { body } = request[INTERNALS];
    // Body is null or undefined
    if (body === null) {
        return 0;
    }
    // Body is Blob
    if (is.isBlob(body)) {
        return body.size;
    }
    // Body is Buffer
    if (node_buffer.Buffer.isBuffer(body)) {
        return body.length;
    }
    // Detect form data input from form-data module
    if (body && typeof body.getLengthSync === 'function') {
        return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
    }
    // Body is stream
    return null;
};
/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param {Stream.Writable} dest The stream to write to.
 * @param obj.body Body object from the Body instance.
 * @returns {Promise<void>}
 */
const writeToStream = async (dest, { body }) => {
    if (body === null) {
        // Body is null
        dest.end();
    }
    else {
        // Body is stream
        await pipeline(body, dest);
    }
};

exports.clone = clone;
exports["default"] = Body;
exports.extractContentType = extractContentType;
exports.getTotalBytes = getTotalBytes;
exports.writeToStream = writeToStream;
