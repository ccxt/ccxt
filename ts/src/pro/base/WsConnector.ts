import { throttle, safeValue, extend } from '../../base/functions.js';
import WsClient from './WsClient.js';
import { OrderBook, IndexedOrderBook, CountedOrderBook } from './OrderBook.js';
import { inflate64, inflate, gunzip } from './functions.js';;

export default class WsConnector  {
    
    newUpdates = true
    options = {}
    log = undefined
    ping = undefined
    verbose = undefined
    clients = {}
    // timeframes = undefined
    tokenBucket = undefined
    handleMessage = undefined
    streaming = undefined
    getVerboseMode = undefined
    getTokenBucket = undefined
    getKeepAlive = undefined
    getInflate = undefined
    getGunzip = undefined
    getEnableRateLimit = undefined

    constructor (options = {}) {
        this.newUpdates = (options as any).newUpdates || true;
        this.log = (options as any).log || this.log;
        this.getVerboseMode = (options as any).getVerboseMode;
        this.handleMessage = (options as any).handleMessage || this.handleMessage;
        this.newUpdates = true;
        this.options = {};
        this.log = (options as any).log;
        // this.streaming = (options as any).streaming; 
        this.ping = (options as any).ping;
        this.getTokenBucket = (options as any).getTokenBucket;
        this.getKeepAlive = (options as any).getKeepAlive;
        this.getInflate = (options as any).getInflate;
        this.getGunzip = (options as any).getGunzip;
        this.getEnableRateLimit = (options as any).getEnableRateLimit; 
        this.clients = {};
    }

    inflate (data) {
        return inflate (data);
    }

    inflate64 (data) {
        return inflate64 (data);
    }

    gunzip (data) {
        return gunzip (data);
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
    
    client (url: string) {
        this.clients = this.clients || {};
        if (!this.clients[url]) {
            const onMessage = (this as any).handleMessage;
            const onError = this.onError.bind (this);
            const onClose = this.onClose.bind (this);
            const onConnected = this.onConnected.bind (this);
            // decide client type here: ws / signalr / socketio
            // const wsOptions = safeValue (this.options, 'ws', {});

            const options = {
                'ping': this.ping,
                'getVerboseMode': this.getVerboseMode,
                'throttle': throttle(this.getTokenBucket()),
                'log': this.log,
                'getKeepAlive': this.getKeepAlive,
                'getInflate': this.getInflate,
                'getGunzip': this.getGunzip,
                'getEnableRateLimit': this.getEnableRateLimit,
            }

            this.clients[url] = new WsClient (url, onMessage, onError, onClose, onConnected, options);
        }
        return this.clients[url];
    }

    watch (url: string, messageHash: string, message = undefined, subscribeHash = undefined, subscription = undefined) {
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
                const options = safeValue (this.options, 'ws');
                const cost = safeValue (options, 'cost', 1);
                if (message) {
                    if (this.getEnableRateLimit() && client.throttle) {
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
            delete this.clients[(client as any).url];
            await (client as any).close ();
        }
    }

    formatScientificNotationFTX (n) {
        if (n === 0) {
            return '0e-00';
        }
        return n.toExponential ().replace ('e-', 'e-0');
    }
};

export {
    WsConnector,
};
