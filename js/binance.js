'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { NotSupported, ExchangeError } = require ('ccxt/js/base/errors');

//  ---------------------------------------------------------------------------

module.exports = class binance extends ccxt.binance {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'watchOrderBook': true,
                'watchOHLCV': true,
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://stream.binance.com:9443/ws',
                    // 'ws': 'wss://echo.websocket.org/',
                    // 'ws': 'ws://127.0.0.1:8080',
                },
            },
            'options': {
                // 'marketsByLowercaseId': {},
                'subscriptions': {},
                'messages': {},
                'watchOrderBookRate': 100, // get updated every 100ms or undefined (1000ms)
            },
        });
    }

    async loadMarkets (reload = false, params = {}) {
        const markets = await super.loadMarkets (reload, params);
        let marketsByLowercaseId = this.safeValue (this.options, 'marketsByLowercaseId');
        if ((marketsByLowercaseId === undefined) || reload) {
            marketsByLowercaseId = {};
            for (let i = 0; i < this.symbols.length; i++) {
                const symbol = this.symbols[i];
                const market = this.markets[symbol];
                const lowercaseId = this.safeStringLower (market, 'id');
                market['lowercaseId'] = lowercaseId;
                this.markets_by_id[market['id']] = market;
                this.markets[symbol] = market;
                marketsByLowercaseId[lowercaseId] = this.markets[symbol];
            }
            this.options['marketsByLowercaseId'] = marketsByLowercaseId;
        }
        return markets;
    }

    async watchTrades (symbol) {
        //     await this.loadMarkets ();
        //     const market = this.market (symbol);
        //     const url = this.urls['api']['ws'] + market['id'].toLowerCase () + '@trade';
        //     return await this.WsTradesMessage (url, url);
        throw new NotSupported (this.id + ' watchTrades not implemented yet');
    }

    handleTrades (response) {
        //     const parsed = this.parseTrade (response);
        //     parsed['symbol'] = this.parseSymbol (response);
        //     return parsed;
        throw new NotSupported (this.id + ' handleTrades not implemented yet');
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        //     await this.loadMarkets ();
        //     const interval = this.timeframes[timeframe];
        //     const market = this.market (symbol);
        //     const url = this.urls['api']['ws'] + market['id'].toLowerCase () + '@kline_' + interval;
        //     return await this.WsOHLCVMessage (url, url);
        throw new NotSupported (this.id + ' watchOHLCV not implemented yet');
    }

    handleOHLCV (ohlcv) {
        //     const data = ohlcv['k'];
        //     const timestamp = this.safeInteger (data, 'T');
        //     const open = this.safeFloat (data, 'o');
        //     const high = this.safeFloat (data, 'h');
        //     const close = this.safeFloat (data, 'l');
        //     const low = this.safeFloat (data, 'c');
        //     const volume = this.safeFloat (data, 'v');
        //     return [timestamp, open, high, close, low, volume];
        throw new NotSupported (this.id + ' handleOHLCV not implemented yet ' + this.json (ohlcv));
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        //
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/web-socket-streams.md#partial-book-depth-streams
        //
        // <symbol>@depth<levels>@100ms or <symbol>@depth<levels> (1000ms)
        // valid <levels> are 5, 10, or 20
        //
        if (limit !== undefined) {
            if ((limit !== 5) && (limit !== 10) && (limit !== 20)) {
                throw new ExchangeError (this.id + ' watchOrderBook limit argument must be undefined, 5, 10 or 20');
            }
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        //
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/web-socket-streams.md#how-to-manage-a-local-order-book-correctly
        //
        // 1. Open a stream to wss://stream.binance.com:9443/ws/bnbbtc@depth.
        // 2. Buffer the events you receive from the stream.
        // 3. Get a depth snapshot from https://www.binance.com/api/v1/depth?symbol=BNBBTC&limit=1000 .
        // 4. Drop any event where u is <= lastUpdateId in the snapshot.
        // 5. The first processed event should have U <= lastUpdateId+1 AND u >= lastUpdateId+1.
        // 6. While listening to the stream, each new event's U should be equal to the previous event's u+1.
        // 7. The data in each event is the absolute quantity for a price level.
        // 8. If the quantity is 0, remove the price level.
        // 9. Receiving an event that removes a price level that is not in your local order book can happen and is normal.
        //
        const name = 'depth';
        const messageHash = market['lowercaseId'] + '@' + name;
        const url = this.urls['api']['ws']; // + '/' + messageHash;
        let requestId = this.nonce ();
        const request = {
            'method': 'SUBSCRIBE',
            'params': [
                messageHash + '@' + this.safeString (this.options, 'watchOrderBookRate', 100) + 'ms',
            ],
            'id': requestId,
        };
        requestId = requestId.toString ();
        const subscription = {
            'requestId': requestId,
            'messageHash': messageHash,
            'name': name,
            'symbol': symbol,
            'method': this.handleOrderBookSubscription,
        };
        const message = this.extend (request, params);
        const future = this.watch (url, messageHash, message, messageHash, subscription);
        return await this.after (future, this.limitOrderBook, symbol, limit, params);
    }

    limitOrderBook (orderbook, symbol, limit = undefined, params = {}) {
        return orderbook.limit (limit);
    }

    async fetchOrderBookSnapshot (client, message, subscription) {
        // console.log (new Date (), 'fetchOrderBookSnapshot...');
        const symbol = this.safeString (subscription, 'symbol');
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        const messageHash = this.safeString (subscription, 'messageHash');
        // todo: this is sync in php - make it async
        const snapshot = await this.fetchOrderBook (symbol);
        const orderbook = this.limitedOrderBook ();
        orderbook.reset (snapshot);
        // push the deltas
        const messages = this.safeValue (this.options['messages'], messageHash, []);
        // console.log (new Date (), 'fetchOrderBookSnapshot', messages.length, 'messages', snapshot);
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            // console.log (new Date (), message);
            this.handleOrderBookMessage (client, message, orderbook);
        }
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    handleDelta (bookside, delta) {
        const price = this.safeFloat (delta, 0);
        const amount = this.safeFloat (delta, 1);
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleOrderBookMessage (client, message, orderbook) {
        // console.log (new Date (), '-------------------------', message);
        const u = this.safeInteger2 (message, 'u', 'lastUpdateId');
        if (u > orderbook['nonce']) {
            // console.log (new Date (), 'merging...');
            const U = this.safeInteger (message, 'U');
            if ((U !== undefined) && ((U - 1) > orderbook['nonce'])) {
                throw new ExchangeError (this.id + ' handleOrderBook received an out-of-order nonce');
            }
            this.handleDeltas (orderbook['asks'], this.safeValue (message, 'a', []));
            this.handleDeltas (orderbook['bids'], this.safeValue (message, 'b', []));
            orderbook['nonce'] = u;
            const timestamp = this.safeInteger (message, 'E');
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
        }
    }

    handleOrderBook (client, message) {
        //
        // initial snapshot is fetched with ccxt's fetchOrderBook
        // the feed does not include a snapshot, just the deltas
        //
        //     {
        //         "e": "depthUpdate", // Event type
        //         "E": 1577554482280, // Event time
        //         "s": "BNBBTC", // Symbol
        //         "U": 157, // First update ID in event
        //         "u": 160, // Final update ID in event
        //         "b": [ // bids
        //             [ "0.0024", "10" ], // price, size
        //         ],
        //         "a": [ // asks
        //             [ "0.0026", "100" ], // price, size
        //         ]
        //     }
        //
        const marketId = this.safeString (message, 's');
        let market = undefined;
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            }
        }
        const name = 'depth';
        const messageHash = market['lowercaseId'] + '@' + name;
        if (symbol in this.orderbooks) {
            const orderbook = this.orderbooks[symbol];
            const nonce = orderbook['nonce'];
            // console.log (new Date (), messageHash, 'initialized', message);
            this.handleOrderBookMessage (client, message, orderbook);
            if (nonce < orderbook['nonce']) {
                client.resolve (orderbook, messageHash);
            }
        } else {
            // console.log (new Date (), messageHash, 'caching', message);
            // accumulate deltas
            this.options['messages'][messageHash] = this.safeValue (this.options['messages'], messageHash, []);
            this.options['messages'][messageHash].push (message);
        }
    }

    signMessage (client, messageHash, message, params = {}) {
        // todo: binance signMessage not implemented yet
        return message;
    }

    handleOrderBookSubscription (client, message, subscription) {
        const messageHash = this.safeString (subscription, 'messageHash');
        // console.log (messageHash);
        // process.exit ();
        this.options['messages'][messageHash] = [];
        // fetch the snapshot in a separate async call
        this.spawn (this.fetchOrderBookSnapshot, client, message, subscription);
    }

    handleSubscriptionStatus (client, message) {
        //
        //     {
        //         "result": null,
        //         "id": 1574649734450
        //     }
        //
        const requestId = this.safeString (message, 'id');
        const subscriptionsByRequestId = this.indexBy (client.subscriptions, 'requestId');
        const subscription = this.safeValue (subscriptionsByRequestId, requestId, {});
        const method = this.safeValue (subscription, 'method');
        if (method !== undefined) {
            this.call (method, client, message, subscription);
        }
        return message;
    }

    handleMessage (client, message) {
        const methods = {
            'depthUpdate': this.handleOrderBook,
        };
        const event = this.safeString (message, 'e');
        const method = this.safeValue (methods, event);
        if (method === undefined) {
            const requestId = this.safeString (message, 'id');
            if (requestId !== undefined) {
                return this.handleSubscriptionStatus (client, message);
            }
            return message;
        } else {
            return this.call (method, client, message);
        }
        // console.log (message);
        // process.exit ();
        //
        // const keys = Object.keys (client.futures);
        // for (let i = 0; i < keys.length; i++) {
        //     const key = keys[i];
        //     client.reject ()
        // }
        //
        // --------------------------------------------------------------------
        //
        // console.log (new Date (), JSON.stringify (message, null, 4));
        // console.log ('---------------------------------------------------------');
        // if (Array.isArray (message)) {
        //     const channelId = message[0].toString ();
        //     const subscriptionStatus = this.safeValue (this.options['subscriptionStatusByChannelId'], channelId, {});
        //     const subscription = this.safeValue (subscriptionStatus, 'subscription', {});
        //     const name = this.safeString (subscription, 'name');
        //     const methods = {
        //         'book': 'handleOrderBook',
        //         'ohlc': 'handleOHLCV',
        //         'ticker': 'handleTicker',
        //         'trade': 'handleTrades',
        //     };
        //     const method = this.safeString (methods, name);
        //     if (method === undefined) {
        //         return message;
        //     } else {
        //         return this[method] (client, message);
        //     }
        // } else {
        //     if (this.handleErrorMessage (client, message)) {
        //         const event = this.safeString (message, 'event');
        //         const methods = {
        //             'heartbeat': 'handleHeartbeat',
        //             'systemStatus': 'handleSystemStatus',
        //             'subscriptionStatus': 'handleSubscriptionStatus',
        //         };
        //         const method = this.safeString (methods, event);
        //         if (method === undefined) {
        //             return message;
        //         } else {
        //             return this[method] (client, message);
        //         }
        //     }
        // }
    }
};

