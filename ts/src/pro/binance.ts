
// ----------------------------------------------------------------------------

import binanceRest from '../binance.js';
import { Precise } from '../base/Precise.js';
import { ExchangeError, ArgumentsRequired, BadRequest } from '../base/errors.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide } from '../base/ws/Cache.js';
import type { Int, OrderSide, OrderType, Str, Strings, Trade, OrderBook, Order, Ticker, Tickers, OHLCV, Position, Balances } from '../base/types.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { rsa } from '../base/functions/rsa.js';
import { eddsa } from '../base/functions/crypto.js';
import { ed25519 } from '../static_dependencies/noble-curves/ed25519.js';
import Client from '../base/ws/Client.js';

// -----------------------------------------------------------------------------

export default class binance extends binanceRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': false,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOrders': true,
                'watchOrdersForSymbols': true,
                'watchPositions': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'createOrderWs': true,
                'editOrderWs': true,
                'cancelOrderWs': true,
                'cancelOrdersWs': false,
                'cancelAllOrdersWs': true,
                'fetchOrderWs': true,
                'fetchOrdersWs': true,
                'fetchBalanceWs': true,
                'fetchMyTradesWs': true,
            },
            'urls': {
                'test': {
                    'ws': {
                        'spot': 'wss://testnet.binance.vision/ws',
                        'margin': 'wss://testnet.binance.vision/ws',
                        'future': 'wss://fstream.binancefuture.com/ws',
                        'delivery': 'wss://dstream.binancefuture.com/ws',
                        'ws': 'wss://testnet.binance.vision/ws-api/v3',
                    },
                },
                'api': {
                    'ws': {
                        'spot': 'wss://stream.binance.com:9443/ws',
                        'margin': 'wss://stream.binance.com:9443/ws',
                        'future': 'wss://fstream.binance.com/ws',
                        'delivery': 'wss://dstream.binance.com/ws',
                        'ws': 'wss://ws-api.binance.com:443/ws-api/v3',
                    },
                },
            },
            'streaming': {
                'keepAlive': 180000,
            },
            'options': {
                'returnRateLimits': false,
                'streamLimits': {
                    'spot': 50, // max 1024
                    'margin': 50, // max 1024
                    'future': 50, // max 200
                    'delivery': 50, // max 200
                },
                'subscriptionLimitByStream': {
                    'spot': 200,
                    'margin': 200,
                    'future': 200,
                    'delivery': 200,
                },
                'streamBySubscriptionsHash': {},
                'streamIndex': -1,
                // get updates every 1000ms or 100ms
                // or every 0ms in real-time for futures
                'watchOrderBookRate': 100,
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
                'requestId': {},
                'watchOrderBookLimit': 1000, // default limit
                'watchTrades': {
                    'name': 'trade', // 'trade' or 'aggTrade'
                },
                'watchTicker': {
                    'name': 'ticker', // ticker = 1000ms L1+OHLCV, bookTicker = real-time L1
                },
                'watchTickers': {
                    'name': 'ticker', // ticker or miniTicker or bookTicker
                },
                'watchOHLCV': {
                    'name': 'kline', // or indexPriceKline or markPriceKline (coin-m futures)
                },
                'watchOrderBook': {
                    'maxRetries': 3,
                },
                'watchBalance': {
                    'fetchBalanceSnapshot': false, // or true
                    'awaitBalanceSnapshot': true, // whether to wait for the balance snapshot before providing updates
                },
                'watchPositions': {
                    'fetchPositionsSnapshot': true, // or false
                    'awaitPositionsSnapshot': true, // whether to wait for the positions snapshot before providing updates
                },
                'wallet': 'wb', // wb = wallet balance, cw = cross balance
                'listenKeyRefreshRate': 1200000, // 20 mins
                'ws': {
                    'cost': 5,
                },
            },
        });
    }

    requestId (url) {
        const options = this.safeValue (this.options, 'requestId', {});
        const previousValue = this.safeInteger (options, url, 0);
        const newValue = this.sum (previousValue, 1);
        this.options['requestId'][url] = newValue;
        return newValue;
    }

    stream (type, subscriptionHash, numSubscriptions = 1) {
        const streamBySubscriptionsHash = this.safeValue (this.options, 'streamBySubscriptionsHash', {});
        let stream = this.safeString (streamBySubscriptionsHash, subscriptionHash);
        if (stream === undefined) {
            let streamIndex = this.safeInteger (this.options, 'streamIndex', -1);
            const streamLimits = this.safeValue (this.options, 'streamLimits');
            const streamLimit = this.safeInteger (streamLimits, type);
            streamIndex = streamIndex + 1;
            const normalizedIndex = streamIndex % streamLimit;
            this.options['streamIndex'] = streamIndex;
            stream = this.numberToString (normalizedIndex);
            this.options['streamBySubscriptionsHash'][subscriptionHash] = stream;
            const subscriptionsByStreams = this.safeValue (this.options, 'numSubscriptionsByStream');
            if (subscriptionsByStreams === undefined) {
                this.options['numSubscriptionsByStream'] = {};
            }
            const subscriptionsByStream = this.safeInteger (this.options['numSubscriptionsByStream'], stream, 0);
            const newNumSubscriptions = subscriptionsByStream + numSubscriptions;
            const subscriptionLimitByStream = this.safeInteger (this.options['subscriptionLimitByStream'], type, 200);
            if (newNumSubscriptions > subscriptionLimitByStream) {
                throw new BadRequest (this.id + ' reached the limit of subscriptions by stream. Increase the number of streams, or increase the stream limit or subscription limit by stream if the exchange allows.');
            }
            this.options['numSubscriptionsByStream'][stream] = subscriptionsByStream + numSubscriptions;
        }
        return stream;
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name binance#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        //
        // todo add support for <levels>-snapshots (depth)
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/web-socket-streams.md#partial-book-depth-streams        // <symbol>@depth<levels>@100ms or <symbol>@depth<levels> (1000ms)
        // valid <levels> are 5, 10, or 20
        //
        // default 100, max 1000, valid limits 5, 10, 20, 50, 100, 500, 1000
        //
        // notice the differences between trading futures and spot trading
        // the algorithms use different urls in step 1
        // delta caching and merging also differs in steps 4, 5, 6
        //
        // spot/margin
        // https://binance-docs.github.io/apidocs/spot/en/#how-to-manage-a-local-order-book-correctly
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
        // futures
        // https://binance-docs.github.io/apidocs/futures/en/#how-to-manage-a-local-order-book-correctly
        //
        // 1. Open a stream to wss://fstream.binance.com/stream?streams=btcusdt@depth.
        // 2. Buffer the events you receive from the stream. For same price, latest received update covers the previous one.
        // 3. Get a depth snapshot from https://fapi.binance.com/fapi/v1/depth?symbol=BTCUSDT&limit=1000 .
        // 4. Drop any event where u is < lastUpdateId in the snapshot.
        // 5. The first processed event should have U <= lastUpdateId AND u >= lastUpdateId
        // 6. While listening to the stream, each new event's pu should be equal to the previous event's u, otherwise initialize the process from step 3.
        // 7. The data in each event is the absolute quantity for a price level.
        // 8. If the quantity is 0, remove the price level.
        // 9. Receiving an event that removes a price level that is not in your local order book can happen and is normal.
        //
        return await this.watchOrderBookForSymbols ([ symbol ], limit, params);
    }

    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name binance#watchOrderBookForSymbols
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string[]} symbols unified array of symbols
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false, true, true);
        const firstMarket = this.market (symbols[0]);
        let type = firstMarket['type'];
        if (firstMarket['contract']) {
            type = firstMarket['linear'] ? 'future' : 'delivery';
        }
        const name = 'depth';
        let streamHash = 'multipleOrderbook';
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength > 200) {
                throw new BadRequest (this.id + ' watchOrderBookForSymbols() accepts 200 symbols at most. To watch more symbols call watchOrderBookForSymbols() multiple times');
            }
            streamHash += '::' + symbols.join (',');
        }
        const watchOrderBookRate = this.safeString (this.options, 'watchOrderBookRate', '100');
        const subParams = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const messageHash = market['lowercaseId'] + '@' + name;
            messageHashes.push (messageHash);
            const symbolHash = messageHash + '@' + watchOrderBookRate + 'ms';
            subParams.push (symbolHash);
        }
        const messageHashesLength = messageHashes.length;
        const url = this.urls['api']['ws'][type] + '/' + this.stream (type, streamHash, messageHashesLength);
        const requestId = this.requestId (url);
        const request = {
            'method': 'SUBSCRIBE',
            'params': subParams,
            'id': requestId,
        };
        const subscription = {
            'id': requestId.toString (),
            'name': name,
            'symbols': symbols,
            'method': this.handleOrderBookSubscription,
            'limit': limit,
            'type': type,
            'params': params,
        };
        const message = this.extend (request, params);
        const orderbook = await this.watchMultiple (url, messageHashes, message, messageHashes, subscription);
        return orderbook.limit ();
    }

    async fetchOrderBookSnapshot (client, message, subscription) {
        const name = this.safeString (subscription, 'name');
        const symbol = this.safeString (subscription, 'symbol');
        const market = this.market (symbol);
        const messageHash = market['lowercaseId'] + '@' + name;
        try {
            const defaultLimit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
            const type = this.safeValue (subscription, 'type');
            const limit = this.safeInteger (subscription, 'limit', defaultLimit);
            const params = this.safeValue (subscription, 'params');
            // 3. Get a depth snapshot from https://www.binance.com/api/v1/depth?symbol=BNBBTC&limit=1000 .
            // todo: this is a synch blocking call - make it async
            // default 100, max 1000, valid limits 5, 10, 20, 50, 100, 500, 1000
            const snapshot = await this.fetchRestOrderBookSafe (symbol, limit, params);
            const orderbook = this.safeValue (this.orderbooks, symbol);
            if (orderbook === undefined) {
                // if the orderbook is dropped before the snapshot is received
                return;
            }
            orderbook.reset (snapshot);
            // unroll the accumulated deltas
            const messages = orderbook.cache;
            for (let i = 0; i < messages.length; i++) {
                const messageItem = messages[i];
                const U = this.safeInteger (messageItem, 'U');
                const u = this.safeInteger (messageItem, 'u');
                const pu = this.safeInteger (messageItem, 'pu');
                if (type === 'future') {
                    // 4. Drop any event where u is < lastUpdateId in the snapshot
                    if (u < orderbook['nonce']) {
                        continue;
                    }
                    // 5. The first processed event should have U <= lastUpdateId AND u >= lastUpdateId
                    if ((U <= orderbook['nonce']) && (u >= orderbook['nonce']) || (pu === orderbook['nonce'])) {
                        this.handleOrderBookMessage (client, messageItem, orderbook);
                    }
                } else {
                    // 4. Drop any event where u is <= lastUpdateId in the snapshot
                    if (u <= orderbook['nonce']) {
                        continue;
                    }
                    // 5. The first processed event should have U <= lastUpdateId+1 AND u >= lastUpdateId+1
                    if (((U - 1) <= orderbook['nonce']) && ((u - 1) >= orderbook['nonce'])) {
                        this.handleOrderBookMessage (client, messageItem, orderbook);
                    }
                }
            }
            this.orderbooks[symbol] = orderbook;
            client.resolve (orderbook, messageHash);
        } catch (e) {
            delete client.subscriptions[messageHash];
            client.reject (e, messageHash);
        }
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

    handleOrderBookMessage (client: Client, message, orderbook) {
        const u = this.safeInteger (message, 'u');
        this.handleDeltas (orderbook['asks'], this.safeValue (message, 'a', []));
        this.handleDeltas (orderbook['bids'], this.safeValue (message, 'b', []));
        orderbook['nonce'] = u;
        const timestamp = this.safeInteger (message, 'E');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        return orderbook;
    }

    handleOrderBook (client: Client, message) {
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
        const isTestnetSpot = client.url.indexOf ('testnet') > 0;
        const isSpotMainNet = client.url.indexOf ('/stream.binance.') > 0;
        const isSpot = isTestnetSpot || isSpotMainNet;
        const marketType = isSpot ? 'spot' : 'contract';
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId, undefined, undefined, marketType);
        const symbol = market['symbol'];
        const name = 'depth';
        const messageHash = market['lowercaseId'] + '@' + name;
        const orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            //
            // https://github.com/ccxt/ccxt/issues/6672
            //
            // Sometimes Binance sends the first delta before the subscription
            // confirmation arrives. At that point the orderbook is not
            // initialized yet and the snapshot has not been requested yet
            // therefore it is safe to drop these premature messages.
            //
            return;
        }
        const nonce = this.safeInteger (orderbook, 'nonce');
        if (nonce === undefined) {
            // 2. Buffer the events you receive from the stream.
            orderbook.cache.push (message);
        } else {
            try {
                const U = this.safeInteger (message, 'U');
                const u = this.safeInteger (message, 'u');
                const pu = this.safeInteger (message, 'pu');
                if (pu === undefined) {
                    // spot
                    // 4. Drop any event where u is <= lastUpdateId in the snapshot
                    if (u > orderbook['nonce']) {
                        const timestamp = this.safeInteger (orderbook, 'timestamp');
                        let conditional = undefined;
                        if (timestamp === undefined) {
                            // 5. The first processed event should have U <= lastUpdateId+1 AND u >= lastUpdateId+1
                            conditional = ((U - 1) <= orderbook['nonce']) && ((u - 1) >= orderbook['nonce']);
                        } else {
                            // 6. While listening to the stream, each new event's U should be equal to the previous event's u+1.
                            conditional = ((U - 1) === orderbook['nonce']);
                        }
                        if (conditional) {
                            this.handleOrderBookMessage (client, message, orderbook);
                            if (nonce < orderbook['nonce']) {
                                client.resolve (orderbook, messageHash);
                            }
                        } else {
                            // todo: client.reject from handleOrderBookMessage properly
                            throw new ExchangeError (this.id + ' handleOrderBook received an out-of-order nonce');
                        }
                    }
                } else {
                    // future
                    // 4. Drop any event where u is < lastUpdateId in the snapshot
                    if (u >= orderbook['nonce']) {
                        // 5. The first processed event should have U <= lastUpdateId AND u >= lastUpdateId
                        // 6. While listening to the stream, each new event's pu should be equal to the previous event's u, otherwise initialize the process from step 3
                        if ((U <= orderbook['nonce']) || (pu === orderbook['nonce'])) {
                            this.handleOrderBookMessage (client, message, orderbook);
                            if (nonce <= orderbook['nonce']) {
                                client.resolve (orderbook, messageHash);
                            }
                        } else {
                            // todo: client.reject from handleOrderBookMessage properly
                            throw new ExchangeError (this.id + ' handleOrderBook received an out-of-order nonce');
                        }
                    }
                }
            } catch (e) {
                delete this.orderbooks[symbol];
                delete client.subscriptions[messageHash];
                client.reject (e, messageHash);
            }
        }
    }

    handleOrderBookSubscription (client: Client, message, subscription) {
        const defaultLimit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
        // const messageHash = this.safeString (subscription, 'messageHash');
        const symbolOfSubscription = this.safeString (subscription, 'symbol'); // watchOrderBook
        const symbols = this.safeValue (subscription, 'symbols', [ symbolOfSubscription ]); // watchOrderBookForSymbols
        const limit = this.safeInteger (subscription, 'limit', defaultLimit);
        // handle list of symbols
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            if (symbol in this.orderbooks) {
                delete this.orderbooks[symbol];
            }
            this.orderbooks[symbol] = this.orderBook ({}, limit);
            subscription = this.extend (subscription, { 'symbol': symbol });
            // fetch the snapshot in a separate async call
            this.spawn (this.fetchOrderBookSnapshot, client, message, subscription);
        }
    }

    handleSubscriptionStatus (client: Client, message) {
        //
        //     {
        //         "result": null,
        //         "id": 1574649734450
        //     }
        //
        const id = this.safeString (message, 'id');
        const subscriptionsById = this.indexBy (client.subscriptions, 'id');
        const subscription = this.safeValue (subscriptionsById, id, {});
        const method = this.safeValue (subscription, 'method');
        if (method !== undefined) {
            method.call (this, client, message, subscription);
        }
        return message;
    }

    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name binance#watchTradesForSymbols
         * @description get the list of most recent trades for a list of symbols
         * @param {string[]} symbols unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false, true, true);
        let streamHash = 'multipleTrades';
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength > 200) {
                throw new BadRequest (this.id + ' watchTradesForSymbols() accepts 200 symbols at most. To watch more symbols call watchTradesForSymbols() multiple times');
            }
            streamHash += '::' + symbols.join (',');
        }
        const options = this.safeValue (this.options, 'watchTradesForSymbols', {});
        const name = this.safeString (options, 'name', 'trade');
        const firstMarket = this.market (symbols[0]);
        let type = firstMarket['type'];
        if (firstMarket['contract']) {
            type = firstMarket['linear'] ? 'future' : 'delivery';
        }
        const subParams = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const currentMessageHash = market['lowercaseId'] + '@' + name;
            subParams.push (currentMessageHash);
        }
        const query = this.omit (params, 'type');
        const subParamsLength = subParams.length;
        const url = this.urls['api']['ws'][type] + '/' + this.stream (type, streamHash, subParamsLength);
        const requestId = this.requestId (url);
        const request = {
            'method': 'SUBSCRIBE',
            'params': subParams,
            'id': requestId,
        };
        const subscribe = {
            'id': requestId,
        };
        const trades = await this.watchMultiple (url, subParams, this.extend (request, query), subParams, subscribe);
        if (this.newUpdates) {
            const first = this.safeValue (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name binance#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    parseWsTrade (trade, market = undefined): Trade {
        //
        // public watchTrades
        //
        //     {
        //         "e": "trade",       // event type
        //         "E": 1579481530911, // event time
        //         "s": "ETHBTC",      // symbol
        //         "t": 158410082,     // trade id
        //         "p": "0.01914100",  // price
        //         "q": "0.00700000",  // quantity
        //         "b": 586187049,     // buyer order id
        //         "a": 586186710,     // seller order id
        //         "T": 1579481530910, // trade time
        //         "m": false,         // is the buyer the market maker
        //         "M": true           // binance docs say it should be ignored
        //     }
        //
        //     {
        //        "e": "aggTrade",  // Event type
        //        "E": 123456789,   // Event time
        //        "s": "BNBBTC",    // Symbol
        //        "a": 12345,       // Aggregate trade ID
        //        "p": "0.001",     // Price
        //        "q": "100",       // Quantity
        //        "f": 100,         // First trade ID
        //        "l": 105,         // Last trade ID
        //        "T": 123456785,   // Trade time
        //        "m": true,        // Is the buyer the market maker?
        //        "M": true         // Ignore
        //     }
        //
        // private watchMyTrades spot
        //
        //     {
        //         "e": "executionReport",
        //         "E": 1611063861489,
        //         "s": "BNBUSDT",
        //         "c": "m4M6AD5MF3b1ERe65l4SPq",
        //         "S": "BUY",
        //         "o": "MARKET",
        //         "f": "GTC",
        //         "q": "2.00000000",
        //         "p": "0.00000000",
        //         "P": "0.00000000",
        //         "F": "0.00000000",
        //         "g": -1,
        //         "C": '',
        //         "x": "TRADE",
        //         "X": "PARTIALLY_FILLED",
        //         "r": "NONE",
        //         "i": 1296882607,
        //         "l": "0.33200000",
        //         "z": "0.33200000",
        //         "L": "46.86600000",
        //         "n": "0.00033200",
        //         "N": "BNB",
        //         "T": 1611063861488,
        //         "t": 109747654,
        //         "I": 2696953381,
        //         "w": false,
        //         "m": false,
        //         "M": true,
        //         "O": 1611063861488,
        //         "Z": "15.55951200",
        //         "Y": "15.55951200",
        //         "Q": "0.00000000"
        //     }
        //
        // private watchMyTrades future/delivery
        //
        //     {
        //         "s": "BTCUSDT",
        //         "c": "pb2jD6ZQHpfzSdUac8VqMK",
        //         "S": "SELL",
        //         "o": "MARKET",
        //         "f": "GTC",
        //         "q": "0.001",
        //         "p": "0",
        //         "ap": "33468.46000",
        //         "sp": "0",
        //         "x": "TRADE",
        //         "X": "FILLED",
        //         "i": 13351197194,
        //         "l": "0.001",
        //         "z": "0.001",
        //         "L": "33468.46",
        //         "n": "0.00027086",
        //         "N": "BNB",
        //         "T": 1612095165362,
        //         "t": 458032604,
        //         "b": "0",
        //         "a": "0",
        //         "m": false,
        //         "R": false,
        //         "wt": "CONTRACT_PRICE",
        //         "ot": "MARKET",
        //         "ps": "BOTH",
        //         "cp": false,
        //         "rp": "0.00335000",
        //         "pP": false,
        //         "si": 0,
        //         "ss": 0
        //     }
        //
        const executionType = this.safeString (trade, 'x');
        const isTradeExecution = (executionType === 'TRADE');
        if (!isTradeExecution) {
            return this.parseTrade (trade, market);
        }
        const id = this.safeString2 (trade, 't', 'a');
        const timestamp = this.safeInteger (trade, 'T');
        const price = this.safeString2 (trade, 'L', 'p');
        let amount = this.safeString (trade, 'q');
        if (isTradeExecution) {
            amount = this.safeString (trade, 'l', amount);
        }
        let cost = this.safeString (trade, 'Y');
        if (cost === undefined) {
            if ((price !== undefined) && (amount !== undefined)) {
                cost = Precise.stringMul (price, amount);
            }
        }
        const marketId = this.safeString (trade, 's');
        const marketType = ('ps' in trade) ? 'contract' : 'spot';
        const symbol = this.safeSymbol (marketId, undefined, undefined, marketType);
        let side = this.safeStringLower (trade, 'S');
        let takerOrMaker = undefined;
        const orderId = this.safeString (trade, 'i');
        if ('m' in trade) {
            if (side === undefined) {
                side = trade['m'] ? 'sell' : 'buy'; // this is reversed intentionally
            }
            takerOrMaker = trade['m'] ? 'maker' : 'taker';
        }
        let fee = undefined;
        const feeCost = this.safeString (trade, 'n');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'N');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const type = this.safeStringLower (trade, 'o');
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        });
    }

    handleTrade (client: Client, message) {
        // the trade streams push raw trade information in real-time
        // each trade has a unique buyer and seller
        const isSpot = ((client.url.indexOf ('wss://stream.binance.com') > -1) || (client.url.indexOf ('/testnet.binance') > -1));
        const marketType = (isSpot) ? 'spot' : 'contract';
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId, undefined, undefined, marketType);
        const symbol = market['symbol'];
        const lowerCaseId = this.safeStringLower (message, 's');
        const event = this.safeString (message, 'e');
        const messageHash = lowerCaseId + '@' + event;
        const trade = this.parseWsTrade (message, market);
        let tradesArray = this.safeValue (this.trades, symbol);
        if (tradesArray === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            tradesArray = new ArrayCache (limit);
        }
        tradesArray.append (trade);
        this.trades[symbol] = tradesArray;
        client.resolve (tradesArray, messageHash);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name binance#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let marketId = market['lowercaseId'];
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const options = this.safeValue (this.options, 'watchOHLCV', {});
        const nameOption = this.safeString (options, 'name', 'kline');
        const name = this.safeString (params, 'name', nameOption);
        if (name === 'indexPriceKline') {
            marketId = marketId.replace ('_perp', '');
            // weird behavior for index price kline we can't use the perp suffix
        }
        params = this.omit (params, 'name');
        const messageHash = marketId + '@' + name + '_' + interval;
        let type = market['type'];
        if (market['contract']) {
            type = market['linear'] ? 'future' : 'delivery';
        }
        const url = this.urls['api']['ws'][type] + '/' + this.stream (type, messageHash);
        const requestId = this.requestId (url);
        const request = {
            'method': 'SUBSCRIBE',
            'params': [
                messageHash,
            ],
            'id': requestId,
        };
        const subscribe = {
            'id': requestId,
        };
        const ohlcv = await this.watch (url, messageHash, this.extend (request, params), messageHash, subscribe);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         "e": "kline",
        //         "E": 1579482921215,
        //         "s": "ETHBTC",
        //         "k": {
        //             "t": 1579482900000,
        //             "T": 1579482959999,
        //             "s": "ETHBTC",
        //             "i": "1m",
        //             "f": 158411535,
        //             "L": 158411550,
        //             "o": "0.01913200",
        //             "c": "0.01913500",
        //             "h": "0.01913700",
        //             "l": "0.01913200",
        //             "v": "5.08400000",
        //             "n": 16,
        //             "x": false,
        //             "q": "0.09728060",
        //             "V": "3.30200000",
        //             "Q": "0.06318500",
        //             "B": "0"
        //         }
        //     }
        //
        let event = this.safeString (message, 'e');
        const eventMap = {
            'indexPrice_kline': 'indexPriceKline',
            'markPrice_kline': 'markPriceKline',
        };
        event = this.safeString (eventMap, event, event);
        const kline = this.safeValue (message, 'k');
        let marketId = this.safeString2 (kline, 's', 'ps');
        if (event === 'indexPriceKline') {
            // indexPriceKline doesn't have the _PERP suffix
            marketId = this.safeString (message, 'ps');
        }
        const lowercaseMarketId = marketId.toLowerCase ();
        const interval = this.safeString (kline, 'i');
        // use a reverse lookup in a static map instead
        const timeframe = this.findTimeframe (interval);
        const messageHash = lowercaseMarketId + '@' + event + '_' + interval;
        const parsed = [
            this.safeInteger (kline, 't'),
            this.safeFloat (kline, 'o'),
            this.safeFloat (kline, 'h'),
            this.safeFloat (kline, 'l'),
            this.safeFloat (kline, 'c'),
            this.safeFloat (kline, 'v'),
        ];
        const isSpot = ((client.url.indexOf ('/stream') > -1) || (client.url.indexOf ('/testnet.binance') > -1));
        const marketType = (isSpot) ? 'spot' : 'contract';
        const symbol = this.safeSymbol (marketId, undefined, undefined, marketType);
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        stored.append (parsed);
        client.resolve (stored, messageHash);
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name binance#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.name] stream to use can be ticker or bookTicker
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['lowercaseId'];
        let type = market['type'];
        if (market['contract']) {
            type = market['linear'] ? 'future' : 'delivery';
        }
        const options = this.safeValue (this.options, 'watchTicker', {});
        let name = this.safeString (options, 'name', 'ticker');
        name = this.safeString (params, 'name', name);
        params = this.omit (params, 'name');
        const messageHash = marketId + '@' + name;
        const url = this.urls['api']['ws'][type] + '/' + this.stream (type, messageHash);
        const requestId = this.requestId (url);
        const request = {
            'method': 'SUBSCRIBE',
            'params': [
                messageHash,
            ],
            'id': requestId,
        };
        const subscribe = {
            'id': requestId,
        };
        return await this.watch (url, messageHash, this.extend (request, params), messageHash, subscribe);
    }

    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name binance#watchTickers
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
         * @param {string[]} symbols unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true, true, true);
        const marketIds = this.marketIds (symbols);
        let market = undefined;
        let type = undefined;
        if (symbols !== undefined) {
            market = this.market (symbols[0]);
        }
        [ type, params ] = this.handleMarketTypeAndParams ('watchTickers', market, params);
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('watchTickers', market, params);
        if (this.isLinear (type, subType)) {
            type = 'future';
        } else if (this.isInverse (type, subType)) {
            type = 'delivery';
        }
        const options = this.safeValue (this.options, 'watchTickers', {});
        let name = this.safeString (options, 'name', 'ticker');
        name = this.safeString (params, 'name', name);
        params = this.omit (params, 'name');
        let wsParams = [];
        let messageHash = 'tickers';
        if (symbols !== undefined) {
            messageHash = 'tickers::' + symbols.join (',');
        }
        if (name === 'bookTicker') {
            if (marketIds === undefined) {
                throw new ArgumentsRequired (this.id + ' watchTickers() requires symbols for bookTicker');
            }
            // simulate watchTickers with subscribe multiple individual bookTicker topic
            for (let i = 0; i < marketIds.length; i++) {
                wsParams.push (marketIds[i].toLowerCase () + '@bookTicker');
            }
        } else {
            wsParams = [
                '!' + name + '@arr',
            ];
        }
        const url = this.urls['api']['ws'][type] + '/' + this.stream (type, messageHash);
        const requestId = this.requestId (url);
        const request = {
            'method': 'SUBSCRIBE',
            'params': wsParams,
            'id': requestId,
        };
        const subscribe = {
            'id': requestId,
        };
        const newTickers = await this.watch (url, messageHash, this.extend (request, params), messageHash, subscribe);
        if (this.newUpdates) {
            return newTickers;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    parseWsTicker (message, marketType) {
        //
        // ticker
        //     {
        //         "e": "24hrTicker",      // event type
        //         "E": 1579485598569,     // event time
        //         "s": "ETHBTC",          // symbol
        //         "p": "-0.00004000",     // price change
        //         "P": "-0.209",          // price change percent
        //         "w": "0.01920495",      // weighted average price
        //         "x": "0.01916500",      // the price of the first trade before the 24hr rolling window
        //         "c": "0.01912500",      // last (closing) price
        //         "Q": "0.10400000",      // last quantity
        //         "b": "0.01912200",      // best bid
        //         "B": "4.10400000",      // best bid quantity
        //         "a": "0.01912500",      // best ask
        //         "A": "0.00100000",      // best ask quantity
        //         "o": "0.01916500",      // open price
        //         "h": "0.01956500",      // high price
        //         "l": "0.01887700",      // low price
        //         "v": "173518.11900000", // base volume
        //         "q": "3332.40703994",   // quote volume
        //         "O": 1579399197842,     // open time
        //         "C": 1579485597842,     // close time
        //         "F": 158251292,         // first trade id
        //         "L": 158414513,         // last trade id
        //         "n": 163222,            // total number of trades
        //     }
        //
        // miniTicker
        //     {
        //         "e": "24hrMiniTicker",
        //         "E": 1671617114585,
        //         "s": "MOBBUSD",
        //         "c": "0.95900000",
        //         "o": "0.91200000",
        //         "h": "1.04000000",
        //         "l": "0.89400000",
        //         "v": "2109995.32000000",
        //         "q": "2019254.05788000"
        //     }
        //
        let event = this.safeString (message, 'e', 'bookTicker');
        if (event === '24hrTicker') {
            event = 'ticker';
        }
        let timestamp = undefined;
        if (event === 'bookTicker') {
            // take the event timestamp, if available, for spot tickers it is not
            timestamp = this.safeInteger (message, 'E');
        } else {
            // take the timestamp of the closing price for candlestick streams
            timestamp = this.safeInteger2 (message, 'C', 'E');
        }
        const marketId = this.safeString (message, 's');
        const symbol = this.safeSymbol (marketId, undefined, undefined, marketType);
        const market = this.safeMarket (marketId, undefined, undefined, marketType);
        const last = this.safeString (message, 'c');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (message, 'h'),
            'low': this.safeString (message, 'l'),
            'bid': this.safeString (message, 'b'),
            'bidVolume': this.safeString (message, 'B'),
            'ask': this.safeString (message, 'a'),
            'askVolume': this.safeString (message, 'A'),
            'vwap': this.safeString (message, 'w'),
            'open': this.safeString (message, 'o'),
            'close': last,
            'last': last,
            'previousClose': this.safeString (message, 'x'), // previous day close
            'change': this.safeString (message, 'p'),
            'percentage': this.safeString (message, 'P'),
            'average': undefined,
            'baseVolume': this.safeString (message, 'v'),
            'quoteVolume': this.safeString (message, 'q'),
            'info': message,
        }, market);
    }

    handleTicker (client: Client, message) {
        //
        // 24hr rolling window ticker statistics for a single symbol
        // These are NOT the statistics of the UTC day, but a 24hr rolling window for the previous 24hrs
        // Update Speed 1000ms
        //
        //     {
        //         "e": "24hrTicker",      // event type
        //         "E": 1579485598569,     // event time
        //         "s": "ETHBTC",          // symbol
        //         "p": "-0.00004000",     // price change
        //         "P": "-0.209",          // price change percent
        //         "w": "0.01920495",      // weighted average price
        //         "x": "0.01916500",      // the price of the first trade before the 24hr rolling window
        //         "c": "0.01912500",      // last (closing) price
        //         "Q": "0.10400000",      // last quantity
        //         "b": "0.01912200",      // best bid
        //         "B": "4.10400000",      // best bid quantity
        //         "a": "0.01912500",      // best ask
        //         "A": "0.00100000",      // best ask quantity
        //         "o": "0.01916500",      // open price
        //         "h": "0.01956500",      // high price
        //         "l": "0.01887700",      // low price
        //         "v": "173518.11900000", // base volume
        //         "q": "3332.40703994",   // quote volume
        //         "O": 1579399197842,     // open time
        //         "C": 1579485597842,     // close time
        //         "F": 158251292,         // first trade id
        //         "L": 158414513,         // last trade id
        //         "n": 163222,            // total number of trades
        //     }
        //
        let event = this.safeString (message, 'e', 'bookTicker');
        if (event === '24hrTicker') {
            event = 'ticker';
        } else if (event === '24hrMiniTicker') {
            event = 'miniTicker';
        }
        const wsMarketId = this.safeStringLower (message, 's');
        const messageHash = wsMarketId + '@' + event;
        const isSpot = ((client.url.indexOf ('/stream') > -1) || (client.url.indexOf ('/testnet.binance') > -1));
        const marketType = (isSpot) ? 'spot' : 'contract';
        const result = this.parseWsTicker (message, marketType);
        const symbol = result['symbol'];
        this.tickers[symbol] = result;
        client.resolve (result, messageHash);
        if (event === 'bookTicker') {
            // watch bookTickers
            client.resolve (result, '!' + 'bookTicker@arr');
            const messageHashes = this.findMessageHashes (client, 'tickers::');
            for (let i = 0; i < messageHashes.length; i++) {
                const currentMessageHash = messageHashes[i];
                const parts = currentMessageHash.split ('::');
                const symbolsString = parts[1];
                const symbols = symbolsString.split (',');
                if (this.inArray (symbol, symbols)) {
                    client.resolve (result, currentMessageHash);
                }
            }
        }
    }

    handleTickers (client: Client, message) {
        const isSpot = ((client.url.indexOf ('/stream') > -1) || (client.url.indexOf ('/testnet.binance') > -1));
        const marketType = (isSpot) ? 'spot' : 'contract';
        let rawTickers = [];
        const newTickers = {};
        if (Array.isArray (message)) {
            rawTickers = message;
        } else {
            rawTickers.push (message);
        }
        for (let i = 0; i < rawTickers.length; i++) {
            const ticker = rawTickers[i];
            const result = this.parseWsTicker (ticker, marketType);
            const symbol = result['symbol'];
            this.tickers[symbol] = result;
            newTickers[symbol] = result;
        }
        const messageHashes = this.findMessageHashes (client, 'tickers::');
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const parts = messageHash.split ('::');
            const symbolsString = parts[1];
            const symbols = symbolsString.split (',');
            const tickers = this.filterByArray (newTickers, 'symbol', symbols);
            const tickersSymbols = Object.keys (tickers);
            const numTickers = tickersSymbols.length;
            if (numTickers > 0) {
                client.resolve (tickers, messageHash);
            }
        }
        client.resolve (newTickers, 'tickers');
    }

    signParams (params = {}) {
        this.checkRequiredCredentials ();
        let extendedParams = this.extend ({
            'timestamp': this.nonce (),
            'apiKey': this.apiKey,
        }, params);
        const defaultRecvWindow = this.safeInteger (this.options, 'recvWindow');
        if (defaultRecvWindow !== undefined) {
            params['recvWindow'] = defaultRecvWindow;
        }
        const recvWindow = this.safeInteger (params, 'recvWindow');
        if (recvWindow !== undefined) {
            params['recvWindow'] = recvWindow;
        }
        extendedParams = this.keysort (extendedParams);
        const query = this.urlencode (extendedParams);
        let signature = undefined;
        if (this.secret.indexOf ('PRIVATE KEY') > -1) {
            if (this.secret.length > 120) {
                signature = rsa (query, this.secret, sha256);
            } else {
                signature = eddsa (this.encode (query), this.secret, ed25519);
            }
        } else {
            signature = this.hmac (this.encode (query), this.encode (this.secret), sha256);
        }
        extendedParams['signature'] = signature;
        return extendedParams;
    }

    async authenticate (params = {}) {
        const time = this.milliseconds ();
        let query = undefined;
        let type = undefined;
        [ type, query ] = this.handleMarketTypeAndParams ('authenticate', undefined, params);
        let subType = undefined;
        [ subType, query ] = this.handleSubTypeAndParams ('authenticate', undefined, query);
        if (this.isLinear (type, subType)) {
            type = 'future';
        } else if (this.isInverse (type, subType)) {
            type = 'delivery';
        }
        let marginMode = undefined;
        [ marginMode, query ] = this.handleMarginModeAndParams ('authenticate', query);
        const isIsolatedMargin = (marginMode === 'isolated');
        const isCrossMargin = (marginMode === 'cross') || (marginMode === undefined);
        const symbol = this.safeString (query, 'symbol');
        query = this.omit (query, 'symbol');
        const options = this.safeValue (this.options, type, {});
        const lastAuthenticatedTime = this.safeInteger (options, 'lastAuthenticatedTime', 0);
        const listenKeyRefreshRate = this.safeInteger (this.options, 'listenKeyRefreshRate', 1200000);
        const delay = this.sum (listenKeyRefreshRate, 10000);
        if (time - lastAuthenticatedTime > delay) {
            let response = undefined;
            if (type === 'future') {
                response = await this.fapiPrivatePostListenKey (query);
            } else if (type === 'delivery') {
                response = await this.dapiPrivatePostListenKey (query);
            } else if (type === 'margin' && isCrossMargin) {
                response = await this.sapiPostUserDataStream (query);
            } else if (isIsolatedMargin) {
                if (symbol === undefined) {
                    throw new ArgumentsRequired (this.id + ' authenticate() requires a symbol argument for isolated margin mode');
                }
                const marketId = this.marketId (symbol);
                query = this.extend (query, { 'symbol': marketId });
                response = await this.sapiPostUserDataStreamIsolated (query);
            } else {
                response = await this.publicPostUserDataStream (query);
            }
            this.options[type] = this.extend (options, {
                'listenKey': this.safeString (response, 'listenKey'),
                'lastAuthenticatedTime': time,
            });
            this.delay (listenKeyRefreshRate, this.keepAliveListenKey, params);
        }
    }

    async keepAliveListenKey (params = {}) {
        // https://binance-docs.github.io/apidocs/spot/en/#listen-key-spot
        let type = this.safeString2 (this.options, 'defaultType', 'authenticate', 'spot');
        type = this.safeString (params, 'type', type);
        const subTypeInfo = this.handleSubTypeAndParams ('keepAliveListenKey', undefined, params);
        const subType = subTypeInfo[0];
        if (this.isLinear (type, subType)) {
            type = 'future';
        } else if (this.isInverse (type, subType)) {
            type = 'delivery';
        }
        const options = this.safeValue (this.options, type, {});
        const listenKey = this.safeString (options, 'listenKey');
        if (listenKey === undefined) {
            // A network error happened: we can't renew a listen key that does not exist.
            return;
        }
        const request = {};
        const symbol = this.safeString (params, 'symbol');
        const sendParams = this.omit (params, [ 'type', 'symbol' ]);
        const time = this.milliseconds ();
        try {
            if (type === 'future') {
                await this.fapiPrivatePutListenKey (this.extend (request, sendParams));
            } else if (type === 'delivery') {
                await this.dapiPrivatePutListenKey (this.extend (request, sendParams));
            } else {
                request['listenKey'] = listenKey;
                if (type === 'margin') {
                    request['symbol'] = symbol;
                    await this.sapiPutUserDataStream (this.extend (request, sendParams));
                } else {
                    await this.publicPutUserDataStream (this.extend (request, sendParams));
                }
            }
        } catch (error) {
            const url = this.urls['api']['ws'][type] + '/' + this.options[type]['listenKey'];
            const client = this.client (url);
            const messageHashes = Object.keys (client.futures);
            for (let i = 0; i < messageHashes.length; i++) {
                const messageHash = messageHashes[i];
                client.reject (error, messageHash);
            }
            this.options[type] = this.extend (options, {
                'listenKey': undefined,
                'lastAuthenticatedTime': 0,
            });
            return;
        }
        this.options[type] = this.extend (options, {
            'listenKey': listenKey,
            'lastAuthenticatedTime': time,
        });
        // whether or not to schedule another listenKey keepAlive request
        const clients = Object.values (this.clients);
        const listenKeyRefreshRate = this.safeInteger (this.options, 'listenKeyRefreshRate', 1200000);
        for (let i = 0; i < clients.length; i++) {
            const client = clients[i];
            const subscriptionKeys = Object.keys ((client as any).subscriptions);
            for (let j = 0; j < subscriptionKeys.length; j++) {
                const subscribeType = subscriptionKeys[j];
                if (subscribeType === type) {
                    this.delay (listenKeyRefreshRate, this.keepAliveListenKey, params);
                    return;
                }
            }
        }
    }

    setBalanceCache (client: Client, type) {
        if (type in client.subscriptions) {
            return;
        }
        const options = this.safeValue (this.options, 'watchBalance');
        const fetchBalanceSnapshot = this.safeBool (options, 'fetchBalanceSnapshot', false);
        if (fetchBalanceSnapshot) {
            const messageHash = type + ':fetchBalanceSnapshot';
            if (!(messageHash in client.futures)) {
                client.future (messageHash);
                this.spawn (this.loadBalanceSnapshot, client, messageHash, type);
            }
        } else {
            this.balance[type] = {};
        }
    }

    async loadBalanceSnapshot (client, messageHash, type) {
        const response = await this.fetchBalance ({ 'type': type });
        this.balance[type] = this.extend (response, this.safeValue (this.balance, type, {}));
        // don't remove the future from the .futures cache
        const future = client.futures[messageHash];
        future.resolve ();
        client.resolve (this.balance[type], type + ':balance');
    }

    async fetchBalanceWs (params = {}): Promise<Balances> {
        /**
         * @method
         * @name binance#fetchBalanceWs
         * @description fetch balance and get the amount of funds available for trading or funds locked in orders
         * @see https://binance-docs.github.io/apidocs/websocket_api/en/#account-information-user_data
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string|undefined} [params.type] 'future', 'delivery', 'savings', 'funding', or 'spot'
         * @param {string|undefined} [params.marginMode] 'cross' or 'isolated', for margin trading, uses this.options.defaultMarginMode if not passed, defaults to undefined/None/null
         * @param {string[]|undefined} [params.symbols] unified market symbols, only used in isolated margin mode
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        const url = this.urls['api']['ws']['ws'];
        const requestId = this.requestId (url);
        const messageHash = requestId.toString ();
        let returnRateLimits = false;
        [ returnRateLimits, params ] = this.handleOptionAndParams (params, 'createOrderWs', 'returnRateLimits', false);
        const payload = {
            'returnRateLimits': returnRateLimits,
        };
        const message = {
            'id': messageHash,
            'method': 'account.status',
            'params': this.signParams (this.extend (payload, params)),
        };
        const subscription = {
            'method': this.handleBalanceWs,
        };
        return await this.watch (url, messageHash, message, messageHash, subscription);
    }

    handleBalanceWs (client: Client, message) {
        //
        //    {
        //        "id": "605a6d20-6588-4cb9-afa0-b0ab087507ba",
        //        "status": 200,
        //        "result": {
        //            "makerCommission": 15,
        //            "takerCommission": 15,
        //            "buyerCommission": 0,
        //            "sellerCommission": 0,
        //            "canTrade": true,
        //            "canWithdraw": true,
        //            "canDeposit": true,
        //            "commissionRates": {
        //                "maker": "0.00150000",
        //                "taker": "0.00150000",
        //                "buyer": "0.00000000",
        //                "seller": "0.00000000"
        //            },
        //            "brokered": false,
        //            "requireSelfTradePrevention": false,
        //            "updateTime": 1660801833000,
        //            "accountType": "SPOT",
        //            "balances": [{
        //                    "asset": "BNB",
        //                    "free": "0.00000000",
        //                    "locked": "0.00000000"
        //                },
        //                {
        //                    "asset": "BTC",
        //                    "free": "1.3447112",
        //                    "locked": "0.08600000"
        //                },
        //                {
        //                    "asset": "USDT",
        //                    "free": "1021.21000000",
        //                    "locked": "0.00000000"
        //                }
        //            ],
        //            "permissions": [
        //                "SPOT"
        //            ]
        //        }
        //    }
        //
        const messageHash = this.safeString (message, 'id');
        const result = this.safeValue (message, 'result', {});
        const parsedBalances = this.parseBalance (result);
        client.resolve (parsedBalances, messageHash);
    }

    async watchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name binance#watchBalance
         * @description watch balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        await this.authenticate (params);
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        let type = this.safeString (params, 'type', defaultType);
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('watchBalance', undefined, params);
        if (this.isLinear (type, subType)) {
            type = 'future';
        } else if (this.isInverse (type, subType)) {
            type = 'delivery';
        }
        const url = this.urls['api']['ws'][type] + '/' + this.options[type]['listenKey'];
        const client = this.client (url);
        this.setBalanceCache (client, type);
        this.setPositionsCache (client, type);
        const options = this.safeValue (this.options, 'watchBalance');
        const fetchBalanceSnapshot = this.safeBool (options, 'fetchBalanceSnapshot', false);
        const awaitBalanceSnapshot = this.safeBool (options, 'awaitBalanceSnapshot', true);
        if (fetchBalanceSnapshot && awaitBalanceSnapshot) {
            await client.future (type + ':fetchBalanceSnapshot');
        }
        const messageHash = type + ':balance';
        const message = undefined;
        return await this.watch (url, messageHash, message, type);
    }

    handleBalance (client: Client, message) {
        //
        // sent upon a balance update not related to orders
        //
        //     {
        //         "e": "balanceUpdate",
        //         "E": 1629352505586,
        //         "a": "IOTX",
        //         "d": "0.43750000",
        //         "T": 1629352505585
        //     }
        //
        // sent upon creating or filling an order
        //
        //     {
        //         "e": "outboundAccountPosition", // Event type
        //         "E": 1564034571105,             // Event Time
        //         "u": 1564034571073,             // Time of last account update
        //         "B": [                          // Balances Array
        //             {
        //                 "a": "ETH",                 // Asset
        //                 "f": "10000.000000",        // Free
        //                 "l": "0.000000"             // Locked
        //             }
        //         ]
        //     }
        //
        // future/delivery
        //
        //     {
        //         "e": "ACCOUNT_UPDATE",            // Event Type
        //         "E": 1564745798939,               // Event Time
        //         "T": 1564745798938 ,              // Transaction
        //         "i": "SfsR",                      // Account Alias
        //         "a": {                            // Update Data
        //             "m":"ORDER",                  // Event reason type
        //             "B":[                         // Balances
        //                 {
        //                     "a":"BTC",                // Asset
        //                     "wb":"122624.12345678",   // Wallet Balance
        //                     "cw":"100.12345678"       // Cross Wallet Balance
        //                 },
        //             ],
        //             "P":[
        //                 {
        //                     "s":"BTCUSD_200925",      // Symbol
        //                     "pa":"0",                 // Position Amount
        //                     "ep":"0.0",               // Entry Price
        //                     "cr":"200",               // (Pre-fee) Accumulated Realized
        //                     "up":"0",                 // Unrealized PnL
        //                     "mt":"isolated",          // Margin Type
        //                     "iw":"0.00000000",        // Isolated Wallet (if isolated position)
        //                     "ps":"BOTH"               // Position Side
        //                 },
        //             ]
        //         }
        //     }
        //
        const wallet = this.safeValue (this.options, 'wallet', 'wb'); // cw for cross wallet
        // each account is connected to a different endpoint
        // and has exactly one subscriptionhash which is the account type
        const subscriptions = Object.keys (client.subscriptions);
        const accountType = subscriptions[0];
        const messageHash = accountType + ':balance';
        if (this.balance[accountType] === undefined) {
            this.balance[accountType] = {};
        }
        this.balance[accountType]['info'] = message;
        const event = this.safeString (message, 'e');
        if (event === 'balanceUpdate') {
            const currencyId = this.safeString (message, 'a');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const delta = this.safeString (message, 'd');
            if (code in this.balance[accountType]) {
                let previousValue = this.balance[accountType][code]['free'];
                if (typeof previousValue !== 'string') {
                    previousValue = this.numberToString (previousValue);
                }
                account['free'] = Precise.stringAdd (previousValue, delta);
            } else {
                account['free'] = delta;
            }
            this.balance[accountType][code] = account;
        } else {
            message = this.safeValue (message, 'a', message);
            const B = this.safeValue (message, 'B');
            for (let i = 0; i < B.length; i++) {
                const entry = B[i];
                const currencyId = this.safeString (entry, 'a');
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['free'] = this.safeString (entry, 'f');
                account['used'] = this.safeString (entry, 'l');
                account['total'] = this.safeString (entry, wallet);
                this.balance[accountType][code] = account;
            }
        }
        const timestamp = this.safeInteger (message, 'E');
        this.balance[accountType]['timestamp'] = timestamp;
        this.balance[accountType]['datetime'] = this.iso8601 (timestamp);
        this.balance[accountType] = this.safeBalance (this.balance[accountType]);
        client.resolve (this.balance[accountType], messageHash);
    }

    checkIsSpot (method: string, symbol: string, params = {}) {
        /**
         * @method
         * @ignore
         * @description checks if symbols is a spot market if not throws an error
         * @param {string} method name of the method to be checked
         * @param {string} symbol symbol or marketId of the market to be checked
         */
        if (symbol === undefined) {
            const type = this.safeString (params, 'type', 'spot');
            const defaultType = this.safeString (this.options, 'defaultType', type);
            if (defaultType === 'spot') {
                return;
            }
            throw new BadRequest (this.id + ' ' + method + ' only supports spot markets');
        }
        const market = this.market (symbol);
        if (!market['spot']) {
            throw new BadRequest (this.id + ' ' + method + ' only supports spot markets');
        }
    }

    async createOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: number = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name binance#createOrderWs
         * @see https://binance-docs.github.io/apidocs/websocket_api/en/#place-new-order-trade
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} params.test test order, default false
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        this.checkIsSpot ('createOrderWs', symbol, params);
        const url = this.urls['api']['ws']['ws'];
        const requestId = this.requestId (url);
        const messageHash = requestId.toString ();
        const sor = this.safeValue2 (params, 'sor', 'SOR', false);
        params = this.omit (params, 'sor', 'SOR');
        const payload = this.createOrderRequest (symbol, type, side, amount, price, params);
        let returnRateLimits = false;
        [ returnRateLimits, params ] = this.handleOptionAndParams (params, 'createOrderWs', 'returnRateLimits', false);
        payload['returnRateLimits'] = returnRateLimits;
        const test = this.safeBool (params, 'test', false);
        params = this.omit (params, 'test');
        const message = {
            'id': messageHash,
            'method': 'order.place',
            'params': this.signParams (this.extend (payload, params)),
        };
        if (test) {
            if (sor) {
                message['method'] = 'sor.order.test';
            } else {
                message['method'] = 'order.test';
            }
        }
        const subscription = {
            'method': this.handleOrderWs,
        };
        return await this.watch (url, messageHash, message, messageHash, subscription);
    }

    handleOrderWs (client: Client, message) {
        //
        //    {
        //        "id": 1,
        //        "status": 200,
        //        "result": {
        //          "symbol": "BTCUSDT",
        //          "orderId": 7663053,
        //          "orderListId": -1,
        //          "clientOrderId": "x-R4BD3S82d8959d0f5114499487a614",
        //          "transactTime": 1687642291434,
        //          "price": "25000.00000000",
        //          "origQty": "0.00100000",
        //          "executedQty": "0.00000000",
        //          "cummulativeQuoteQty": "0.00000000",
        //          "status": "NEW",
        //          "timeInForce": "GTC",
        //          "type": "LIMIT",
        //          "side": "BUY",
        //          "workingTime": 1687642291434,
        //          "fills": [],
        //          "selfTradePreventionMode": "NONE"
        //        },
        //        "rateLimits": [
        //          {
        //            "rateLimitType": "ORDERS",
        //            "interval": "SECOND",
        //            "intervalNum": 10,
        //            "limit": 50,
        //            "count": 1
        //          },
        //          {
        //            "rateLimitType": "ORDERS",
        //            "interval": "DAY",
        //            "intervalNum": 1,
        //            "limit": 160000,
        //            "count": 1
        //          },
        //          {
        //            "rateLimitType": "REQUEST_WEIGHT",
        //            "interval": "MINUTE",
        //            "intervalNum": 1,
        //            "limit": 1200,
        //            "count": 12
        //          }
        //        ]
        //    }
        //
        const messageHash = this.safeString (message, 'id');
        const result = this.safeValue (message, 'result', {});
        const order = this.parseOrder (result);
        client.resolve (order, messageHash);
    }

    handleOrdersWs (client: Client, message) {
        //
        //    {
        //        "id": 1,
        //        "status": 200,
        //        "result": [{
        //            "symbol": "BTCUSDT",
        //            "orderId": 7665584,
        //            "orderListId": -1,
        //            "clientOrderId": "x-R4BD3S82b54769abdd3e4b57874c52",
        //            "price": "26000.00000000",
        //            "origQty": "0.00100000",
        //            "executedQty": "0.00000000",
        //            "cummulativeQuoteQty": "0.00000000",
        //            "status": "NEW",
        //            "timeInForce": "GTC",
        //            "type": "LIMIT",
        //            "side": "BUY",
        //            "stopPrice": "0.00000000",
        //            "icebergQty": "0.00000000",
        //            "time": 1687642884646,
        //            "updateTime": 1687642884646,
        //            "isWorking": true,
        //            "workingTime": 1687642884646,
        //            "origQuoteOrderQty": "0.00000000",
        //            "selfTradePreventionMode": "NONE"
        //        },
        //        ...
        //        ],
        //        "rateLimits": [{
        //            "rateLimitType": "REQUEST_WEIGHT",
        //            "interval": "MINUTE",
        //            "intervalNum": 1,
        //            "limit": 1200,
        //            "count": 14
        //        }]
        //    }
        //
        const messageHash = this.safeString (message, 'id');
        const result = this.safeValue (message, 'result', []);
        const orders = this.parseOrders (result);
        client.resolve (orders, messageHash);
    }

    async editOrderWs (id: string, symbol: string, type: OrderType, side: OrderSide, amount: number, price: number = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name binance#editOrderWs
         * @description edit a trade order
         * @see https://binance-docs.github.io/apidocs/websocket_api/en/#cancel-and-replace-order-trade
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of the currency you want to trade in units of the base currency
         * @param {float|undefined} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        this.checkIsSpot ('editOrderWs', symbol, params);
        const url = this.urls['api']['ws']['ws'];
        const requestId = this.requestId (url);
        const messageHash = requestId.toString ();
        const payload = this.editSpotOrderRequest (id, symbol, type, side, amount, price, params);
        let returnRateLimits = false;
        [ returnRateLimits, params ] = this.handleOptionAndParams (params, 'editOrderWs', 'returnRateLimits', false);
        payload['returnRateLimits'] = returnRateLimits;
        const message = {
            'id': messageHash,
            'method': 'order.cancelReplace',
            'params': this.signParams (this.extend (payload, params)),
        };
        const subscription = {
            'method': this.handleEditOrderWs,
        };
        return await this.watch (url, messageHash, message, messageHash, subscription);
    }

    handleEditOrderWs (client: Client, message) {
        //
        //    {
        //        "id": 1,
        //        "status": 200,
        //        "result": {
        //            "cancelResult": "SUCCESS",
        //            "newOrderResult": "SUCCESS",
        //            "cancelResponse": {
        //                "symbol": "BTCUSDT",
        //                "origClientOrderId": "x-R4BD3S82813c5d7ffa594104917de2",
        //                "orderId": 7665177,
        //                "orderListId": -1,
        //                "clientOrderId": "mbrnbQsQhtCXCLY45d5q7S",
        //                "price": "26000.00000000",
        //                "origQty": "0.00100000",
        //                "executedQty": "0.00000000",
        //                "cummulativeQuoteQty": "0.00000000",
        //                "status": "CANCELED",
        //                "timeInForce": "GTC",
        //                "type": "LIMIT",
        //                "side": "BUY",
        //                "selfTradePreventionMode": "NONE"
        //            },
        //            "newOrderResponse": {
        //                "symbol": "BTCUSDT",
        //                "orderId": 7665584,
        //                "orderListId": -1,
        //                "clientOrderId": "x-R4BD3S82b54769abdd3e4b57874c52",
        //                "transactTime": 1687642884646,
        //                "price": "26000.00000000",
        //                "origQty": "0.00100000",
        //                "executedQty": "0.00000000",
        //                "cummulativeQuoteQty": "0.00000000",
        //                "status": "NEW",
        //                "timeInForce": "GTC",
        //                "type": "LIMIT",
        //                "side": "BUY",
        //                "workingTime": 1687642884646,
        //                "fills": [],
        //                "selfTradePreventionMode": "NONE"
        //            }
        //        },
        //        "rateLimits": [{
        //                "rateLimitType": "ORDERS",
        //                "interval": "SECOND",
        //                "intervalNum": 10,
        //                "limit": 50,
        //                "count": 1
        //            },
        //            {
        //                "rateLimitType": "ORDERS",
        //                "interval": "DAY",
        //                "intervalNum": 1,
        //                "limit": 160000,
        //                "count": 3
        //            },
        //            {
        //                "rateLimitType": "REQUEST_WEIGHT",
        //                "interval": "MINUTE",
        //                "intervalNum": 1,
        //                "limit": 1200,
        //                "count": 12
        //            }
        //        ]
        //    }
        //
        const messageHash = this.safeString (message, 'id');
        const result = this.safeValue (message, 'result', {});
        const rawOrder = this.safeValue (result, 'newOrderResponse', {});
        const order = this.parseOrder (rawOrder);
        client.resolve (order, messageHash);
    }

    async cancelOrderWs (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name binance#cancelOrderWs
         * @see https://binance-docs.github.io/apidocs/websocket_api/en/#cancel-order-trade
         * @description cancel multiple orders
         * @param {string} id order id
         * @param {string} symbol unified market symbol, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string|undefined} [params.cancelRestrictions] Supported values: ONLY_NEW - Cancel will succeed if the order status is NEW. ONLY_PARTIALLY_FILLED - Cancel will succeed if order status is PARTIALLY_FILLED.
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new BadRequest (this.id + ' cancelOrderWs requires a symbol');
        }
        this.checkIsSpot ('cancelOrderWs', symbol, params);
        const url = this.urls['api']['ws']['ws'];
        const requestId = this.requestId (url);
        const messageHash = requestId.toString ();
        let returnRateLimits = false;
        [ returnRateLimits, params ] = this.handleOptionAndParams (params, 'cancelOrderWs', 'returnRateLimits', false);
        const payload = {
            'symbol': this.marketId (symbol),
            'returnRateLimits': returnRateLimits,
        };
        const clientOrderId = this.safeValue2 (params, 'origClientOrderId', 'clientOrderId');
        if (clientOrderId !== undefined) {
            payload['origClientOrderId'] = clientOrderId;
        } else {
            payload['orderId'] = this.parseToInt (id);
        }
        params = this.omit (params, [ 'origClientOrderId', 'clientOrderId' ]);
        const message = {
            'id': messageHash,
            'method': 'order.cancel',
            'params': this.signParams (this.extend (payload, params)),
        };
        const subscription = {
            'method': this.handleOrderWs,
        };
        return await this.watch (url, messageHash, message, messageHash, subscription);
    }

    async cancelAllOrdersWs (symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name binance#cancelAllOrdersWs
         * @see https://binance-docs.github.io/apidocs/websocket_api/en/#current-open-orders-user_data
         * @description cancel all open orders in a market
         * @param {string} symbol unified market symbol of the market to cancel orders in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const url = this.urls['api']['ws']['ws'];
        const requestId = this.requestId (url);
        const messageHash = requestId.toString ();
        let returnRateLimits = false;
        [ returnRateLimits, params ] = this.handleOptionAndParams (params, 'cancelAllOrdersWs', 'returnRateLimits', false);
        const payload = {
            'symbol': this.marketId (symbol),
            'returnRateLimits': returnRateLimits,
        };
        const message = {
            'id': messageHash,
            'method': 'order.cancel',
            'params': this.signParams (this.extend (payload, params)),
        };
        const subscription = {
            'method': this.handleOrdersWs,
        };
        return await this.watch (url, messageHash, message, messageHash, subscription);
    }

    async fetchOrderWs (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name binance#fetchOrderWs
         * @see https://binance-docs.github.io/apidocs/websocket_api/en/#query-order-user_data
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new BadRequest (this.id + ' cancelOrderWs requires a symbol');
        }
        this.checkIsSpot ('fetchOrderWs', symbol, params);
        const url = this.urls['api']['ws']['ws'];
        const requestId = this.requestId (url);
        const messageHash = requestId.toString ();
        let returnRateLimits = false;
        [ returnRateLimits, params ] = this.handleOptionAndParams (params, 'fetchOrderWs', 'returnRateLimits', false);
        const payload = {
            'symbol': this.marketId (symbol),
            'returnRateLimits': returnRateLimits,
        };
        const clientOrderId = this.safeValue2 (params, 'origClientOrderId', 'clientOrderId');
        if (clientOrderId !== undefined) {
            payload['origClientOrderId'] = clientOrderId;
        } else {
            payload['orderId'] = this.parseToInt (id);
        }
        const message = {
            'id': messageHash,
            'method': 'order.status',
            'params': this.signParams (this.extend (payload, params)),
        };
        const subscription = {
            'method': this.handleOrderWs,
        };
        return await this.watch (url, messageHash, message, messageHash, subscription);
    }

    async fetchOrdersWs (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name binance#fetchOrdersWs
         * @see https://binance-docs.github.io/apidocs/websocket_api/en/#account-order-history-user_data
         * @description fetches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} [since] the earliest time in ms to fetch orders for
         * @param {int|undefined} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.orderId] order id to begin at
         * @param {int} [params.startTime] earliest time in ms to retrieve orders for
         * @param {int} [params.endTime] latest time in ms to retrieve orders for
         * @param {int} [params.limit] the maximum number of order structures to retrieve
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new BadRequest (this.id + ' fetchOrdersWs requires a symbol');
        }
        this.checkIsSpot ('fetchOrdersWs', symbol, params);
        const url = this.urls['api']['ws']['ws'];
        const requestId = this.requestId (url);
        const messageHash = requestId.toString ();
        let returnRateLimits = false;
        [ returnRateLimits, params ] = this.handleOptionAndParams (params, 'fetchOrderWs', 'returnRateLimits', false);
        const payload = {
            'symbol': this.marketId (symbol),
            'returnRateLimits': returnRateLimits,
        };
        const message = {
            'id': messageHash,
            'method': 'allOrders',
            'params': this.signParams (this.extend (payload, params)),
        };
        const subscription = {
            'method': this.handleOrdersWs,
        };
        const orders = await this.watch (url, messageHash, message, messageHash, subscription);
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    async fetchOpenOrdersWs (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name binance#fetchOpenOrdersWs
         * @see https://binance-docs.github.io/apidocs/websocket_api/en/#current-open-orders-user_data
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int|undefined} [since] the earliest time in ms to fetch open orders for
         * @param {int|undefined} [limit] the maximum number of open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        this.checkIsSpot ('fetchOpenOrdersWs', symbol);
        const url = this.urls['api']['ws']['ws'];
        const requestId = this.requestId (url);
        const messageHash = requestId.toString ();
        let returnRateLimits = false;
        [ returnRateLimits, params ] = this.handleOptionAndParams (params, 'fetchOrderWs', 'returnRateLimits', false);
        const payload = {
            'returnRateLimits': returnRateLimits,
        };
        if (symbol !== undefined) {
            payload['symbol'] = this.marketId (symbol);
        }
        const message = {
            'id': messageHash,
            'method': 'openOrders.status',
            'params': this.signParams (this.extend (payload, params)),
        };
        const subscription = {
            'method': this.handleOrdersWs,
        };
        const orders = await this.watch (url, messageHash, message, messageHash, subscription);
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name binance#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://binance-docs.github.io/apidocs/spot/en/#payload-order-update
         * @param {string} symbol unified market symbol of the market the orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string|undefined} [params.marginMode] 'cross' or 'isolated', for spot margin
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let messageHash = 'orders';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchOrders', market, params);
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('watchOrders', market, params);
        if (this.isLinear (type, subType)) {
            type = 'future';
        } else if (this.isInverse (type, subType)) {
            type = 'delivery';
        }
        params = this.extend (params, { 'type': type, 'symbol': symbol }); // needed inside authenticate for isolated margin
        await this.authenticate (params);
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('watchOrders', params);
        let urlType = type;
        if ((type === 'margin') || ((type === 'spot') && (marginMode !== undefined))) {
            urlType = 'spot'; // spot-margin shares the same stream as regular spot
        }
        const url = this.urls['api']['ws'][urlType] + '/' + this.options[type]['listenKey'];
        const client = this.client (url);
        this.setBalanceCache (client, type);
        this.setPositionsCache (client, type);
        const message = undefined;
        const orders = await this.watch (url, messageHash, message, type);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    parseWsOrder (order, market = undefined) {
        //
        // spot
        //
        //     {
        //         "e": "executionReport",        // Event type
        //         "E": 1499405658658,            // Event time
        //         "s": "ETHBTC",                 // Symbol
        //         "c": "mUvoqJxFIILMdfAW5iGSOW", // Client order ID
        //         "S": "BUY",                    // Side
        //         "o": "LIMIT",                  // Order type
        //         "f": "GTC",                    // Time in force
        //         "q": "1.00000000",             // Order quantity
        //         "p": "0.10264410",             // Order price
        //         "P": "0.00000000",             // Stop price
        //         "F": "0.00000000",             // Iceberg quantity
        //         "g": -1,                       // OrderListId
        //         "C": null,                     // Original client order ID; This is the ID of the order being canceled
        //         "x": "NEW",                    // Current execution type
        //         "X": "NEW",                    // Current order status
        //         "r": "NONE",                   // Order reject reason; will be an error code.
        //         "i": 4293153,                  // Order ID
        //         "l": "0.00000000",             // Last executed quantity
        //         "z": "0.00000000",             // Cumulative filled quantity
        //         "L": "0.00000000",             // Last executed price
        //         "n": "0",                      // Commission amount
        //         "N": null,                     // Commission asset
        //         "T": 1499405658657,            // Transaction time
        //         "t": -1,                       // Trade ID
        //         "I": 8641984,                  // Ignore
        //         "w": true,                     // Is the order on the book?
        //         "m": false,                    // Is this trade the maker side?
        //         "M": false,                    // Ignore
        //         "O": 1499405658657,            // Order creation time
        //         "Z": "0.00000000",             // Cumulative quote asset transacted quantity
        //         "Y": "0.00000000"              // Last quote asset transacted quantity (i.e. lastPrice * lastQty),
        //         "Q": "0.00000000"              // Quote Order Qty
        //     }
        //
        // future
        //
        //     {
        //         "s":"BTCUSDT",                 // Symbol
        //         "c":"TEST",                    // Client Order Id
        //                                        // special client order id:
        //                                        // starts with "autoclose-": liquidation order
        //                                        // "adl_autoclose": ADL auto close order
        //         "S":"SELL",                    // Side
        //         "o":"TRAILING_STOP_MARKET",    // Order Type
        //         "f":"GTC",                     // Time in Force
        //         "q":"0.001",                   // Original Quantity
        //         "p":"0",                       // Original Price
        //         "ap":"0",                      // Average Price
        //         "sp":"7103.04",                // Stop Price. Please ignore with TRAILING_STOP_MARKET order
        //         "x":"NEW",                     // Execution Type
        //         "X":"NEW",                     // Order Status
        //         "i":8886774,                   // Order Id
        //         "l":"0",                       // Order Last Filled Quantity
        //         "z":"0",                       // Order Filled Accumulated Quantity
        //         "L":"0",                       // Last Filled Price
        //         "N":"USDT",                    // Commission Asset, will not push if no commission
        //         "n":"0",                       // Commission, will not push if no commission
        //         "T":1568879465651,             // Order Trade Time
        //         "t":0,                         // Trade Id
        //         "b":"0",                       // Bids Notional
        //         "a":"9.91",                    // Ask Notional
        //         "m":false,                     // Is this trade the maker side?
        //         "R":false,                     // Is this reduce only
        //         "wt":"CONTRACT_PRICE",         // Stop Price Working Type
        //         "ot":"TRAILING_STOP_MARKET",   // Original Order Type
        //         "ps":"LONG",                   // Position Side
        //         "cp":false,                    // If Close-All, pushed with conditional order
        //         "AP":"7476.89",                // Activation Price, only puhed with TRAILING_STOP_MARKET order
        //         "cr":"5.0",                    // Callback Rate, only puhed with TRAILING_STOP_MARKET order
        //         "rp":"0"                       // Realized Profit of the trade
        //     }
        //
        const executionType = this.safeString (order, 'x');
        const orderId = this.safeString (order, 'i');
        const marketId = this.safeString (order, 's');
        const marketType = ('ps' in order) ? 'contract' : 'spot';
        const symbol = this.safeSymbol (marketId, undefined, undefined, marketType);
        let timestamp = this.safeInteger (order, 'O');
        const T = this.safeInteger (order, 'T');
        let lastTradeTimestamp = undefined;
        if (executionType === 'NEW' || executionType === 'AMENDMENT' || executionType === 'CANCELED') {
            if (timestamp === undefined) {
                timestamp = T;
            }
        } else if (executionType === 'TRADE') {
            lastTradeTimestamp = T;
        }
        const lastUpdateTimestamp = T;
        let fee = undefined;
        const feeCost = this.safeString (order, 'n');
        if ((feeCost !== undefined) && (Precise.stringGt (feeCost, '0'))) {
            const feeCurrencyId = this.safeString (order, 'N');
            const feeCurrency = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        const price = this.safeString (order, 'p');
        const amount = this.safeString (order, 'q');
        const side = this.safeStringLower (order, 'S');
        const type = this.safeStringLower (order, 'o');
        const filled = this.safeString (order, 'z');
        const cost = this.safeString (order, 'Z');
        const average = this.safeString (order, 'ap');
        const rawStatus = this.safeString (order, 'X');
        const status = this.parseOrderStatus (rawStatus);
        const trades = undefined;
        let clientOrderId = this.safeString (order, 'C');
        if ((clientOrderId === undefined) || (clientOrderId.length === 0)) {
            clientOrderId = this.safeString (order, 'c');
        }
        const stopPrice = this.safeString2 (order, 'P', 'sp');
        let timeInForce = this.safeString (order, 'f');
        if (timeInForce === 'GTX') {
            // GTX means "Good Till Crossing" and is an equivalent way of saying Post Only
            timeInForce = 'PO';
        }
        return this.safeOrder ({
            'info': order,
            'symbol': symbol,
            'id': orderId,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'reduceOnly': this.safeValue (order, 'R'),
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': trades,
        });
    }

    handleOrderUpdate (client: Client, message) {
        //
        // spot
        //
        //     {
        //         "e": "executionReport",        // Event type
        //         "E": 1499405658658,            // Event time
        //         "s": "ETHBTC",                 // Symbol
        //         "c": "mUvoqJxFIILMdfAW5iGSOW", // Client order ID
        //         "S": "BUY",                    // Side
        //         "o": "LIMIT",                  // Order type
        //         "f": "GTC",                    // Time in force
        //         "q": "1.00000000",             // Order quantity
        //         "p": "0.10264410",             // Order price
        //         "P": "0.00000000",             // Stop price
        //         "F": "0.00000000",             // Iceberg quantity
        //         "g": -1,                       // OrderListId
        //         "C": null,                     // Original client order ID; This is the ID of the order being canceled
        //         "x": "NEW",                    // Current execution type
        //         "X": "NEW",                    // Current order status
        //         "r": "NONE",                   // Order reject reason; will be an error code.
        //         "i": 4293153,                  // Order ID
        //         "l": "0.00000000",             // Last executed quantity
        //         "z": "0.00000000",             // Cumulative filled quantity
        //         "L": "0.00000000",             // Last executed price
        //         "n": "0",                      // Commission amount
        //         "N": null,                     // Commission asset
        //         "T": 1499405658657,            // Transaction time
        //         "t": -1,                       // Trade ID
        //         "I": 8641984,                  // Ignore
        //         "w": true,                     // Is the order on the book?
        //         "m": false,                    // Is this trade the maker side?
        //         "M": false,                    // Ignore
        //         "O": 1499405658657,            // Order creation time
        //         "Z": "0.00000000",             // Cumulative quote asset transacted quantity
        //         "Y": "0.00000000"              // Last quote asset transacted quantity (i.e. lastPrice * lastQty),
        //         "Q": "0.00000000"              // Quote Order Qty
        //     }
        //
        // future
        //
        //     {
        //         "e":"ORDER_TRADE_UPDATE",           // Event Type
        //         "E":1568879465651,                  // Event Time
        //         "T":1568879465650,                  // Trasaction Time
        //         "o": {
        //             "s":"BTCUSDT",                  // Symbol
        //             "c":"TEST",                     // Client Order Id
        //                                             // special client order id:
        //                                             // starts with "autoclose-": liquidation order
        //                                             // "adl_autoclose": ADL auto close order
        //             "S":"SELL",                     // Side
        //             "o":"TRAILING_STOP_MARKET",     // Order Type
        //             "f":"GTC",                      // Time in Force
        //             "q":"0.001",                    // Original Quantity
        //             "p":"0",                        // Original Price
        //             "ap":"0",                       // Average Price
        //             "sp":"7103.04",                 // Stop Price. Please ignore with TRAILING_STOP_MARKET order
        //             "x":"NEW",                      // Execution Type
        //             "X":"NEW",                      // Order Status
        //             "i":8886774,                    // Order Id
        //             "l":"0",                        // Order Last Filled Quantity
        //             "z":"0",                        // Order Filled Accumulated Quantity
        //             "L":"0",                        // Last Filled Price
        //             "N":"USDT",                     // Commission Asset, will not push if no commission
        //             "n":"0",                        // Commission, will not push if no commission
        //             "T":1568879465651,              // Order Trade Time
        //             "t":0,                          // Trade Id
        //             "b":"0",                        // Bids Notional
        //             "a":"9.91",                     // Ask Notional
        //             "m":false,                      // Is this trade the maker side?
        //             "R":false,                      // Is this reduce only
        //             "wt":"CONTRACT_PRICE",          // Stop Price Working Type
        //             "ot":"TRAILING_STOP_MARKET",    // Original Order Type
        //             "ps":"LONG",                    // Position Side
        //             "cp":false,                     // If Close-All, pushed with conditional order
        //             "AP":"7476.89",                 // Activation Price, only puhed with TRAILING_STOP_MARKET order
        //             "cr":"5.0",                     // Callback Rate, only puhed with TRAILING_STOP_MARKET order
        //             "rp":"0"                        // Realized Profit of the trade
        //         }
        //     }
        //
        const e = this.safeString (message, 'e');
        if (e === 'ORDER_TRADE_UPDATE') {
            message = this.safeValue (message, 'o', message);
        }
        this.handleMyTrade (client, message);
        this.handleOrder (client, message);
    }

    async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        /**
         * @method
         * @name binance#watchPositions
         * @description watch all open positions
         * @param {string[]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        let messageHash = '';
        symbols = this.marketSymbols (symbols);
        if (!this.isEmpty (symbols)) {
            market = this.getMarketFromSymbols (symbols);
            messageHash = '::' + symbols.join (',');
        }
        const marketTypeObject = {};
        if (market !== undefined) {
            marketTypeObject['type'] = market['type'];
            marketTypeObject['subType'] = market['subType'];
        }
        await this.authenticate (this.extend (marketTypeObject, params));
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchPositions', market, params);
        if (type === 'spot' || type === 'margin') {
            type = 'future';
        }
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('watchPositions', market, params);
        if (this.isLinear (type, subType)) {
            type = 'future';
        } else if (this.isInverse (type, subType)) {
            type = 'delivery';
        }
        messageHash = type + ':positions' + messageHash;
        const url = this.urls['api']['ws'][type] + '/' + this.options[type]['listenKey'];
        const client = this.client (url);
        this.setBalanceCache (client, type);
        this.setPositionsCache (client, type, symbols);
        const fetchPositionsSnapshot = this.handleOption ('watchPositions', 'fetchPositionsSnapshot', true);
        const awaitPositionsSnapshot = this.safeValue ('watchPositions', 'awaitPositionsSnapshot', true);
        const cache = this.safeValue (this.positions, type);
        if (fetchPositionsSnapshot && awaitPositionsSnapshot && cache === undefined) {
            const snapshot = await client.future (type + ':fetchPositionsSnapshot');
            return this.filterBySymbolsSinceLimit (snapshot, symbols, since, limit, true);
        }
        const newPositions = await this.watch (url, messageHash, undefined, type);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit (cache, symbols, since, limit, true);
    }

    setPositionsCache (client: Client, type, symbols: Strings = undefined) {
        if (type === 'spot') {
            return;
        }
        if (this.positions === undefined) {
            this.positions = {};
        }
        if (type in this.positions) {
            return;
        }
        const fetchPositionsSnapshot = this.handleOption ('watchPositions', 'fetchPositionsSnapshot', false);
        if (fetchPositionsSnapshot) {
            const messageHash = type + ':fetchPositionsSnapshot';
            if (!(messageHash in client.futures)) {
                client.future (messageHash);
                this.spawn (this.loadPositionsSnapshot, client, messageHash, type);
            }
        } else {
            this.positions[type] = new ArrayCacheBySymbolBySide ();
        }
    }

    async loadPositionsSnapshot (client, messageHash, type) {
        const positions = await this.fetchPositions (undefined, { 'type': type });
        this.positions[type] = new ArrayCacheBySymbolBySide ();
        const cache = this.positions[type];
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            const contracts = this.safeNumber (position, 'contracts', 0);
            if (contracts > 0) {
                cache.append (position);
            }
        }
        // don't remove the future from the .futures cache
        const future = client.futures[messageHash];
        future.resolve (cache);
        client.resolve (cache, type + ':position');
    }

    handlePositions (client, message) {
        //
        //     {
        //         e: 'ACCOUNT_UPDATE',
        //         T: 1667881353112,
        //         E: 1667881353115,
        //         a: {
        //             B: [{
        //                 a: 'USDT',
        //                 wb: '1127.95750089',
        //                 cw: '1040.82091149',
        //                 bc: '0'
        //             }],
        //             P: [{
        //                 s: 'BTCUSDT',
        //                 pa: '-0.089',
        //                 ep: '19700.03933',
        //                 cr: '-1260.24809979',
        //                 up: '1.53058860',
        //                 mt: 'isolated',
        //                 iw: '87.13658940',
        //                 ps: 'BOTH',
        //                 ma: 'USDT'
        //             }],
        //             m: 'ORDER'
        //         }
        //     }
        //
        // each account is connected to a different endpoint
        // and has exactly one subscriptionhash which is the account type
        const subscriptions = Object.keys (client.subscriptions);
        const accountType = subscriptions[0];
        if (this.positions === undefined) {
            this.positions = {};
        }
        if (!(accountType in this.positions)) {
            this.positions[accountType] = new ArrayCacheBySymbolBySide ();
        }
        const cache = this.positions[accountType];
        const data = this.safeValue (message, 'a', {});
        const rawPositions = this.safeValue (data, 'P', []);
        const newPositions = [];
        for (let i = 0; i < rawPositions.length; i++) {
            const rawPosition = rawPositions[i];
            const position = this.parseWsPosition (rawPosition);
            const timestamp = this.safeInteger (message, 'E');
            position['timestamp'] = timestamp;
            position['datetime'] = this.iso8601 (timestamp);
            newPositions.push (position);
            cache.append (position);
        }
        const messageHashes = this.findMessageHashes (client, accountType + ':positions::');
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const parts = messageHash.split ('::');
            const symbolsString = parts[1];
            const symbols = symbolsString.split (',');
            const positions = this.filterByArray (newPositions, 'symbol', symbols, false);
            if (!this.isEmpty (positions)) {
                client.resolve (positions, messageHash);
            }
        }
        client.resolve (newPositions, accountType + ':positions');
    }

    parseWsPosition (position, market = undefined) {
        //
        //     {
        //         "s": "BTCUSDT", // Symbol
        //         "pa": "0", // Position Amount
        //         "ep": "0.00000", // Entry Price
        //         "cr": "200", // (Pre-fee) Accumulated Realized
        //         "up": "0", // Unrealized PnL
        //         "mt": "isolated", // Margin Type
        //         "iw": "0.00000000", // Isolated Wallet (if isolated position)
        //         "ps": "BOTH" // Position Side
        //     }
        //
        const marketId = this.safeString (position, 's');
        const positionSide = this.safeStringLower (position, 'ps');
        const hedged = positionSide !== 'both';
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': this.safeSymbol (marketId, undefined, undefined, 'contract'),
            'notional': undefined,
            'marginMode': this.safeString (position, 'mt'),
            'liquidationPrice': undefined,
            'entryPrice': this.safeNumber (position, 'ep'),
            'unrealizedPnl': this.safeNumber (position, 'up'),
            'percentage': undefined,
            'contracts': this.safeNumber (position, 'pa'),
            'contractSize': undefined,
            'markPrice': undefined,
            'side': positionSide,
            'hedged': hedged,
            'timestamp': undefined,
            'datetime': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'collateral': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'leverage': undefined,
            'marginRatio': undefined,
        });
    }

    async fetchMyTradesWs (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name binance#fetchMyTradesWs
         * @see https://binance-docs.github.io/apidocs/websocket_api/en/#account-trade-history-user_data
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} [since] the earliest time in ms to fetch trades for
         * @param {int|undefined} [limit] the maximum number of trades structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.endTime] the latest time in ms to fetch trades for
         * @param {int} [params.fromId] first trade Id to fetch
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new BadRequest (this.id + ' fetchMyTradesWs requires a symbol');
        }
        this.checkIsSpot ('fetchMyTradesWs', symbol, params);
        const url = this.urls['api']['ws']['ws'];
        const requestId = this.requestId (url);
        const messageHash = requestId.toString ();
        let returnRateLimits = false;
        [ returnRateLimits, params ] = this.handleOptionAndParams (params, 'fetchMyTradesWs', 'returnRateLimits', false);
        const payload = {
            'symbol': this.marketId (symbol),
            'returnRateLimits': returnRateLimits,
        };
        if (since !== undefined) {
            payload['startTime'] = since;
        }
        if (limit !== undefined) {
            payload['limit'] = limit;
        }
        const fromId = this.safeInteger (params, 'fromId');
        if (fromId !== undefined && since !== undefined) {
            throw new BadRequest (this.id + 'fetchMyTradesWs does not support fetching by both fromId and since parameters at the same time');
        }
        const message = {
            'id': messageHash,
            'method': 'myTrades',
            'params': this.signParams (this.extend (payload, params)),
        };
        const subscription = {
            'method': this.handleTradesWs,
        };
        const trades = await this.watch (url, messageHash, message, messageHash, subscription);
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit);
    }

    handleTradesWs (client: Client, message) {
        //
        //    {
        //        "id": "f4ce6a53-a29d-4f70-823b-4ab59391d6e8",
        //        "status": 200,
        //        "result": [{
        //                "symbol": "BTCUSDT",
        //                "id": 1650422481,
        //                "orderId": 12569099453,
        //                "orderListId": -1,
        //                "price": "23416.10000000",
        //                "qty": "0.00635000",
        //                "quoteQty": "148.69223500",
        //                "commission": "0.00000000",
        //                "commissionAsset": "BNB",
        //                "time": 1660801715793,
        //                "isBuyer": false,
        //                "isMaker": true,
        //                "isBestMatch": true
        //            },
        //            ...
        //        ],
        //    }
        //
        const messageHash = this.safeString (message, 'id');
        const result = this.safeValue (message, 'result', []);
        const trades = this.parseTrades (result);
        client.resolve (trades, messageHash);
    }

    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name binance#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure
         */
        await this.loadMarkets ();
        let type = undefined;
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
        }
        [ type, params ] = this.handleMarketTypeAndParams ('watchMyTrades', market, params);
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('watchMyTrades', market, params);
        if (this.isLinear (type, subType)) {
            type = 'future';
        } else if (this.isInverse (type, subType)) {
            type = 'delivery';
        }
        let messageHash = 'myTrades';
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
            messageHash += ':' + symbol;
            params = this.extend (params, { 'type': market['type'], 'symbol': symbol });
        }
        await this.authenticate (params);
        let urlType = type; // we don't change type because the listening key is different
        if (type === 'margin') {
            urlType = 'spot'; // spot-margin shares the same stream as regular spot
        }
        const url = this.urls['api']['ws'][urlType] + '/' + this.options[type]['listenKey'];
        const client = this.client (url);
        this.setBalanceCache (client, type);
        this.setPositionsCache (client, type);
        const message = undefined;
        const trades = await this.watch (url, messageHash, message, type);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleMyTrade (client: Client, message) {
        const messageHash = 'myTrades';
        const executionType = this.safeString (message, 'x');
        if (executionType === 'TRADE') {
            const trade = this.parseWsTrade (message);
            const orderId = this.safeString (trade, 'order');
            let tradeFee = this.safeValue (trade, 'fee', {});
            tradeFee = this.extend ({}, tradeFee);
            const symbol = this.safeString (trade, 'symbol');
            if (orderId !== undefined && tradeFee !== undefined && symbol !== undefined) {
                const cachedOrders = this.orders;
                if (cachedOrders !== undefined) {
                    const orders = this.safeValue (cachedOrders.hashmap, symbol, {});
                    const order = this.safeValue (orders, orderId);
                    if (order !== undefined) {
                        // accumulate order fees
                        const fees = this.safeValue (order, 'fees');
                        const fee = this.safeValue (order, 'fee');
                        if (!this.isEmpty (fees)) {
                            let insertNewFeeCurrency = true;
                            for (let i = 0; i < fees.length; i++) {
                                const orderFee = fees[i];
                                if (orderFee['currency'] === tradeFee['currency']) {
                                    const feeCost = this.sum (tradeFee['cost'], orderFee['cost']);
                                    order['fees'][i]['cost'] = parseFloat (this.currencyToPrecision (tradeFee['currency'], feeCost));
                                    insertNewFeeCurrency = false;
                                    break;
                                }
                            }
                            if (insertNewFeeCurrency) {
                                order['fees'].push (tradeFee);
                            }
                        } else if (fee !== undefined) {
                            if (fee['currency'] === tradeFee['currency']) {
                                const feeCost = this.sum (fee['cost'], tradeFee['cost']);
                                order['fee']['cost'] = parseFloat (this.currencyToPrecision (tradeFee['currency'], feeCost));
                            } else if (fee['currency'] === undefined) {
                                order['fee'] = tradeFee;
                            } else {
                                order['fees'] = [ fee, tradeFee ];
                                order['fee'] = undefined;
                            }
                        } else {
                            order['fee'] = tradeFee;
                        }
                        // save this trade in the order
                        const orderTrades = this.safeValue (order, 'trades', []);
                        orderTrades.push (trade);
                        order['trades'] = orderTrades;
                        // don't append twice cause it breaks newUpdates mode
                        // this order already exists in the cache
                    }
                }
            }
            if (this.myTrades === undefined) {
                const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
                this.myTrades = new ArrayCacheBySymbolById (limit);
            }
            const myTrades = this.myTrades;
            myTrades.append (trade);
            client.resolve (this.myTrades, messageHash);
            const messageHashSymbol = messageHash + ':' + symbol;
            client.resolve (this.myTrades, messageHashSymbol);
        }
    }

    handleOrder (client: Client, message) {
        const parsed = this.parseWsOrder (message);
        const symbol = this.safeString (parsed, 'symbol');
        const orderId = this.safeString (parsed, 'id');
        if (symbol !== undefined) {
            if (this.orders === undefined) {
                const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
                this.orders = new ArrayCacheBySymbolById (limit);
            }
            const cachedOrders = this.orders;
            const orders = this.safeValue (cachedOrders.hashmap, symbol, {});
            const order = this.safeValue (orders, orderId);
            if (order !== undefined) {
                const fee = this.safeValue (order, 'fee');
                if (fee !== undefined) {
                    parsed['fee'] = fee;
                }
                const fees = this.safeValue (order, 'fees');
                if (fees !== undefined) {
                    parsed['fees'] = fees;
                }
                parsed['trades'] = this.safeValue (order, 'trades');
                const timestamp = this.safeInteger (parsed, 'timestamp');
                if (timestamp === undefined) {
                    parsed['timestamp'] = this.safeInteger (order, 'timestamp');
                    parsed['datetime'] = this.safeString (order, 'datetime');
                }
            }
            cachedOrders.append (parsed);
            const messageHash = 'orders';
            const symbolSpecificMessageHash = 'orders:' + symbol;
            client.resolve (cachedOrders, messageHash);
            client.resolve (cachedOrders, symbolSpecificMessageHash);
        }
    }

    handleAcountUpdate (client, message) {
        this.handleBalance (client, message);
        this.handlePositions (client, message);
    }

    handleWsError (client: Client, message) {
        //
        //    {
        //        "error": {
        //            "code": 2,
        //            "msg": "Invalid request: invalid stream"
        //        },
        //        "id": 1
        //    }
        //
        const id = this.safeString (message, 'id');
        let rejected = false;
        const error = this.safeValue (message, 'error', {});
        const code = this.safeInteger (error, 'code');
        const msg = this.safeString (error, 'msg');
        try {
            this.handleErrors (code, msg, client.url, undefined, undefined, this.json (error), error, undefined, undefined);
        } catch (e) {
            rejected = true;
            // private endpoint uses id as messageHash
            client.reject (e, id);
            // public endpoint stores messageHash in subscriptios
            const subscriptionKeys = Object.keys (client.subscriptions);
            for (let i = 0; i < subscriptionKeys.length; i++) {
                const subscriptionHash = subscriptionKeys[i];
                const subscriptionId = this.safeString (client.subscriptions[subscriptionHash], 'id');
                if (id === subscriptionId) {
                    client.reject (e, subscriptionHash);
                }
            }
        }
        if (!rejected) {
            client.reject (message, id);
        }
        // reset connection if 5xx error
        if (this.safeString (code, 0) === '5') {
            client.reset (message);
        }
    }

    handleMessage (client: Client, message) {
        // handle WebSocketAPI
        const status = this.safeString (message, 'status');
        const error = this.safeValue (message, 'error');
        if ((error !== undefined) || (status !== undefined && status !== '200')) {
            this.handleWsError (client, message);
            return;
        }
        const id = this.safeString (message, 'id');
        const subscriptions = this.safeValue (client.subscriptions, id);
        let method = this.safeValue (subscriptions, 'method');
        if (method !== undefined) {
            method.call (this, client, message);
            return;
        }
        // handle other APIs
        const methods = {
            'depthUpdate': this.handleOrderBook,
            'trade': this.handleTrade,
            'aggTrade': this.handleTrade,
            'kline': this.handleOHLCV,
            'markPrice_kline': this.handleOHLCV,
            'indexPrice_kline': this.handleOHLCV,
            '24hrTicker@arr': this.handleTickers,
            '24hrMiniTicker@arr': this.handleTickers,
            '24hrTicker': this.handleTicker,
            '24hrMiniTicker': this.handleTicker,
            'bookTicker': this.handleTicker,
            'outboundAccountPosition': this.handleBalance,
            'balanceUpdate': this.handleBalance,
            'ACCOUNT_UPDATE': this.handleAcountUpdate,
            'executionReport': this.handleOrderUpdate,
            'ORDER_TRADE_UPDATE': this.handleOrderUpdate,
        };
        let event = this.safeString (message, 'e');
        if (Array.isArray (message)) {
            const data = message[0];
            event = this.safeString (data, 'e') + '@arr';
        }
        method = this.safeValue (methods, event);
        if (method === undefined) {
            const requestId = this.safeString (message, 'id');
            if (requestId !== undefined) {
                this.handleSubscriptionStatus (client, message);
                return;
            }
            // special case for the real-time bookTicker, since it comes without an event identifier
            //
            //     {
            //         "u": 7488717758,
            //         "s": "BTCUSDT",
            //         "b": "28621.74000000",
            //         "B": "1.43278800",
            //         "a": "28621.75000000",
            //         "A": "2.52500800"
            //     }
            //
            if (event === undefined) {
                this.handleTicker (client, message);
                this.handleTickers (client, message);
            }
        } else {
            method.call (this, client, message);
        }
    }
}
