'use strict';

const ccxt = require ('ccxt')
    , {
        isNode,
        isBrowser,
        isJsonEncodedObject,
        RequestTimeout,
        NetworkError,
        NotSupported,
        deepExtend,
        milliseconds,
    } = ccxt
    , Future = require ('./Future')

module.exports = class Client {

    constructor (url, onMessageCallback, onErrorCallback, onCloseCallback, config = {}) {
        const defaults = {
            url,
            onMessageCallback,
            onErrorCallback,
            onCloseCallback,
            protocols: undefined, // ws-specific protocols
            options: undefined, // ws-specific options
            futures: {},
            subscriptions: {},
            connected: undefined, // connection-related Future
            error: undefined, // stores low-level networking exception, if any
            connectionStarted: undefined, // initiation timestamp in milliseconds
            connectionEstablished: undefined, // success timestamp in milliseconds
            connectionTimer: undefined, // connection-related setTimeout
            connectionTimeout: 10000, // in milliseconds, false to disable
            pingInterval: undefined, // stores the ping-related interval
            ping: undefined, // ping-function (if defined)
            keepAlive: 30000, // ping-pong keep-alive rate in milliseconds
            maxPingPongMisses: 2.0, // how many missing pongs to throw a RequestTimeout
            // timeout is not used atm
            // timeout: 30000, // throw if a request is not satisfied in 30 seconds, false to disable
            connection: {
                readyState: undefined,
            },
        }
        Object.assign (this, deepExtend (defaults, config))
        // connection-related Future
        this.connected = Future ()
    }

    future (messageHash) {
        if (Array.isArray (messageHash)) {
            const firstHash = messageHash[0]
            if (!this.futures[firstHash]) {
                const future = Future ()
                this.futures[firstHash] = future
                for (let i = 1; i < messageHash.length; i++) {
                    const hash = messageHash[i]
                    this.futures[hash] = future
                }
            }
            return this.futures[firstHash]
        } else {
            if (!this.futures[messageHash]) {
                this.futures[messageHash] = Future ()
            }
            return this.futures[messageHash]
        }
    }

    resolve (result, messageHash = undefined) {
        if (messageHash) {
            if (this.futures[messageHash]) {
                const promise = this.futures[messageHash]
                promise.resolve (result)
                delete this.futures[messageHash]
            }
        } else {
            const messageHashes = Object.keys (this.futures)
            for (let i = 0; i < messageHashes.length; i++) {
                this.resolve (result, messageHashes[i])
            }
        }
        return result
    }

    reject (result, messageHash = undefined) {
        if (messageHash) {
            if (this.futures[messageHash]) {
                const promise = this.futures[messageHash]
                promise.reject (result)
                delete this.futures[messageHash]
            }
        } else {
            const messageHashes = Object.keys (this.futures)
            for (let i = 0; i < messageHashes.length; i++) {
                this.reject (result, messageHashes[i])
            }
        }
        return result
    }

    connect (backoffDelay = 0) {
        throw new NotSupported ('connect() not implemented yet');
    }

    isOpen () {
        throw new NotSupported ('isOpen() not implemented yet');
    }

    reset (error) {
        this.clearConnectionTimeout ()
        this.clearPingInterval ()
        this.connected.reject (error)
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
        if (this.keepAlive && this.isOpen ()) {
            const now = milliseconds ()
            this.lastPong = this.lastPoing || now
            if ((this.lastPong + this.keepAlive * this.maxPingPongMisses) < now) {
                this.onError (new RequestTimeout ('Connection to ' + this.url + ' timed out due to a ping-pong keepalive missing on time'))
            } else {
                if (this.ping) {
                    this.send (this.ping (this))
                } else if (isNode) {
                    this.connection.ping ()  // can't do this inside browser
                }
            }
        }
    }

    onOpen () {
        console.log (new Date (), 'onOpen')
        this.connectionEstablished = milliseconds ()
        this.connected.resolve (this.url)
        // this.connection.terminate () // debugging
        this.clearConnectionTimeout ()
        this.setPingInterval ()
    }

    // this method is not used at this time, because in JS the ws client will
    // respond to pings coming from the server with pongs automatically
    // however, some devs may want to track connection states in their app
    onPing () {
        console.log (new Date (), 'onPing')
    }

    onPong () {
        this.lastPong = milliseconds ()
        console.log (new Date (), 'onPong')
    }

    onError (error) {
        console.log (new Date (), 'onError', error.message)
        // convert ws errors to ccxt errors if necessary
        // this.error = new NetworkError (error.message)
        this.error = error
        this.reset (this.error)
        this.onErrorCallback (this, this.error)
    }

    onClose (message) {
        console.log (new Date (), 'onClose', message)
        if (!this.error) {
            // todo: exception types for server-side disconnects
            this.reset (new NetworkError (message))
        }
        this.onCloseCallback (this, message)
    }

    // this method is not used at this time
    // but may be used to read protocol-level data like cookies, headers, etc
    onUpgrade (message) {
        console.log (new Date (), 'onUpgrade')
    }

    send (message) {
        console.log (new Date (), 'sending', message)
        this.connection.send (JSON.stringify (message))
    }

    close () {
        this.reconnect = false
        this.connection.close ()
    }

    onMessage (message) {
        try {
            if (isBrowser) {
                // browser sends MessageEvent objects
                //
                // MessageEvent {isTrusted: true, data: "{"e":"depthUpdate","E":1581358737706,"s":"ETHBTC",…"0.06200000"]],"a":[["0.02261300","0.00000000"]]}", origin: "wss://stream.binance.com:9443", lastEventId: "", source: null, …}
                message = message.data
            }
            message = isJsonEncodedObject (message) ? JSON.parse (message) : message
            // console.log (new Date (), 'onMessage', message)
        } catch (e) {
            console.log (new Date (), 'onMessage JSON.parse', e)
            // reset with a json encoding error ?
        }
        if (this.onMessageCallback.constructor.name === "AsyncFunction") {
            this.onMessageCallback (this, message).catch ((e) => {
                // todo: handle async onMessageCallback errors
            })
        } else {
            this.onMessageCallback (this, message)
        }
    }
}
