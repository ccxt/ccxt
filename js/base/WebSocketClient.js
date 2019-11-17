'use strict';

const ccxt = require ('ccxt')
    , {
        sleep,
        isNode,
        isJsonEncodedObject,
        RequestTimeout,
        deepExtend
    } = ccxt
    , {
        ExternallyResolvablePromise,
        externallyResolvablePromise
    } = require ('./MultiPromise')
    // , Future = require ('./Future')
    , WebSocket = isNode ? require ('ws') : window.WebSocket

module.exports = class WebSocketClient {

    constructor (url, callback, config = {}) {
        const defaults = {
            url,
            callback,             // onMessage callback
            protocols: undefined, // ws protocols
            options: undefined,   // ws options
            reconnect: false,
            reconnectDelay: 1000, // not used atm
            timers: {},
            futures: {},
            subscriptions: {},
            timeouts: {
                // delay should be equal to the interval at which your
                // server sends out pings plus a conservative assumption
                // of the latency
                // ping: 5000 + 1000,
                ping: false,
                heartbeat: 1500,
            }
            // pingTimeout: 30000 + 1000,
            // enabledTimeouts: {
            //     ping: true,
            //     heartbeat: true,
            // },
        }
        Object.assign (this, deepExtend (defaults, config))
        this.connect ()
    }

    // handle auto-reconnection after a period of inactivity
    // whatever the reason to close the connection - reopen it if needed

    clearTimeout (id, event) {
        if (this.timers[id]) {
            clearTimeout (this.timers[id])
        }
        this.timers[id] = undefined
        return this.timers[id]
    }

    setTimeout (id, event) {
        if (this.timeouts[id]) {
            this.timers[id] = setTimeout (() => {
                console.log (new Date (), id, 'timer from', event, 'event will terminate')
                // Use `WebSocket#terminate()`, which immediately destroys the connection,
                // instead of `WebSocket#close()`, which waits for the close timer.
                this.ws.terminate ()
            }, this.timeouts[id])
        }
        return this.timers[id]
    }

    resetTimeout (id, event) {
        this.clearTimeout (id, event)
        this.setTimeout (id, event)
    }

    isConnected () {
        return this.ws.readyState === WebSocket.OPEN
    }

    isConnecting () {
        return this.ws.readyState === WebSocket.CONNECTING
    }

    connect () {
        if (!this.ws || !(this.isConnecting () || this.isConnected ())) {
            console.log (new Date (), 'connecting...')
            this.connected = externallyResolvablePromise ()
            this.ws = new WebSocket (this.url, this.protocols, this.options)
            this.ws
                .on ('open', this.onOpen.bind (this))
                .on ('ping', this.onPing.bind (this))
                .on ('pong', this.onPong.bind (this))
                .on ('error', this.onError.bind (this))
                .on ('close', this.onClose.bind (this))
                .on ('upgrade', this.onUpgrade.bind (this))
                .on ('message', this.onMessage.bind (this))
        }
        return this.connected
    }

    async send (message) {
        await this.connected
        this.ws.send (JSON.stringify (message))
    }

    ping () {
        this.ws.ping ()
    }

    close () {
        this.reconnect = false
        this.ws.terminate ()
    }

    onOpen () {
        console.log (new Date (), 'open')
        this.connected.resolve (this.url)
        // this.setTimeout ('ping', 'open')
        // this.send (JSON.stringify ({
        //     'command': 'subscribe',
        //     'channel': '175',
        // }))
    }

    onPing () {
        console.log (new Date (), 'ping')
        this.resetTimeout ('ping', 'ping')
    }

    onPong () {
        console.log (new Date (), 'pong')
        this.resetTimeout ('ping', 'pong')
    }

    onError (error) {
        console.log (new Date (), 'error')
        // TODO: convert ws errors to ccxt errors
        this.connected.reject (new ccxt.NetworkError (error))
    }

    onClose () {
        // whatever the reason to close the connection - reopen it if needed
        console.log (new Date (), 'close')
        this.clearTimeout ('ping', 'close')
        if (this.reconnect) {
            console.log (new Date (), 'reconnecting...')
            this.connect ()
        }
    }

    onUpgrade (message) {
        console.log (new Date (), 'upgrade')
    }

    onMessage (message) {
        try {
            message = isJsonEncodedObject (message) ? JSON.parse (message) : message
        } catch (e) {
            // throw json encoding error
        }
        this.callback (this, message)
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
