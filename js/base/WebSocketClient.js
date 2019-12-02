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
            protocols: undefined, // ws protocols
            options: undefined,   // ws options
            futures: {},
            subscriptions: {},
            // connected: Future (), // connection-related Future
            connectionTimer: undefined, // connection-related setTimeout
            connectionTimeout: 30000, // 30 seconds by default, false to disable
            pingInterval: undefined, // ping-related interval
            pingTimeout: 3000,
            // timeout is not used atm
            // timeout: 30000, // throw if a request is not satisfied in 30 seconds, false to disable
            ws: {
                readyState: undefined,
            },
        }

        Object.assign (this, deepExtend (defaults, config))
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
        this.ws = new WebSocket (this.url, this.protocols, this.options)
        this.setConnectionTimeout ()
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
        if (this.readyState !== WebSocket.OPEN) {
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
        if (this.pingTimeout) {
            const onPingInterval = this.onPingInterval.bind (this)
            this.pingInterval = setInterval (onPingInterval, this.pingTimeout)
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
        error = new NetworkError (error.message)
        this.error = error
        this.reset (error)
        this.onErrorCallback (this, error)
    }

    onClose (message) {
        console.log (new Date (), 'onClose', message)
        this.reset (new NetworkError (message))
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

/*

'use strict'

// @author frosty00
// @email carlo.revelli@berkeley.edu

const isNode = (typeof window === 'undefined')
const WebSocket = isNode ? require ('ws') : window.WebSocket
const Future = require ('./Future')
const { RequestTimeout } = require ('ccxt/js/base/errors')

class WebSocketClient {
    constructor (url, handler, timeout = 5000) {
        this.url = url
        this.handler = handler
        this.connection = null
        this.connectedFuture = new Future ()
        this.closedFuture = new Future ()
        this.timedoutFuture = new Future ()
        this.timeout = timeout
        this.lastPong = Number.MAX_SAFE_INTEGER
        this.futures = {}
        this.subscriptions = {}
    }

    async checkTimeout () {
        // ping every second
        const pinger = setInterval (() => {
            this.connection.ping ()
            if (new Date ().getTime () - this.lastPong > this.timeout) {
                this.timedoutFuture.resolve ()
            }
        }, 1000)
        await this.timedoutFuture.promise ()
        clearInterval (pinger)
        for (let messageKey of Object.keys (this.futures)) {
            let error = new RequestTimeout ('Websocket did not recieve a pong in reply to a ping within ' + this.timeout + ' seconds');
            this.futures[messageKey].reject (error)
        }
        this.futures = {}
    }

    async connect () {
        if (!this.isConnected ()) {
            this.connection = new WebSocket (this.url)
            this.connection.on ('open', () => {
                this.checkTimeout ()
                this.connectedFuture.resolve ()
            })
            this.connection.on ('message', this.onMessage.bind (this))
            this.connection.on ('close', this.closedFuture.resolve)
            this.connection.on ('pong', () => {
                this.lastPong = new Date ().getTime ()
            })
            return this.connectedFuture.promise ()
        }
    }

    isConnected () {
        return this.connection !== null && this.connection.readyState === WebSocket.OPEN
    }

    onMessage (message) {
        try {
            this.handler (this, JSON.parse (message))
        } catch (e) {
            console.log (message)
            // encoding error (need to figure out how to handle)
        }
    }

    async send (data) {
        await this.connect ()
        this.connection.send (JSON.stringify (data))
    }

    async close () {
        if (this.connection === null) {
            return;
        }
        this.connection.close ()
        await this.closedFuture.promise ()
        this.connection = null
    }

    static async registerFuture (url, messageHash, entry, apiKey, subscribe = undefined) {
        const index = url + (apiKey ? apiKey : '')
        const client = WebSocketClient.clients[index] || (WebSocketClient.clients[index] = new WebSocketClient (url, entry))
        const future = client.futures[messageHash] || (client.futures[messageHash] = new Future ())
        if (subscribe === undefined) {
            await client.connect ()
        } else if (!client.subscriptions[messageHash]) {
            client.send (subscribe)
            client.subscriptions[messageHash] = true
        }
        const result = await future.promise ()
        delete client.futures[messageHash]
        return result
    }
}

WebSocketClient.clients = {}
module.exports = WebSocketClient

*/
