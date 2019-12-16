"use strict";

const ccxt = require ('ccxt')
    , WebSocketClient = require ('./WebSocketClient')
    , {
        OrderBook,
        LimitedOrderBook,
        IndexedOrderBook,
        LimitedIndexedOrderBook,
        LimitedCountedOrderBook,
        CountedOrderBook,
    } = require ('./OrderBook')

module.exports = class Exchange extends ccxt.Exchange {

    orderbook (snapshot = {}) {
        return new OrderBook (snapshot)
    }

    limitedOrderBook (snapshot = {}, depth = undefined) {
        return new LimitedOrderBook (snapshot, depth)
    }

    indexedOrderBook (snapshot = {}) {
        return new IndexedOrderBook (snapshot)
    }

    limitedIndexedOrderBook (snapshot = {}, depth = undefined) {
        return new LimitedIndexedOrderBook (snapshot, depth)
    }

    limitedCountedOrderBook (snapshot = {}, depth = undefined) {
        return new LimitedCountedOrderBook (snapshot, depth)
    }

    countedOrderBook (snapshot = {}) {
        return new CountedOrderBook (snapshot)
    }

    client (url) {
        this.clients = this.clients || {}
        if (!this.clients[url]) {
            const onMessage = this.handleMessage.bind (this)
            const onError = this.onError.bind (this)
            const onClose = this.onClose.bind (this)
            // decide client type here: ws / signalr / socketio
            this.clients[url] = new WebSocketClient (url, onMessage, onError, onClose)
        }
        return this.clients[url]
    }

    async after (future, method, ... args) {
        const result = await future
        return method.apply (this, [ result, ... args ])
    }

    watch (url, messageHash, message = undefined, subscribeHash = undefined) {
        //
        // Without comments the code of this method is short and easy:
        //
        //     const client = this.client (url)
        //     const backoffDelay = 0
        //     const future = client.future (messageHash)
        //     const connected = client.connect (backoffDelay)
        //     connected.then (() => {
        //         if (message && !client.subscriptions[subscribeHash]) {
        //             client.subscriptions[subscribeHash] = true
        //             message = this.signWsMessage (client, messageHash, message)
        //             client.send (message)
        //         }
        //     }).catch ((error) => {})
        //     return future
        //
        // The following is a longer version of this method with comments
        //
        const client = this.client (url)
        // todo: calculate the backoff using the clients cache
        const backoffDelay = 0
        //
        //  watchOrderBook ---- future ----+---------------+----→ user
        //                                 |               |
        //                                 ↓               ↑
        //                                 |               |
        //                              connect ......→ resolve
        //                                 |               |
        //                                 ↓               ↑
        //                                 |               |
        //                             subscribe -----→ receive
        //
        const future = client.future (messageHash)
        // we intentionally do not use await here to avoid unhandled exceptions
        // the policy is to make sure that 100% of promises are resolved or rejected
        // either with a call to client.resolve or client.reject with
        //  a proper exception class instance
        const connected = client.connect (backoffDelay)
        // the following is executed only if the catch-clause does not
        // catch any connection-level exceptions from the websocket client
        // (connection established successfully)
        connected.then (() => {
            if (message && !client.subscriptions[subscribeHash]) {
                client.subscriptions[subscribeHash] = true
                // todo: decouple signing from subscriptions
                message = this.signWsMessage (client, messageHash, message)
                client.send (message)
            }
        }).catch ((error) => {
            // we do nothing and don't return a resolvable value from here
            // we leave it in a rejected state to avoid triggering the
            // then-clauses that will follow (if any)
            // removing this catch will raise UnhandledPromiseRejection in JS
            // upon connection failure
        })
        return future
    }

    onError (client, error) {
        if (this.clients[client.url].error) {
            delete this.clients[client.url]
        }
    }

    onClose (client, error) {
        if (client.error) {
            // connection closed due to an error, do nothing
        } else {
            // server disconnected a working connection
            if (this.clients[client.url]) {
                delete this.clients[client.url]
            }
        }
    }

    async close () {
        const clients = Object.values (this.clients || {})
        for (let i = 0; i < clients.length; i++) {
            const client = clients[i]
            await client.close ()
            delete this.clients[client.url]
        }
    }
}
