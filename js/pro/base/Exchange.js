"use strict";

const BaseExchange = require ("../../base/Exchange")
    , throttle = require ("../../base/functions").throttle
    , WsClient = require ('./WsClient')
    , {
        OrderBook,
        IndexedOrderBook,
        CountedOrderBook,
    } = require ('./OrderBook')
    , functions = require ('./functions');

module.exports = class Exchange extends BaseExchange {
    constructor (options = {}) {
        super (options);
        this.newUpdates = options.newUpdates || true;
    }

    inflate (data) {
        return functions.inflate (data);
    }

    inflate64 (data) {
        return functions.inflate64 (data);
    }

    gunzip (data) {
        return functions.gunzip (data);
    }

    orderBook (snapshot = {}, depth = Number.MAX_SAFE_INTEGER) {
        return new OrderBook (snapshot, depth);
    }

    indexedOrderBook (snapshot = {}, depth = Number.MAX_SAFE_INTEGER) {
        return new IndexedOrderBook (snapshot, depth);
    }

    countedOrderBook (snapshot = {}, depth = Number.MAX_SAFE_INTEGER) {
        return new CountedOrderBook (snapshot, depth);
    }

    client (url) {
        this.clients = this.clients || {};
        if (!this.clients[url]) {
            const onMessage = this.handleMessage.bind (this);
            const onError = this.onError.bind (this);
            const onClose = this.onClose.bind (this);
            const onConnected = this.onConnected.bind (this);
            // decide client type here: ws / signalr / socketio
            const wsOptions = this.safeValue (this.options, 'ws', {});
            const options = this.extend (this.streaming, {
                'log': this.log ? this.log.bind (this) : this.log,
                'ping': this.ping ? this.ping.bind (this) : this.ping,
                'verbose': this.verbose,
                'throttle': throttle (this.tokenBucket),
            }, wsOptions);
            this.clients[url] = new WsClient (url, onMessage, onError, onClose, onConnected, options);
        }
        return this.clients[url];
    }

    spawn (method, ... args) {
        (method.apply (this, args)).catch ((e) => {
            // todo: handle spawned errors
        })
    }

    delay (timeout, method, ... args) {
        setTimeout (() => {
            this.spawn (method, ... args)
        }, timeout);
    }

    watch (url, messageHash, message = undefined, subscribeHash = undefined, subscription = undefined) {
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
        //             client.send (message)
        //         }
        //     }).catch ((error) => {})
        //     return future
        //
        // The following is a longer version of this method with comments
        //
        const client = this.client (url);
        // todo: calculate the backoff using the clients cache
        const backoffDelay = 0;
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
        const future = client.future (messageHash);
        // we intentionally do not use await here to avoid unhandled exceptions
        // the policy is to make sure that 100% of promises are resolved or rejected
        // either with a call to client.resolve or client.reject with
        //  a proper exception class instance
        const connected = client.connect (backoffDelay);
        // the following is executed only if the catch-clause does not
        // catch any connection-level exceptions from the client
        // (connection established successfully)
        connected.then (() => {
            if (!client.subscriptions[subscribeHash]) {
                client.subscriptions[subscribeHash] = subscription || true;
                const options = this.safeValue (this.options, 'ws');
                const cost = this.safeValue (options, 'cost', 1);
                if (message) {
                    if (this.enableRateLimit && client.throttle) {
                        // add cost here |
                        //               |
                        //               V
                        client.throttle (cost).then (() => {
                            client.send (message);
                        }).catch ((e) => { throw e });
                    } else {
                        client.send (message);
                    }
                }
            }
        })
        return future;
    }

    onConnected (client, message = undefined) {
        // for user hooks
        // console.log ('Connected to', client.url)
    }

    onError (client, error) {
        if ((client.url in this.clients) && (this.clients[client.url].error)) {
            delete this.clients[client.url];
        }
    }

    onClose (client, error) {
        if (client.error) {
            // connection closed due to an error, do nothing
        } else {
            // server disconnected a working connection
            if (this.clients[client.url]) {
                delete this.clients[client.url];
            }
        }
    }

    async close () {
        const clients = Object.values (this.clients || {});
        for (let i = 0; i < clients.length; i++) {
            const client = clients[i];
            delete this.clients[client.url];
            await client.close ();
        }
    }

    findTimeframe (timeframe, timeframes = undefined) {
        timeframes = timeframes || this.timeframes;
        const keys = Object.keys (timeframes);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (timeframes[key] === timeframe) {
                return key;
            }
        }
        return undefined;
    }

    formatScientificNotationFTX (n) {
        if (n === 0) {
            return '0e-00';
        }
        return n.toExponential ().replace ('e-', 'e-0');
    }
};
