'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var http = require('node:http');
var https = require('node:https');
var zlib = require('node:zlib');
var Stream = require('node:stream');
var node_buffer = require('node:buffer');
var body = require('./body.js');
var response = require('./response.js');
var headers = require('./headers.js');
var request = require('./request.js');
var fetchError = require('./errors/fetch-error.js');
var abortError = require('./errors/abort-error.js');
var isRedirect = require('./utils/is-redirect.js');
var is = require('./utils/is.js');
var referrer = require('./utils/referrer.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var http__default = /*#__PURE__*/_interopDefaultLegacy(http);
var https__default = /*#__PURE__*/_interopDefaultLegacy(https);
var zlib__default = /*#__PURE__*/_interopDefaultLegacy(zlib);
var Stream__default = /*#__PURE__*/_interopDefaultLegacy(Stream);

/**
 * Index.js
 *
 * a request API compatible with window.fetch
 *
 * All spec algorithm step numbers are based on https://fetch.spec.whatwg.org/commit-snapshots/ae716822cb3a61843226cd090eefc6589446c1d2/.
 */
const supportedSchemas = new Set(['data:', 'http:', 'https:']);
/**
 * Fetch function
 *
 * @param   {string | URL | import('./request').default} url - Absolute url or Request instance
 * @param   {*} [options_] - Fetch options
 * @return  {Promise<import('./response').default>}
 */
async function fetch(url, options_) {
    return new Promise((resolve, reject) => {
        // Build request object
        const request$1 = new request["default"](url, options_);
        const { parsedURL, options } = request.getNodeRequestOptions(request$1);
        if (!supportedSchemas.has(parsedURL.protocol)) {
            throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${parsedURL.protocol.replace(/:$/, '')}" is not supported.`);
        }
        /*if (parsedURL.protocol === 'data:') {
            const data = dataUriToBuffer(request.url);
            const response = new Response(data, {headers: {'Content-Type': data.typeFull}});
            resolve(response);
            return;
        }*/
        // Wrap http.request into fetch
        const send = (parsedURL.protocol === 'https:' ? https__default["default"] : http__default["default"]).request;
        const { signal } = request$1;
        let response$1 = null;
        const abort = () => {
            const error = new abortError.AbortError('The operation was aborted.');
            reject(error);
            if (request$1.body && request$1.body instanceof Stream__default["default"].Readable) {
                request$1.body.destroy(error);
            }
            if (!response$1 || !response$1.body) {
                return;
            }
            response$1.body.emit('error', error);
        };
        if (signal && signal.aborted) {
            abort();
            return;
        }
        const abortAndFinalize = () => {
            abort();
            finalize();
        };
        // Send request
        const request_ = send(parsedURL.toString(), options);
        if (signal) {
            signal.addEventListener('abort', abortAndFinalize);
        }
        const finalize = () => {
            request_.abort();
            if (signal) {
                signal.removeEventListener('abort', abortAndFinalize);
            }
        };
        request_.on('error', error => {
            reject(new fetchError.FetchError(`request to ${request$1.url} failed, reason: ${error.message}`, 'system', error));
            finalize();
        });
        fixResponseChunkedTransferBadEnding(request_, error => {
            if (response$1 && response$1.body) {
                response$1.body.destroy(error);
            }
        });
        /* c8 ignore next 18 */
        if (process.version < 'v14') {
            // Before Node.js 14, pipeline() does not fully support async iterators and does not always
            // properly handle when the socket close/end events are out of order.
            request_.on('socket', s => {
                let endedWithEventsCount;
                s.prependListener('end', () => {
                    endedWithEventsCount = s._eventsCount;
                });
                s.prependListener('close', hadError => {
                    // if end happened before close but the socket didn't emit an error, do it now
                    if (response$1 && endedWithEventsCount < s._eventsCount && !hadError) {
                        const error = new Error('Premature close');
                        error.code = 'ERR_STREAM_PREMATURE_CLOSE';
                        response$1.body.emit('error', error);
                    }
                });
            });
        }
        request_.on('response', response_ => {
            request_.setTimeout(0);
            const headers$1 = headers.fromRawHeaders(response_.rawHeaders);
            // HTTP fetch step 5
            if (isRedirect.isRedirect(response_.statusCode)) {
                // HTTP fetch step 5.2
                const location = headers$1.get('Location');
                // HTTP fetch step 5.3
                let locationURL = null;
                try {
                    locationURL = location === null ? null : new URL(location, request$1.url);
                }
                catch {
                    // error here can only be invalid URL in Location: header
                    // do not throw when options.redirect == manual
                    // let the user extract the errorneous redirect URL
                    if (request$1.redirect !== 'manual') {
                        reject(new fetchError.FetchError(`uri requested responds with an invalid redirect URL: ${location}`, 'invalid-redirect'));
                        finalize();
                        return;
                    }
                }
                // HTTP fetch step 5.5
                switch (request$1.redirect) {
                    case 'error':
                        reject(new fetchError.FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request$1.url}`, 'no-redirect'));
                        finalize();
                        return;
                    case 'manual':
                        // Nothing to do
                        break;
                    case 'follow': {
                        // HTTP-redirect fetch step 2
                        if (locationURL === null) {
                            break;
                        }
                        // HTTP-redirect fetch step 5
                        if (request$1.counter >= request$1.follow) {
                            reject(new fetchError.FetchError(`maximum redirect reached at: ${request$1.url}`, 'max-redirect'));
                            finalize();
                            return;
                        }
                        // HTTP-redirect fetch step 6 (counter increment)
                        // Create a new Request object.
                        const requestOptions = {
                            headers: new headers["default"](request$1.headers),
                            follow: request$1.follow,
                            counter: request$1.counter + 1,
                            agent: request$1.agent,
                            compress: request$1.compress,
                            method: request$1.method,
                            body: body.clone(request$1),
                            signal: request$1.signal,
                            size: request$1.size,
                            referrer: request$1.referrer,
                            referrerPolicy: request$1.referrerPolicy
                        };
                        // when forwarding sensitive headers like "Authorization",
                        // "WWW-Authenticate", and "Cookie" to untrusted targets,
                        // headers will be ignored when following a redirect to a domain
                        // that is not a subdomain match or exact match of the initial domain.
                        // For example, a redirect from "foo.com" to either "foo.com" or "sub.foo.com"
                        // will forward the sensitive headers, but a redirect to "bar.com" will not.
                        // headers will also be ignored when following a redirect to a domain using
                        // a different protocol. For example, a redirect from "https://foo.com" to "http://foo.com"
                        // will not forward the sensitive headers
                        if (!is.isDomainOrSubdomain(request$1.url, locationURL) || !is.isSameProtocol(request$1.url, locationURL)) {
                            for (const name of ['authorization', 'www-authenticate', 'cookie', 'cookie2']) {
                                requestOptions.headers.delete(name);
                            }
                        }
                        // HTTP-redirect fetch step 9
                        if (response_.statusCode !== 303 && request$1.body && options_.body instanceof Stream__default["default"].Readable) {
                            reject(new fetchError.FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
                            finalize();
                            return;
                        }
                        // HTTP-redirect fetch step 11
                        if (response_.statusCode === 303 || ((response_.statusCode === 301 || response_.statusCode === 302) && request$1.method === 'POST')) {
                            requestOptions.method = 'GET';
                            requestOptions.body = undefined;
                            requestOptions.headers.delete('content-length');
                        }
                        // HTTP-redirect fetch step 14
                        const responseReferrerPolicy = referrer.parseReferrerPolicyFromHeader(headers$1);
                        if (responseReferrerPolicy) {
                            requestOptions.referrerPolicy = responseReferrerPolicy;
                        }
                        // HTTP-redirect fetch step 15
                        resolve(fetch(new request["default"](locationURL, requestOptions)));
                        finalize();
                        return;
                    }
                    default:
                        return reject(new TypeError(`Redirect option '${request$1.redirect}' is not a valid value of RequestRedirect`));
                }
            }
            // Prepare response
            if (signal) {
                response_.once('end', () => {
                    signal.removeEventListener('abort', abortAndFinalize);
                });
            }
            let body$1 = Stream.pipeline(response_, new Stream.PassThrough(), error => {
                if (error) {
                    reject(error);
                }
            });
            // see https://github.com/nodejs/node/pull/29376
            /* c8 ignore next 3 */
            if (process.version < 'v12.10') {
                response_.on('aborted', abortAndFinalize);
            }
            const responseOptions = {
                url: request$1.url,
                status: response_.statusCode,
                statusText: response_.statusMessage,
                headers: headers$1,
                size: request$1.size,
                counter: request$1.counter,
                highWaterMark: request$1.highWaterMark
            };
            // HTTP-network fetch step 12.1.1.3
            const codings = headers$1.get('Content-Encoding');
            // HTTP-network fetch step 12.1.1.4: handle content codings
            // in following scenarios we ignore compression support
            // 1. compression support is disabled
            // 2. HEAD request
            // 3. no Content-Encoding header
            // 4. no content response (204)
            // 5. content not modified response (304)
            if (!request$1.compress || request$1.method === 'HEAD' || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
                response$1 = new response(body$1, responseOptions);
                resolve(response$1);
                return;
            }
            // For Node v6+
            // Be less strict when decoding compressed responses, since sometimes
            // servers send slightly invalid responses that are still accepted
            // by common browsers.
            // Always using Z_SYNC_FLUSH is what cURL does.
            const zlibOptions = {
                flush: zlib__default["default"].Z_SYNC_FLUSH,
                finishFlush: zlib__default["default"].Z_SYNC_FLUSH
            };
            // For gzip
            if (codings === 'gzip' || codings === 'x-gzip') {
                body$1 = Stream.pipeline(body$1, zlib__default["default"].createGunzip(zlibOptions), error => {
                    if (error) {
                        reject(error);
                    }
                });
                response$1 = new response(body$1, responseOptions);
                resolve(response$1);
                return;
            }
            // For deflate
            if (codings === 'deflate' || codings === 'x-deflate') {
                // Handle the infamous raw deflate response from old servers
                // a hack for old IIS and Apache servers
                const raw = Stream.pipeline(response_, new Stream.PassThrough(), error => {
                    if (error) {
                        reject(error);
                    }
                });
                raw.once('data', chunk => {
                    // See http://stackoverflow.com/questions/37519828
                    if ((chunk[0] & 0x0F) === 0x08) {
                        body$1 = Stream.pipeline(body$1, zlib__default["default"].createInflate(), error => {
                            if (error) {
                                reject(error);
                            }
                        });
                    }
                    else {
                        body$1 = Stream.pipeline(body$1, zlib__default["default"].createInflateRaw(), error => {
                            if (error) {
                                reject(error);
                            }
                        });
                    }
                    response$1 = new response(body$1, responseOptions);
                    resolve(response$1);
                });
                raw.once('end', () => {
                    // Some old IIS servers return zero-length OK deflate responses, so
                    // 'data' is never emitted. See https://github.com/node-fetch/node-fetch/pull/903
                    if (!response$1) {
                        response$1 = new response(body$1, responseOptions);
                        resolve(response$1);
                    }
                });
                return;
            }
            // For br
            if (codings === 'br') {
                body$1 = Stream.pipeline(body$1, zlib__default["default"].createBrotliDecompress(), error => {
                    if (error) {
                        reject(error);
                    }
                });
                response$1 = new response(body$1, responseOptions);
                resolve(response$1);
                return;
            }
            // Otherwise, use response as-is
            response$1 = new response(body$1, responseOptions);
            resolve(response$1);
        });
        // eslint-disable-next-line promise/prefer-await-to-then
        body.writeToStream(request_, request$1).catch(reject);
    });
}
function fixResponseChunkedTransferBadEnding(request, errorCallback) {
    const LAST_CHUNK = node_buffer.Buffer.from('0\r\n\r\n');
    let isChunkedTransfer = false;
    let properLastChunkReceived = false;
    let previousChunk;
    request.on('response', response => {
        const { headers } = response;
        isChunkedTransfer = headers['transfer-encoding'] === 'chunked' && !headers['content-length'];
    });
    request.on('socket', socket => {
        const onSocketClose = () => {
            if (isChunkedTransfer && !properLastChunkReceived) {
                const error = new Error('Premature close');
                error.code = 'ERR_STREAM_PREMATURE_CLOSE';
                errorCallback(error);
            }
        };
        const onData = buf => {
            properLastChunkReceived = node_buffer.Buffer.compare(buf.slice(-5), LAST_CHUNK) === 0;
            // Sometimes final 0-length chunk and end of message code are in separate packets
            if (!properLastChunkReceived && previousChunk) {
                properLastChunkReceived = (node_buffer.Buffer.compare(previousChunk.slice(-3), LAST_CHUNK.slice(0, 3)) === 0 &&
                    node_buffer.Buffer.compare(buf.slice(-2), LAST_CHUNK.slice(3)) === 0);
            }
            previousChunk = buf;
        };
        socket.prependListener('close', onSocketClose);
        socket.on('data', onData);
        request.on('close', () => {
            socket.removeListener('close', onSocketClose);
            socket.removeListener('data', onData);
        });
    });
}

exports.Response = response;
exports.Headers = headers["default"];
exports.Request = request["default"];
exports.FetchError = fetchError.FetchError;
exports.AbortError = abortError.AbortError;
exports.isRedirect = isRedirect.isRedirect;
exports["default"] = fetch;
