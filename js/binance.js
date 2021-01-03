'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ExchangeError } = require ('ccxt/js/base/errors');
const { ArrayCache, ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class binance extends ccxt.binance {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchTrades': true,
                'watchOHLCV': true,
                'watchTicker': true,
                'watchTickers': false, // for now
                'watchOrders': true,
                'watchBalance': true,
            },
            'urls': {
                'test': {
                    'ws': {
                        'spot': 'wss://testnet.binance.vision/ws',
                        'margin': 'wss://testnet.binance.vision/ws',
                        'future': 'wss://stream.binancefuture.com/ws',
                        'delivery': 'wss://dstream.binancefuture.com/ws',
                    },
                },
                'api': {
                    'ws': {
                        'spot': 'wss://stream.binance.com:9443/ws',
                        'margin': 'wss://stream.binance.com:9443/ws',
                        'future': 'wss://fstream.binance.com/ws',
                        'delivery': 'wss://dstream.binance.com/ws',
                    },
                },
            },
            'options': {
                // get updates every 1000ms or 100ms
                // or every 0ms in real-time for futures
                'watchOrderBookRate': 100,
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
                'requestId': {},
                'watchOrderBookLimit': 1000, // default limit
                'watchTrades': {
                    'type': 'trade', // 'trade' or 'aggTrade'
                },
                'watchTicker': {
                    'type': 'ticker', // ticker = 1000ms L1+OHLCV, bookTicker = real-time L1
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

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        //
        // todo add support for <levels>-snapshots (depth)
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/web-socket-streams.md#partial-book-depth-streams        // <symbol>@depth<levels>@100ms or <symbol>@depth<levels> (1000ms)
        // valid <levels> are 5, 10, or 20
        //
        // default 100, max 1000, valid limits 5, 10, 20, 50, 100, 500, 1000
        if (limit !== undefined) {
            if ((limit !== 5) && (limit !== 10) && (limit !== 20) && (limit !== 50) && (limit !== 100) && (limit !== 500) && (limit !== 1000)) {
                throw new ExchangeError (this.id + ' watchOrderBook limit argument must be undefined, 5, 10, 20, 50, 100, 500 or 1000');
            }
        }
        //
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'watchOrderBook', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        const market = this.market (symbol);
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
        const name = 'depth';
        const messageHash = market['lowercaseId'] + '@' + name;
        const url = this.urls['api']['ws'][type]; // + '/' + messageHash;
        const requestId = this.requestId (url);
        const watchOrderBookRate = this.safeString (this.options, 'watchOrderBookRate', '100');
        const request = {
            'method': 'SUBSCRIBE',
            'params': [
                messageHash + '@' + watchOrderBookRate + 'ms',
            ],
            'id': requestId,
        };
        const subscription = {
            'id': requestId.toString (),
            'messageHash': messageHash,
            'name': name,
            'symbol': symbol,
            'method': this.handleOrderBookSubscription,
            'limit': limit,
            'type': type,
            'params': params,
        };
        const message = this.extend (request, query);
        // 1. Open a stream to wss://stream.binance.com:9443/ws/bnbbtc@depth.
        const future = this.watch (url, messageHash, message, messageHash, subscription);
        return await this.after (future, this.limitOrderBook, symbol, limit, params);
    }

    async fetchOrderBookSnapshot (client, message, subscription) {
        const defaultLimit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
        const type = this.safeValue (subscription, 'type');
        const symbol = this.safeString (subscription, 'symbol');
        const messageHash = this.safeString (subscription, 'messageHash');
        const limit = this.safeInteger (subscription, 'limit', defaultLimit);
        const params = this.safeValue (subscription, 'params');
        // 3. Get a depth snapshot from https://www.binance.com/api/v1/depth?symbol=BNBBTC&limit=1000 .
        // todo: this is a synch blocking call in ccxt.php - make it async
        // default 100, max 1000, valid limits 5, 10, 20, 50, 100, 500, 1000
        const snapshot = await this.fetchOrderBook (symbol, limit, params);
        const orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            // if the orderbook is dropped before the snapshot is received
            return;
        }
        orderbook.reset (snapshot);
        // unroll the accumulated deltas
        const messages = orderbook.cache;
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const U = this.safeInteger (message, 'U');
            const u = this.safeInteger (message, 'u');
            const pu = this.safeInteger (message, 'pu');
            if (type === 'future') {
                // 4. Drop any event where u is < lastUpdateId in the snapshot
                if (u < orderbook['nonce']) {
                    continue;
                }
                // 5. The first processed event should have U <= lastUpdateId AND u >= lastUpdateId
                if ((U <= orderbook['nonce']) && (u >= orderbook['nonce']) || (pu === orderbook['nonce'])) {
                    this.handleOrderBookMessage (client, message, orderbook);
                }
            } else {
                // 4. Drop any event where u is <= lastUpdateId in the snapshot
                if (u <= orderbook['nonce']) {
                    continue;
                }
                // 5. The first processed event should have U <= lastUpdateId+1 AND u >= lastUpdateId+1
                if (((U - 1) <= orderbook['nonce']) && ((u - 1) >= orderbook['nonce'])) {
                    this.handleOrderBookMessage (client, message, orderbook);
                }
            }
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
        const u = this.safeInteger (message, 'u');
        this.handleDeltas (orderbook['asks'], this.safeValue (message, 'a', []));
        this.handleDeltas (orderbook['bids'], this.safeValue (message, 'b', []));
        orderbook['nonce'] = u;
        const timestamp = this.safeInteger (message, 'E');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        return orderbook;
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
        const market = this.safeMarket (marketId);
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

    handleOrderBookSubscription (client, message, subscription) {
        const defaultLimit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit', defaultLimit);
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        this.orderbooks[symbol] = this.orderBook ({}, limit);
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
        const id = this.safeString (message, 'id');
        const subscriptionsById = this.indexBy (client.subscriptions, 'id');
        const subscription = this.safeValue (subscriptionsById, id, {});
        const method = this.safeValue (subscription, 'method');
        if (method !== undefined) {
            method.call (this, client, message, subscription);
        }
        return message;
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const options = this.safeValue (this.options, 'watchTrades', {});
        const name = this.safeString (options, 'type', 'trade');
        const messageHash = market['lowercaseId'] + '@' + name;
        const future = this.watchPublic (messageHash, params);
        return await this.after (future, this.filterBySinceLimit, since, limit, 'timestamp', true);
    }

    parseTrade (trade, market = undefined) {
        //
        //     {
        //         e: 'trade',       // event type
        //         E: 1579481530911, // event time
        //         s: 'ETHBTC',      // symbol
        //         t: 158410082,     // trade id
        //         p: '0.01914100',  // price
        //         q: '0.00700000',  // quantity
        //         b: 586187049,     // buyer order id
        //         a: 586186710,     // seller order id
        //         T: 1579481530910, // trade time
        //         m: false,         // is the buyer the market maker
        //         M: true           // binance docs say it should be ignored
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
        const event = this.safeString (trade, 'e');
        if (event === undefined) {
            return super.parseTrade (trade, market);
        }
        const id = this.safeString2 (trade, 't', 'a');
        const timestamp = this.safeInteger (trade, 'T');
        const price = this.safeFloat (trade, 'p');
        const amount = this.safeFloat (trade, 'q');
        let cost = undefined;
        if ((price !== undefined) && (amount !== undefined)) {
            cost = price * amount;
        }
        const marketId = this.safeString (trade, 's');
        const symbol = this.safeSymbol (marketId);
        let side = undefined;
        let takerOrMaker = undefined;
        const orderId = undefined;
        if ('m' in trade) {
            side = trade['m'] ? 'sell' : 'buy'; // this is reversed intentionally
            takerOrMaker = trade['m'] ? 'maker' : 'taker';
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    handleTrade (client, message) {
        // the trade streams push raw trade information in real-time
        // each trade has a unique buyer and seller
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const lowerCaseId = this.safeStringLower (message, 's');
        const event = this.safeString (message, 'e');
        const messageHash = lowerCaseId + '@' + event;
        const trade = this.parseTrade (message, market);
        let array = this.safeValue (this.trades, symbol);
        if (array === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            array = new ArrayCache (limit);
        }
        array.append (trade);
        this.trades[symbol] = array;
        client.resolve (array, messageHash);
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['lowercaseId'];
        const interval = this.timeframes[timeframe];
        const name = 'kline';
        const messageHash = marketId + '@' + name + '_' + interval;
        const future = this.watchPublic (messageHash, params);
        return await this.after (future, this.filterBySinceLimit, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        //
        //     {
        //         e: 'kline',
        //         E: 1579482921215,
        //         s: 'ETHBTC',
        //         k: {
        //             t: 1579482900000,
        //             T: 1579482959999,
        //             s: 'ETHBTC',
        //             i: '1m',
        //             f: 158411535,
        //             L: 158411550,
        //             o: '0.01913200',
        //             c: '0.01913500',
        //             h: '0.01913700',
        //             l: '0.01913200',
        //             v: '5.08400000',
        //             n: 16,
        //             x: false,
        //             q: '0.09728060',
        //             V: '3.30200000',
        //             Q: '0.06318500',
        //             B: '0'
        //         }
        //     }
        //
        const marketId = this.safeString (message, 's');
        const lowercaseMarketId = this.safeStringLower (message, 's');
        const event = this.safeString (message, 'e');
        const kline = this.safeValue (message, 'k');
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
        const symbol = this.safeSymbol (marketId);
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCache (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const length = stored.length;
        if (length && (parsed[0] === stored[length - 1][0])) {
            stored[length - 1] = parsed;
        } else {
            stored.append (parsed);
        }
        client.resolve (stored, messageHash);
    }

    async watchPublic (messageHash, params = {}) {
        const defaultType = this.safeString2 (this.options, 'watchOrderBook', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        const url = this.urls['api']['ws'][type];
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
        return await this.watch (url, messageHash, this.extend (request, query), messageHash, subscribe);
    }

    async watchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['lowercaseId'];
        const options = this.safeValue (this.options, 'watchTicker', {});
        const name = this.safeString (options, 'type', 'ticker');
        const messageHash = marketId + '@' + name;
        return await this.watchPublic (messageHash, params);
    }

    handleTicker (client, message) {
        //
        // 24hr rolling window ticker statistics for a single symbol
        // These are NOT the statistics of the UTC day, but a 24hr rolling window for the previous 24hrs
        // Update Speed 1000ms
        //
        //     {
        //         e: '24hrTicker',      // event type
        //         E: 1579485598569,     // event time
        //         s: 'ETHBTC',          // symbol
        //         p: '-0.00004000',     // price change
        //         P: '-0.209',          // price change percent
        //         w: '0.01920495',      // weighted average price
        //         x: '0.01916500',      // the price of the first trade before the 24hr rolling window
        //         c: '0.01912500',      // last (closing) price
        //         Q: '0.10400000',      // last quantity
        //         b: '0.01912200',      // best bid
        //         B: '4.10400000',      // best bid quantity
        //         a: '0.01912500',      // best ask
        //         A: '0.00100000',      // best ask quantity
        //         o: '0.01916500',      // open price
        //         h: '0.01956500',      // high price
        //         l: '0.01887700',      // low price
        //         v: '173518.11900000', // base volume
        //         q: '3332.40703994',   // quote volume
        //         O: 1579399197842,     // open time
        //         C: 1579485597842,     // close time
        //         F: 158251292,         // first trade id
        //         L: 158414513,         // last trade id
        //         n: 163222,            // total number of trades
        //     }
        //
        let event = this.safeString (message, 'e', 'bookTicker');
        if (event === '24hrTicker') {
            event = 'ticker';
        }
        const wsMarketId = this.safeStringLower (message, 's');
        const messageHash = wsMarketId + '@' + event;
        const timestamp = this.safeInteger (message, 'C', this.milliseconds ());
        const marketId = this.safeString (message, 's');
        const symbol = this.safeSymbol (marketId);
        const last = this.safeFloat (message, 'c');
        const result = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (message, 'h'),
            'low': this.safeFloat (message, 'l'),
            'bid': this.safeFloat (message, 'b'),
            'bidVolume': this.safeFloat (message, 'B'),
            'ask': this.safeFloat (message, 'a'),
            'askVolume': this.safeFloat (message, 'A'),
            'vwap': this.safeFloat (message, 'w'),
            'open': this.safeFloat (message, 'o'),
            'close': last,
            'last': last,
            'previousClose': this.safeFloat (message, 'x'), // previous day close
            'change': this.safeFloat (message, 'p'),
            'percentage': this.safeFloat (message, 'P'),
            'average': undefined,
            'baseVolume': this.safeFloat (message, 'v'),
            'quoteVolume': this.safeFloat (message, 'q'),
            'info': message,
        };
        this.tickers[symbol] = result;
        client.resolve (result, messageHash);
    }

    async authenticate (params = {}) {
        const time = this.seconds ();
        const type = this.safeString2 (this.options, 'defaultType', 'authenticate', 'spot');
        const options = this.safeValue (this.options, type, {});
        const lastAuthenticatedTime = this.safeInteger (options, 'lastAuthenticatedTime', 0);
        if (time - lastAuthenticatedTime > 1800) {
            let method = 'publicPostUserDataStream';
            if (type === 'future') {
                method = 'fapiPrivatePostListenKey';
            } else if (type === 'margin') {
                method = 'sapiPostUserDataStream';
            }
            const response = await this[method] ();
            this.options[type] = this.extend (options, {
                'listenKey': this.safeString (response, 'listenKey'),
                'lastAuthenticatedTime': time,
            });
        }
    }

    async watchBalance (params = {}) {
        await this.loadMarkets ();
        await this.authenticate ();
        const defaultType = this.safeString2 (this.options, 'watchBalance', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const url = this.urls['api']['ws'][type] + '/' + this.options[type]['listenKey'];
        const messageHash = 'outboundAccountInfo';
        return await this.watch (url, messageHash);
    }

    handleBalance (client, message) {
        // sent upon creating or filling an order
        //
        //     {
        //         "e": "outboundAccountInfo",   // Event type
        //         "E": 1499405658849,           // Event time
        //         "m": 0,                       // Maker commission rate (bips)
        //         "t": 0,                       // Taker commission rate (bips)
        //         "b": 0,                       // Buyer commission rate (bips)
        //         "s": 0,                       // Seller commission rate (bips)
        //         "T": true,                    // Can trade?
        //         "W": true,                    // Can withdraw?
        //         "D": true,                    // Can deposit?
        //         "u": 1499405658848,           // Time of last account update
        //         "B": [                        // Balances array
        //             {
        //                 "a": "LTC",               // Asset
        //                 "f": "17366.18538083",    // Free amount
        //                 "l": "0.00000000"         // Locked amount
        //             },
        //         ]
        //     }
        //
        const balances = this.safeValue (message, 'B', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'a');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'f');
            account['used'] = this.safeFloat (balance, 'l');
            this.balance[code] = account;
        }
        this.balance = this.parseBalance (this.balance);
        const messageHash = this.safeString (message, 'e');
        client.resolve (this.balance, messageHash);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        await this.authenticate ();
        const defaultType = this.safeString2 (this.options, 'watchOrders', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const url = this.urls['api']['ws'][type] + '/' + this.options[type]['listenKey'];
        const messageHash = 'executionReport';
        const future = this.watch (url, messageHash);
        return await this.after (future, this.filterBySymbolSinceLimit, symbol, since, limit);
    }

    handleOrder (client, message) {
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
        const messageHash = this.safeString (message, 'e');
        const orderId = this.safeString (message, 'i');
        const marketId = this.safeString (message, 's');
        const symbol = this.safeSymbol (marketId);
        const timestamp = this.safeInteger (message, 'O');
        const lastTradeTimestamp = this.safeString (message, 'T');
        const feeAmount = this.safeFloat (message, 'n');
        const feeCurrency = this.safeCurrencyCode (this.safeString (message, 'N'));
        const fee = {
            'cost': feeAmount,
            'currency': feeCurrency,
        };
        const price = this.safeFloat (message, 'p');
        const amount = this.safeFloat (message, 'q');
        const side = this.safeStringLower (message, 'S');
        const type = this.safeStringLower (message, 'o');
        const filled = this.safeFloat (message, 'z');
        const cumulativeQuote = this.safeFloat (message, 'Z');
        let remaining = amount;
        let average = undefined;
        let cost = undefined;
        if (filled !== undefined) {
            if (price !== undefined) {
                cost = filled * price;
            }
            if (amount !== undefined) {
                remaining = Math.max (amount - filled, 0);
            }
            if ((cumulativeQuote !== undefined) && (filled > 0)) {
                average = cumulativeQuote / filled;
            }
        }
        const rawStatus = this.safeString (message, 'X');
        const status = this.parseOrderStatus (rawStatus);
        const trades = undefined;
        const clientOrderId = this.safeString (message, 'c');
        const stopPrice = this.safeFloat (message, 'P');
        const parsed = {
            'info': message,
            'symbol': symbol,
            'id': orderId,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'type': type,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': trades,
        };
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (parsed);
        client.resolve (this.orders, messageHash);
    }

    handleMessage (client, message) {
        const methods = {
            'depthUpdate': this.handleOrderBook,
            'trade': this.handleTrade,
            'aggTrade': this.handleTrade,
            'kline': this.handleOHLCV,
            '24hrTicker': this.handleTicker,
            'bookTicker': this.handleTicker,
            'outboundAccountInfo': this.handleBalance,
            'executionReport': this.handleOrder,
        };
        const event = this.safeString (message, 'e');
        const method = this.safeValue (methods, event);
        if (method === undefined) {
            const requestId = this.safeString (message, 'id');
            if (requestId !== undefined) {
                return this.handleSubscriptionStatus (client, message);
            }
            // special case for the real-time bookTicker, since it comes without an event identifier
            //
            //     {
            //         u: 7488717758,
            //         s: 'BTCUSDT',
            //         b: '28621.74000000',
            //         B: '1.43278800',
            //         a: '28621.75000000',
            //         A: '2.52500800'
            //     }
            //
            if (event === undefined) {
                this.handleTicker (client, message);
            }
        } else {
            return method.call (this, client, message);
        }
    }
};
