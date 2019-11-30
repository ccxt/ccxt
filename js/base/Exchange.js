"use strict";

const ccxt = require ('ccxt')
    , WebSocketClient = require ('./WebSocketClient')
    , {
        ExternallyResolvablePromise,
        externallyResolvablePromise
    } = require ('./MultiPromise')
    , {
        OrderBook,
        LimitedOrderBook,
        IndexedOrderBook,
        LimitedIndexedOrderBook,
        LimitedCountedOrderBook,
        CountedOrderBook,
    } = require ('./OrderBook')
    , log = require ('ololog').unlimited

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
        //
        //  fetchWsOrderBook -----+------------→ future -----------+-----→ user
        //                        ↓                                ↑
        //                      connect → subscribe → receive → resolve
        //
        const future = client.createFuture (messageHash)
        // if (!client.futures[messageHash]) {
        //     client.futures[messageHash] = externallyResolvablePromise ()
        // }
        // we intentionally do not use await here to avoid unhandled exceptions
        // the policy is to make sure that 100% of promises are resolved or rejected
        // either with a call to client.resolve or client.reject
        client.connect ()
            // // if the connection promise is rejected the following catch-clause
            // // will catch the exception and the subsequent then-clause will not
            // // be executed at all (connection failed)
            // .catch ((error) => {
            //     this.rejectWsFutures (client, error)
            //     // we do not return a resolvable value from here
            //     // to avoid triggering the following then-clause
            // })
            // the following is executed only if the catch-clause does not
            // catch any connection-level exceptions from the websocket client
            // (connection succeeded)
            .then (() => {
                if (message && !client.subscriptions[subscribeHash]) {
                    client.subscriptions[subscribeHash] = true
                    message = this.signWsMessage (client, messageHash, message)
                    client.send (message)
                }
            })
        // return client.futures[messageHash]
        return future
    }

    resolveWsFuture (client, messageHash, result) {
        if (client.futures[messageHash]) {
            const promise = client.futures[messageHash]
            promise.resolve (result)
            delete client.futures[messageHash]
        }
        return result
    }

    rejectWsFutures (client, result) {
        const keys = Object.keys (client.futures)
        for (let i = 0; i < keys.length; i++) {
            this.rejectWsFuture (client, keys[i], result)
        }
        return result
    }

    rejectWsFuture (client, messageHash, result) {
        if (client.futures[messageHash]) {
            const promise = client.futures[messageHash]
            promise.reject (result)
            delete client.futures[messageHash]
        }
        return result
    }

    async close () {
        const clients = Object.values (this.clients)
        for (let i = 0; i < clients.length; i++) {
            const client = clients[i]
            await client.close ()
        }
    }
}
