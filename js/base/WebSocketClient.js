'use strict'

// @author frosty00
// @email carlo.revelli@berkeley.edu

const isNode = (typeof window === 'undefined')
const WebSocket = isNode ? require ('ws') : window.WebSocket
const Future = require ('./Future')
const ccxt = require ('./../../ccxt')

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

    async checkTimeout() {
        // ping every second
        let pinger = setInterval (() => {
            this.connection.ping ()
            if (new Date ().getTime () - this.lastPong > this.timeout) {
                this.timedoutFuture.resolve ()
            }
        }, 1000)
        await this.timedoutFuture.promise ()
        clearInterval (pinger)
        for (let messageKey of Object.keys (this.futures)) {
            let error = new ccxt.RequestTimeout ('Websocket did not recieve a pong in reply to a ping within ' + this.timeout + ' seconds');
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
            this.connection.on ('pong', () => {this.lastPong = new Date ().getTime ()})
            return this.connectedFuture.promise ()
        }
    }

    isConnected() {
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
        let index = url + (apiKey ? apiKey : '')
        let client = WebSocketClient.clients[index] || (WebSocketClient.clients[index] = new WebSocketClient (url, entry))
        let future = client.futures[messageHash] || (client.futures[messageHash] = new Future ())
        if (subscribe === undefined) {
            await client.connect ()
        } else if (!client.subscriptions[messageHash]) {
            client.send (subscribe)
            client.subscriptions[messageHash] = true
        }
        let result = await future.promise ()
        delete client.futures[messageHash]
        return result
    }
}

WebSocketClient.clients = {}
module.exports = WebSocketClient
