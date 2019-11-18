"use strict";

const ccxt = require ('ccxt')
    , WebSocketClient = require ('./WebSocketClient')
    , {
        ExternallyResolvablePromise,
        externallyResolvablePromise
    } = require ('./MultiPromise')
    , {
        OrderBook
    } = require ('./OrderBook')
    , log = require ('ololog').unlimited

module.exports = class Exchange extends ccxt.Exchange {

    orderbook () {
        return new OrderBook ()
    }

    websocket (url) {
        this.clients = this.clients || {}
        if (!this.clients[url]) {
            const callback = this.handleWsMessage.bind (this)
            this.clients[url] = new WebSocketClient (url, callback)
        }
        return this.clients[url]
    }

    sendWsMessage (url, messageHash, message = undefined, subscribeHash = undefined) {
        const client = this.websocket (url)
        if (!client.futures[messageHash]) {
            client.futures[messageHash] = externallyResolvablePromise ()
        }
        if (message && !client.subscriptions[subscribeHash]) {
            client.subscriptions[subscribeHash] = true
            message = this.signWsMessage (client, messageHash, message)
            client.send (message)
        }
        return client.futures[messageHash]
    }

    resolveWsFuture (client, messageHash, result) {
        if (client.futures[messageHash]) {
            const promise = client.futures[messageHash]
            promise.resolve (result)
            delete client.futures[messageHash]
        }
        return result
    }
}
