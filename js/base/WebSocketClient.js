'use strict';

const ccxt = require ('ccxt')
    , {
        sleep,
        isNode,
        isJsonEncodedObject,
        RequestTimeout,
        NetworkError,
        deepExtend,
        milliseconds,
    } = ccxt
    , Future = require ('./Future')
    , WebSocket = isNode ? require ('ws') : window.WebSocket

module.exports = class WebSocketClient {

    constructor (url, onMessageCallback, onErrorCallback, onCloseCallback, config = {}) {

        const defaults = {
            url,
            onMessageCallback,
            onErrorCallback,
            onCloseCallback,
            protocols: undefined, // ws-specific protocols
            options: undefined, // ws-sepcific options
            futures: {},
            subscriptions: {},
            error: undefined, // stores low-level networking exception, if any
            connectionStarted: undefined, // initiation timestamp in milliseconds
            connectionEstablished: undefined, // success timestamp in milliseconds
            connectionTimer: undefined, // connection-related setTimeout
            connectionTimeout: 30000, // 30 seconds by default, false to disable
            pingInterval: undefined, // stores the ping-related interval
            keepAlive: 3000, // ping-pong keep-alive frequency
            // timeout is not used atm
            // timeout: 30000, // throw if a request is not satisfied in 30 seconds, false to disable
            ws: {
                readyState: undefined,
            },
        }

        Object.assign (this, deepExtend (defaults, config))
        // connection-related Future
        this.connected = Future ()
    }

    future (messageHash) {
        if (!this.futures[messageHash]) {
            this.futures[messageHash] = Future ()
        }
        return this.futures[messageHash]
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
    }

    createWebsocket () {
        console.log (new Date (), 'connecting...')
        this.connectionStarted = milliseconds ()
        this.setConnectionTimeout ()
        this.ws = new WebSocket (this.url, this.protocols, this.options)
        this.ws
            .on ('open', this.onOpen.bind (this))
            .on ('ping', this.onPing.bind (this))
            .on ('pong', this.onPong.bind (this))
            .on ('error', this.onError.bind (this))
            .on ('close', this.onClose.bind (this))
            .on ('upgrade', this.onUpgrade.bind (this))
            .on ('message', this.onMessage.bind (this))
        // this.ws.terminate () // debugging
        // this.ws.close () // debugging
    }

    connect (backoffDelay = 0) {
        if ((this.ws.readyState !== WebSocket.OPEN) &&
            (this.ws.readyState !== WebSocket.CONNECTING)) {
            // prevent multiple calls overwriting each other
            this.ws.readyState = WebSocket.CONNECTING
            // exponential backoff for consequent ws connections if necessary
            if (backoffDelay) {
                sleep (backoffDelay).then (this.createWebsocket.bind (this))
            } else {
                this.createWebsocket ()
            }
        }
        return this.connected
    }

    reset (error) {
        this.clearConnectionTimeout ()
        this.clearPingInterval ()
        this.connected.reject (error)
        this.reject (error)
    }

    onConnectionTimeout () {
        if (this.ws.readyState !== WebSocket.OPEN) {
            const error = new RequestTimeout ('Connection to ' + this.url + ' failed due to a timeout')
            this.reset (error)
            this.onErrorCallback (this, error)
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
        if ((this.lastPong + this.pingRate) < milliseconds ()) {
            this.reset (new RequestTimeout ('Connection to ' + this.url + ' timed out'))
        } else {
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.ping ()
            }
        }
    }

    onOpen () {
        console.log (new Date (), 'onOpen')
        this.connectionEstablished = milliseconds ()
        this.connected.resolve (this.url)
        // this.ws.terminate () // debugging
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
        this.error = new NetworkError (error.message)
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
        this.ws.send (JSON.stringify (message))
    }

    close () {
        this.reconnect = false
        this.ws.close ()
    }

    onMessage (message) {
        try {
            message = isJsonEncodedObject (message) ? JSON.parse (message) : message
        } catch (e) {
            // reset with a json encoding error ?
        }
        this.onMessageCallback (this, message)
    }
}
