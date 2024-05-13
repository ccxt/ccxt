import { RequestTimeout, NetworkError, NotSupported, BaseError, ExchangeClosedByUser } from '../../base/errors.js';
import { inflateSync, gunzipSync } from '../../static_dependencies/fflake/browser.js';
import { Future } from './Future.js';

import {
    isNode,
    isJsonEncodedObject,
    deepExtend,
    milliseconds,
} from '../../base/functions.js';
import { utf8 } from '../../static_dependencies/scure-base/index.js';
import { Dictionary, Str } from '../types.js';

export default class Client {
    connected: Promise<any>

    // @ts-ignore: 2564
    disconnected: ReturnType<typeof Future>

    // @ts-ignore: 2564
    futures: Dictionary<any>

    // @ts-ignore: 2564
    rejections: Dictionary<any>

    // @ts-ignore: 2564
    keepAlive: number

    connection: any

    connectionTimeout: any

    verbose: boolean = false

    connectionTimer: any

    lastPong: any

    maxPingPongMisses: any

    pingInterval: any

    connectionEstablished: any

    gunzip: any

    error: any

    inflate: any

    // @ts-ignore: 2564
    url: string

    isConnected: any

    onConnectedCallback: any

    onMessageCallback: any

    onErrorCallback: any

    onCloseCallback: any

    ping: any

    // @ts-ignore: 2564
    subscriptions: Dictionary<any>

    throttle: any

    constructor (url: string, onMessageCallback: Function | undefined, onErrorCallback: Function | undefined, onCloseCallback: Function | undefined, onConnectedCallback: Function | undefined, config = {}) {
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
        }
        Object.assign (this, deepExtend (defaults, config))
        // connection-related Future
        this.connected = Future ()
    }

    future (messageHash: string) {
        if (!(messageHash in this.futures)) {
            this.futures[messageHash] = Future ()
        }
        const future = this.futures[messageHash]
        if (messageHash in this.rejections) {
            future.reject (this.rejections[messageHash])
            delete this.rejections[messageHash]
        }
        return future
    }

    resolve (result: any, messageHash: Str) {
        if (this.verbose && (messageHash === undefined)) {
            this.log (new Date (), 'resolve received undefined messageHash');
        }
        if ((messageHash !== undefined) && (messageHash in this.futures)) {
            const promise = this.futures[messageHash]
            promise.resolve (result)
            delete this.futures[messageHash]
        }
        return result
    }

    reject (result: any, messageHash: Str = undefined) {
        if (messageHash) {
            if (messageHash in this.futures) {
                const promise = this.futures[messageHash]
                promise.reject (result)
                delete this.futures[messageHash]
            } else {
                // in the case that a promise was already fulfilled
                // and the client has not yet called watchMethod to create a new future
                // calling client.reject will do nothing
                // this means the rejection will be ignored and the code will continue executing
                // instead we store the rejection for later
                this.rejections[messageHash] = result
            }
        } else {
            const messageHashes = Object.keys (this.futures)
            for (let i = 0; i < messageHashes.length; i++) {
                this.reject (result, messageHashes[i])
            }
        }
        return result
    }

    log (... args: any[]) {
        console.log (... args)
        // console.dir (args, { depth: null })
    }

    connect (backoffDelay = 0) {
        throw new NotSupported ('connect() not implemented yet');
    }

    isOpen (): boolean {
        throw new NotSupported ('isOpen() not implemented yet');
    }

    reset (error: any) {
        this.clearConnectionTimeout ()
        this.clearPingInterval ()
        this.reject (error)
    }

    onConnectionTimeout () {
        if (!this.isOpen ()) {
            const error = new RequestTimeout ('Connection to ' + this.url + ' failed due to a connection timeout')
            this.onError (error)
            this.connection.close (1006)
        }
    }

    setConnectionTimeout () {
        if (this.connectionTimeout) {
            const onConnectionTimeout = this.onConnectionTimeout.bind (this)
            this.connectionTimer = setTimeout (onConnectionTimeout, this.connectionTimeout)
        }
    }

    clearConnectionTimeout () {
        if (this.connectionTimer) {
            this.connectionTimer = clearTimeout (this.connectionTimer)
        }
    }

    setPingInterval () {
        if (this.keepAlive) {
            const onPingInterval = this.onPingInterval.bind (this)
            this.pingInterval = setInterval (onPingInterval, this.keepAlive)
        }
    }

    clearPingInterval () {
        if (this.pingInterval) {
            this.pingInterval = clearInterval (this.pingInterval)
        }
    }

    onPingInterval () {
        if (this.keepAlive && (this as any).isOpen ()) {
            const now = milliseconds ()
            this.lastPong = this.lastPong || now
            if ((this.lastPong + this.keepAlive * this.maxPingPongMisses) < now) {
                this.onError (new RequestTimeout ('Connection to ' + this.url + ' timed out due to a ping-pong keepalive missing on time'))
            } else {
                let message: any;
                if (this.ping) {
                    message = this.ping (this);
                }
                if (message) {
                    this.send (message).catch ((error) => {
                        this.onError (error);
                    });
                } else if (isNode) {
                    // can't do this inside browser
                    // https://stackoverflow.com/questions/10585355/sending-websocket-ping-pong-frame-from-browser
                    this.connection.ping ()
                } else {
                    // browsers handle ping-pong automatically therefore
                    // in a browser we update lastPong on every call to
                    // this function as if pong just came in to prevent the
                    // client from thinking it's a stalled connection
                    this.lastPong = now;
                }
            }
        }
    }

    onOpen () {
        if (this.verbose) {
            this.log (new Date (), 'onOpen')
        }
        this.connectionEstablished = milliseconds ()
        this.isConnected = true;
        (this as any).connected.resolve (this.url)
        // this.connection.terminate () // debugging
        this.clearConnectionTimeout ()
        this.setPingInterval ()
        this.onConnectedCallback (this)
    }

    // this method is not used at this time, because in JS the ws client will
    // respond to pings coming from the server with pongs automatically
    // however, some devs may want to track connection states in their app
    onPing () {
        if (this.verbose) {
            this.log (new Date (), 'onPing')
        }
    }

    onPong () {
        this.lastPong = milliseconds ()
        if (this.verbose) {
            this.log (new Date (), 'onPong')
        }
    }

    onError (error: any) {
        if (this.verbose) {
            this.log (new Date (), 'onError', error.message)
        }
        if (!(error instanceof BaseError)) {
            // in case of ErrorEvent from node_modules/ws/lib/event-target.js
            error = new NetworkError (error.message)
        }
        this.error = error
        this.reset (this.error)
        this.onErrorCallback (this, this.error)
    }

    /* eslint-disable no-shadow */
    onClose (event: any) {
        if (this.verbose) {
            this.log (new Date (), 'onClose', event)
        }
        if (!this.error) {
            // todo: exception types for server-side disconnects
            this.reset (new NetworkError ('connection closed by remote server, closing code ' + String (event.code)))
        }
        if (this.error instanceof ExchangeClosedByUser) {
            this.reset (this.error);
        }
        if (this.disconnected !== undefined) {
            this.disconnected.resolve (true);
        }
        this.onCloseCallback (this, event)
    }

    // this method is not used at this time
    // but may be used to read protocol-level data like cookies, headers, etc
    onUpgrade (message: any) {
        if (this.verbose) {
            this.log (new Date (), 'onUpgrade')
        }
    }

    async send (message: any) {
        if (this.verbose) {
            this.log (new Date (), 'sending', message)
        }
        message = (typeof message === 'string') ? message : JSON.stringify (message)
        const future = Future ()
        if (isNode) {
            /* eslint-disable no-inner-declarations */
            /* eslint-disable jsdoc/require-jsdoc */
            function onSendComplete (error: any) {
                if (error) {
                    future.reject (error)
                } else {
                    future.resolve (null)
                }
            }
            this.connection.send (message, {}, onSendComplete)
        } else {
            this.connection.send (message)
            future.resolve (null)
        }
        return future
    }

    close () {
        throw new NotSupported ('close() not implemented yet');
    }

    onMessage (messageEvent : any) {
        // if we use onmessage we get MessageEvent objects
        // MessageEvent {isTrusted: true, data: "{"e":"depthUpdate","E":1581358737706,"s":"ETHBTC",…"0.06200000"]],"a":[["0.02261300","0.00000000"]]}", origin: "wss://stream.binance.com:9443", lastEventId: "", source: null, …}

        let message : Buffer | string = messageEvent.data
        let arrayBuffer : Uint8Array
        if (typeof message !== 'string') {
            if (this.gunzip || this.inflate) {
                arrayBuffer = new Uint8Array (message.buffer.slice (message.byteOffset, message.byteOffset + message.byteLength))
                if (this.gunzip) {
                    arrayBuffer = gunzipSync (arrayBuffer)
                } else if (this.inflate) {
                    arrayBuffer = inflateSync (arrayBuffer)
                }
                message = utf8.encode (arrayBuffer)
            } else {
                message = message.toString ()
            }
        }
        try {
            if (isJsonEncodedObject (message)) {
                message = JSON.parse (message.replace (/:(\d{15,}),/g, ':"$1",'))
            }
            if (this.verbose) {
                this.log (new Date (), 'onMessage', message)
                // unlimited depth
                // this.log (new Date (), 'onMessage', util.inspect (message, false, null, true))
                // this.log (new Date (), 'onMessage', JSON.stringify (message, null, 4))
            }
        } catch (e) {
            this.log (new Date (), 'onMessage JSON.parse', e)
            // reset with a json encoding error ?
        }
        try {
            this.onMessageCallback (this, message)
        } catch (error) {
            this.reject (error)
        }
    }
}
