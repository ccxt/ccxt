'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var errors = require('../errors.js');
var Future = require('./Future.js');
var platform = require('../functions/platform.js');
var generic = require('../functions/generic.js');
var encode = require('../functions/encode.js');
require('../functions/crypto.js');
var time = require('../functions/time.js');
require('../functions/io.js');
var base = require('@scure/base');

// ----------------------------------------------------------------------------
// websocket decompression backends are resolved once at startup so the message
// hot path stays branch-free: node:zlib under Node, the fflate npm package elsewhere.
// inflate is always raw deflate (no zlib header), hence node's inflateRawSync.
let gunzipSync = undefined;
let inflateRawSync = undefined;
if (platform.isNode) {
    Promise.resolve().then(function () { return require(/* webpackIgnore: true */ 'node:zlib'); }).then((mod) => { gunzipSync = mod.gunzipSync; inflateRawSync = mod.inflateRawSync; }).catch(() => { });
}
else {
    Promise.resolve().then(function () { return require(/* webpackMode: "eager" */ 'fflate'); }).then((mod) => { gunzipSync = mod.gunzipSync; inflateRawSync = mod.inflateSync; }).catch(() => { });
}
// platform checks are likewise resolved once at module load so the send/ping
// hot paths stay branch-cheap:
// - usesNodeWsPackage: the 'ws' npm package is in use (node-style send callbacks, connection.ping ())
// - bunHasNativePing: bun's native WebSocket exposes ping () as a non-standard extension
// - hasPing: the active WebSocket implementation supports connection.ping ()
const usesNodeWsPackage = platform.isNode && !platform.isBun;
const bunHasNativePing = platform.isBun && (typeof globalThis.WebSocket !== 'undefined') && (typeof globalThis.WebSocket.prototype.ping === 'function');
const hasPing = usesNodeWsPackage || bunHasNativePing;
class Client {
    constructor(url, onMessageCallback, onErrorCallback, onCloseCallback, onConnectedCallback, config = {}) {
        this.verbose = false;
        this.decompressBinary = true;
        const defaults = {
            url,
            onMessageCallback,
            onErrorCallback,
            onCloseCallback,
            onConnectedCallback,
            verbose: false, // verbose output
            protocols: undefined, // ws-specific protocols
            options: undefined, // ws-specific options
            futures: {},
            subscriptions: {},
            rejections: {}, // so that we can reject things in the future
            connected: undefined, // connection-related Future
            error: undefined, // stores low-level networking exception, if any
            connectionStarted: undefined, // initiation timestamp in milliseconds
            connectionEstablished: undefined, // success timestamp in milliseconds
            isConnected: false,
            connectionTimer: undefined, // connection-related setTimeout
            connectionTimeout: 10000, // in milliseconds, false to disable
            pingInterval: undefined, // stores the ping-related interval
            ping: undefined, // ping-function (if defined)
            keepAlive: 30000, // ping-pong keep-alive rate in milliseconds
            maxPingPongMisses: 2.0, // how many missing pongs to throw a RequestTimeout
            // timeout is not used atm
            // timeout: 30000, // throw if a request is not satisfied in 30 seconds, false to disable
            connection: undefined,
            startedConnecting: false,
            gunzip: false,
            inflate: false,
        };
        Object.assign(this, generic.deepExtend(defaults, config));
        // connection-related Future
        this.connected = Future.Future();
    }
    reusableFuture(messageHash) {
        // only used in go
        return this.future(messageHash);
    }
    future(messageHash) {
        if (!(messageHash in this.futures)) {
            this.futures[messageHash] = Future.Future();
        }
        const future = this.futures[messageHash];
        if (messageHash in this.rejections) {
            future.reject(this.rejections[messageHash]);
            delete this.rejections[messageHash];
        }
        return future;
    }
    resolve(result, messageHash) {
        if (this.verbose && (messageHash === undefined)) {
            this.log(new Date(), 'resolve received undefined messageHash');
        }
        if ((messageHash !== undefined) && (messageHash in this.futures)) {
            const promise = this.futures[messageHash];
            promise.resolve(result);
            delete this.futures[messageHash];
        }
        return result;
    }
    reject(result, messageHash = undefined) {
        if (messageHash) {
            if (messageHash in this.futures) {
                const promise = this.futures[messageHash];
                promise.reject(result);
                delete this.futures[messageHash];
            }
            else {
                // in the case that a promise was already fulfilled
                // and the client has not yet called watchMethod to create a new future
                // calling client.reject will do nothing
                // this means the rejection will be ignored and the code will continue executing
                // instead we store the rejection for later
                this.rejections[messageHash] = result;
            }
        }
        else {
            const messageHashes = Object.keys(this.futures);
            for (let i = 0; i < messageHashes.length; i++) {
                this.reject(result, messageHashes[i]);
            }
        }
        return result;
    }
    log(...args) {
        console.log(...args);
        // console.dir (args, { depth: null })
    }
    connect(backoffDelay = 0) {
        throw new errors.NotSupported('connect() not implemented yet');
    }
    isOpen() {
        throw new errors.NotSupported('isOpen() not implemented yet');
    }
    reset(error) {
        this.clearConnectionTimeout();
        this.clearPingInterval();
        this.reject(error);
    }
    onConnectionTimeout() {
        if (!this.isOpen()) {
            const error = new errors.RequestTimeout('Connection to ' + this.url + ' failed due to a connection timeout');
            this.onError(error);
            this.connection.close(1006);
        }
    }
    setConnectionTimeout() {
        if (this.connectionTimeout) {
            const onConnectionTimeout = this.onConnectionTimeout.bind(this);
            this.connectionTimer = setTimeout(onConnectionTimeout, this.connectionTimeout);
        }
    }
    clearConnectionTimeout() {
        if (this.connectionTimer) {
            this.connectionTimer = clearTimeout(this.connectionTimer);
        }
    }
    setPingInterval() {
        if (this.keepAlive) {
            const onPingInterval = this.onPingInterval.bind(this);
            this.pingInterval = setInterval(onPingInterval, this.keepAlive);
        }
    }
    clearPingInterval() {
        if (this.pingInterval) {
            this.pingInterval = clearInterval(this.pingInterval);
        }
    }
    onPingInterval() {
        if (this.keepAlive && this.isOpen()) {
            const now = time.milliseconds();
            this.lastPong = this.lastPong || now;
            if ((this.lastPong + this.keepAlive * this.maxPingPongMisses) < now) {
                this.onError(new errors.RequestTimeout('Connection to ' + this.url + ' timed out due to a ping-pong keepalive missing on time'));
            }
            else {
                let message;
                if (this.ping) {
                    message = this.ping(this);
                }
                if (this.verbose) {
                    this.log(new Date(), 'onPingInterval', '|', this.url);
                }
                if (message) {
                    this.send(message).catch((error) => {
                        this.onError(error);
                    });
                }
                else if (hasPing) {
                    // can't do this inside browser
                    // https://stackoverflow.com/questions/10585355/sending-websocket-ping-pong-frame-from-browser
                    // under bun the native WebSocket implements ping () as a non-standard extension
                    this.connection.ping();
                }
                else {
                    // browsers handle ping-pong automatically therefore
                    // in a browser we update lastPong on every call to
                    // this function as if pong just came in to prevent the
                    // client from thinking it's a stalled connection
                    this.lastPong = now;
                }
            }
        }
    }
    onOpen() {
        if (this.verbose) {
            this.log(new Date(), 'onOpen', '|', this.url);
        }
        this.connectionEstablished = time.milliseconds();
        this.isConnected = true;
        this.connected.resolve(this.url);
        // this.connection.terminate () // debugging
        this.clearConnectionTimeout();
        this.setPingInterval();
        this.onConnectedCallback(this);
    }
    // this method is not used at this time, because in JS the ws client will
    // respond to pings coming from the server with pongs automatically
    // however, some devs may want to track connection states in their app
    onPing() {
        if (this.verbose) {
            this.log(new Date(), 'onPing', '|', this.url);
        }
    }
    onPong() {
        this.lastPong = time.milliseconds();
        if (this.verbose) {
            this.log(new Date(), 'onPong', '|', this.url);
        }
    }
    onError(error) {
        if (this.verbose) {
            this.log(new Date(), 'onError', error.message, '|', this.url);
        }
        if (!(error instanceof errors.BaseError)) {
            // in case of ErrorEvent from node_modules/ws/lib/event-target.js
            error = new errors.NetworkError(error.message);
        }
        this.error = error;
        this.reset(this.error);
        this.onErrorCallback(this, this.error);
    }
    /* eslint-disable no-shadow */
    onClose(event) {
        if (this.verbose) {
            this.log(new Date(), 'onClose', event, '|', this.url);
        }
        if (!this.error) {
            // todo: exception types for server-side disconnects
            this.reset(new errors.NetworkError('connection closed by remote server, closing code ' + String(event.code)));
        }
        if (this.error instanceof errors.ExchangeClosedByUser) {
            this.reset(this.error);
        }
        if (this.disconnected !== undefined) {
            this.disconnected.resolve(true);
        }
        this.onCloseCallback(this, event);
    }
    // this method is not used at this time
    // but may be used to read protocol-level data like cookies, headers, etc
    onUpgrade(message) {
        if (this.verbose) {
            this.log(new Date(), 'onUpgrade', '|', this.url);
        }
    }
    async send(message) {
        if (this.verbose) {
            this.log(new Date(), 'sending', message);
        }
        message = (typeof message === 'string') ? message : JSON.stringify(message);
        const future = Future.Future();
        if (usesNodeWsPackage) {
            // bun's native WebSocket send () does not accept a completion callback
            /* eslint-disable no-inner-declarations */
            /* eslint-disable jsdoc/require-jsdoc */
            function onSendComplete(error) {
                if (error) {
                    future.reject(error);
                }
                else {
                    future.resolve(null);
                }
            }
            this.connection.send(message, {}, onSendComplete);
        }
        else {
            this.connection.send(message);
            future.resolve(null);
        }
        return future;
    }
    close() {
        throw new errors.NotSupported('close() not implemented yet');
    }
    onMessage(messageEvent) {
        // if we use onmessage we get MessageEvent objects
        // MessageEvent {isTrusted: true, data: "{"e":"depthUpdate","E":1581358737706,"s":"ETHBTC",…"0.06200000"]],"a":[["0.02261300","0.00000000"]]}", origin: "wss://stream.binance.com:9443", lastEventId: "", source: null, …}
        let message = messageEvent.data;
        let arrayBuffer;
        try {
            if (typeof message !== 'string') {
                if (this.gunzip || this.inflate) {
                    arrayBuffer = new Uint8Array(message.buffer.slice(message.byteOffset, message.byteOffset + message.byteLength));
                    if (this.gunzip) {
                        arrayBuffer = gunzipSync(arrayBuffer);
                    }
                    else if (this.inflate) {
                        arrayBuffer = inflateRawSync(arrayBuffer);
                    }
                    message = base.utf8.encode(arrayBuffer);
                }
                else {
                    if (this.decompressBinary) {
                        message = message.toString();
                    }
                }
            }
        }
        catch (error) {
            // a frame that cannot be decompressed/decoded is connection-fatal:
            // the stream is corrupt or misaligned, so no subsequent frame can
            // be trusted either. the error must be handled here, at the throw
            // site - if it escaped onMessage it would be lost: on node it
            // would reject the fire-and-forget deliverLoop promise
            // (WsClient.ts) and crash the process as an unhandled rejection,
            // on browsers/bun the host event dispatch swallows handler
            // exceptions silently. established error semantics: onError
            // normalizes the error, sets this.error, rejects all pending
            // futures and notifies the exchange, then close () tears the
            // connection down
            this.onError(error);
            this.close();
            return;
        }
        try {
            if (encode.isJsonEncodedObject(message)) {
                message = message.toString();
                message = JSON.parse(message.replace(/:(\d{15,}),/g, ':"$1",'));
            }
            if (this.verbose) {
                this.log(new Date(), 'onMessage', message);
                // unlimited depth
                // this.log (new Date (), 'onMessage', util.inspect (message, false, null, true))
                // this.log (new Date (), 'onMessage', JSON.stringify (message, null, 4))
            }
        }
        catch (e) {
            this.log(new Date(), 'onMessage JSON.parse', e, '|', this.url);
            // reset with a json encoding error ?
        }
        try {
            this.onMessageCallback(this, message);
        }
        catch (error) {
            this.reject(error);
        }
    }
}

exports["default"] = Client;
