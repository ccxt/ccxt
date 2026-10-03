'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var WebSocket = require('ws');
var Client = require('./Client.js');
var platform = require('../functions/platform.js');
require('../Precise.js');
require('../functions/encode.js');
require('../functions/crypto.js');
var time = require('../functions/time.js');
require('../functions/throttle.js');
var misc = require('../functions/misc.js');
require('../functions/io.js');
var Future = require('./Future.js');
var errors = require('../errors.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var WebSocket__default = /*#__PURE__*/_interopDefaultLegacy(WebSocket);

// ----------------------------------------------------------------------------
// bun's 'ws' polyfill does not implement the 'upgrade' event (https://github.com/oven-sh/bun/issues/5951)
// which makes the HTTP 101 Switching Protocols response fire the error handler,
// so under bun we use its native WebSocket implementation instead of the 'ws' package
// eslint-disable-next-line no-restricted-globals
const WebSocketPlatform = platform.isBun ? globalThis.WebSocket : (platform.isNode || !misc.selfIsDefined() ? WebSocket__default["default"] : self.WebSocket);
class WsClient extends Client["default"] {
    constructor() {
        super(...arguments);
        this.startedConnecting = false;
    }
    createConnection() {
        if (this.verbose) {
            this.log(new Date(), 'connecting to', this.url);
        }
        this.connectionStarted = time.milliseconds();
        this.setConnectionTimeout();
        const connectionHeaders = {};
        if (this.cookies !== undefined) {
            let cookieStr = '';
            const cookiesKeys = Object.keys(this.cookies);
            for (let i = 0; i < cookiesKeys.length; i++) {
                const key = cookiesKeys[i];
                const value = this.cookies[key];
                cookieStr += key + '=' + value;
                if (i < cookiesKeys.length - 1) {
                    cookieStr += '; ';
                }
            }
            connectionHeaders['Cookie'] = cookieStr;
            this.options['headers'] = Object.assign(this.options['headers'] || {}, connectionHeaders);
        }
        if (platform.isBun) {
            // bun's native WebSocket supports non-standard options like 'headers'
            const bunOptions = { 'protocols': this.protocols };
            if (this.options && this.options['headers']) {
                bunOptions['headers'] = this.options['headers'];
            }
            this.connection = new WebSocketPlatform(this.url, bunOptions);
            this.connection.binaryType = 'nodebuffer'; // bun extension, keeps binary messages as Buffer like the 'ws' package
        }
        else if (platform.isNode) {
            this.options = this.options || {};
            this.connection = new WebSocketPlatform(this.url, this.protocols, this.options);
            // ws emits a whole socket chunk synchronously on one stack; the duplex buffers
            // it and deliverLoop's async iterator hands out one message per step on a fresh
            // stack, so consumer code never runs inside ws's emission stack.
            // readableObjectMode keeps 1 chunk = 1 message; readableHighWaterMark (in messages)
            // pauses the socket (TCP backpressure) until reads drain. attach synchronously - messages emitted before attachment are dropped
            this.duplex = WebSocket.createWebSocketStream(this.connection, { 'readableObjectMode': true, 'readableHighWaterMark': 1024 });
            this.duplex.on('error', () => { }); // teardown surfaces via the socket error/close handlers
        }
        else {
            this.connection = new WebSocketPlatform(this.url, this.protocols);
            this.connection.binaryType = "arraybuffer"; // for browsers not to use blob by default
        }
        this.connection.onopen = this.onConnectionOpen.bind(this);
        if (!platform.isNode || platform.isBun) {
            // browsers and bun deliver through native WebSocket events; on
            // node the duplex deliverLoop above owns message delivery
            this.connection.onmessage = this.onMessage.bind(this);
        }
        this.connection.onerror = this.onError.bind(this);
        this.connection.onclose = this.onClose.bind(this);
        if (platform.isBun) {
            this.connection.addEventListener('pong', this.onPong.bind(this));
        }
        else if (platform.isNode) {
            this.connection
                .on('ping', this.onPing.bind(this))
                .on('pong', this.onPong.bind(this))
                .on('upgrade', this.onUpgrade.bind(this));
        }
        // this.connection.terminate () // debugging
        // this.connection.close () // debugging
    }
    onConnectionOpen() {
        if (platform.isNode && !platform.isBun) {
            // under bun there is no duplex - messages arrive through the
            // native WebSocket onmessage handler instead
            this.deliverLoop();
        }
        this.onOpen();
    }
    // one message per async-iterator step: between chunks the loop parks on
    // the iterator until the next socket event (a macrotask), so a consumer
    // awaiting a just-resolved future always drains its re-arm microtask
    // chain (watchX -> loadMarkets -> watch -> client.future) before the
    // next delivery can happen - no explicit hop between deliveries needed
    async deliverLoop() {
        try {
            for await (const message of this.duplex) {
                this.onMessage({ 'data': message });
                // release valve: if the server outpaces the paced delivery below, flush
                // the duplex backlog synchronously through onMessage - same as the php
                // client's on_message and the python client's receive_loop. bounds queueing
                // latency and memory under bursts; consumers awaiting futures observe the
                // merged/cached state on their next wakeup
                while (this.duplex.readableLength > 0) {
                    const queued = this.duplex.read();
                    if (queued === null) {
                        break;
                    }
                    this.onMessage({ 'data': queued });
                }
            }
        }
        catch (e) {
            // onMessage handles its own dispatch errors, so only an iterator rejection
            // lands here: ws destroying the duplex on a socket 'error' (protocol
            // violations). the error/close handlers in createConnection have already
            // applied the full error semantics, so this is a duplicate signal - swallow
            // it, deliverLoop is fire-and-forget and an escape would be an unhandled rejection
        }
    }
    connect(backoffDelay = 0) {
        if (!this.startedConnecting) {
            this.startedConnecting = true;
            // exponential backoff for consequent ws connections if necessary
            if (backoffDelay) {
                time.sleep(backoffDelay).then(this.createConnection.bind(this));
            }
            else {
                this.createConnection();
            }
        }
        return this.connected;
    }
    isOpen() {
        return (this.connection.readyState === WebSocketPlatform.OPEN);
    }
    close() {
        if (this.connection instanceof WebSocketPlatform) {
            if (this.disconnected === undefined) {
                this.disconnected = Future.Future();
            }
            this.connection.close();
        }
        else {
            // a client that never dialed has no socket teardown to fire the
            // onClose -> reset -> reject chain, so its pending futures would
            // hang their waiters across a close - settle them here, same idea
            // as Client.reset
            this.reset(this.error !== undefined ? this.error : new errors.ExchangeClosedByUser('connection closed by the user'));
        }
        return this.disconnected;
    }
}

exports["default"] = WsClient;
