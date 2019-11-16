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

    async sendWsMessage (handler, url, messageHash, subscribe = undefined) {
        if (!this.clients) {
            this.clients = {}
        }
        if (!this.clients[url]) {
            this.clients[url] = new WebSocketClient (url, this.handleWsMessage.bind (this))
        }
        const client = this.clients[url]
        if (!client.deferred[messageHash]) {
            client.deferred[messageHash] = externallyResolvablePromise ()
        }
        const promise = client.deferred[messageHash]
        if (!subscribe) {
            await client.connected
        } else if (!client.subscriptions[messageHash]) {
            client.subscriptions[messageHash] = true
            client.send (subscribe)
        }
        const response = await promise
        return handler.apply (this, [ response ])
    }

    // handleWsDropped (client, response, messageHash) {}

    handleWsMessage3 (client, message) {
        const messageHash = this.getWsMessageHash (client, message);
        if (client.deferred[messageHash]) {
            const promise = client.deferred[messageHash];
            promise.resolve (message);
            delete client.deferred[messageHash]
        } else {
            console.log (message)
            this.handleWsDropped (client, message, messageHash);
        }
    }

    handleWsMessage2 (client, message) {
        const messageHash = this.getWsMessageHash (client, message);
        const response = this.parseWsMessage (client, message, messageHash);
        if (client.deferred[messageHash]) {
            const promise = client.deferred[messageHash];
            promise.resolve (response);
            delete client.deferred[messageHash]
        }
    }

    defineWsApi (has) {
        const methods = Object.keys (has).filter (key => key.includes ('Ws'))
            .map (key => key.slice (key.indexOf ('Ws')))

        const _this = this
        for (let i = 0; i < methods.length; i++) {
            const method = methods[i]
            this[method + 'Message'] = async (url, messageHash, subscribe = undefined) => {
                const result = await this.registerFuture (url, messageHash, _this.handleWsMessage.bind (_this), _this.apiKey, subscribe)
                return _this['handle' + method] (result)
            }
        }
    }

    async registerFuture (url, messageHash, callback, apiKey, subscribe = undefined) {
        const index = url + (apiKey ? apiKey : '')
        console.log (index)
        process.exit ()
        const client = this.clients[index] || (WebSocketClient.clients[index] = new WebSocketClient (url, callback))
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
