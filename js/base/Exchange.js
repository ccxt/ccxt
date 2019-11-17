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
        const client = this.clients[url]
    }

    async sendWsMessage (url, messageHash, subscribe = undefined) {
        const client = this.websocket (url)
        if (!client.deferred[messageHash]) {
            client.deferred[messageHash] = externallyResolvablePromise ()
        }
        await client.connected
        if (subscribe && !client.subscriptions[messageHash]) {
            client.subscriptions[messageHash] = true
            client.send (subscribe)
        }
        return client.deferred[messageHash]
    }

    handleWsMessage (client, message) {
        const messageHash = this.getWsMessageHash (client, message);
        const result = this.parseWsMessage (client, message, messageHash);
        if (client.deferred[messageHash]) {
            const promise = client.deferred[messageHash];
            promise.resolve (result);
            delete client.deferred[messageHash]
        }
        return result
    }
}
