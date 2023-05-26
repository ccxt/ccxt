'use strict';

var binance$1 = require('../binance.js');
var Precise = require('../base/Precise.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');

// ----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
class binance extends binance$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
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
            'streaming': {
                'keepAlive': 180000,
            },
            'options': {
                'streamLimits': {
                    'spot': 50,
                    'margin': 50,
                    'future': 50,
                    'delivery': 50, // max 200
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
                'watchOrderBookLimit': 1000,
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
                'watchBalance': {
                    'fetchBalanceSnapshot': false,
                    'awaitBalanceSnapshot': true, // whether to wait for the balance snapshot before providing updates
                },
                'wallet': 'wb',
                'listenKeyRefreshRate': 1200000,
                'ws': {
                    'cost': 5,
                },
            },
        });
    }
    requestId(url) {
        const options = this.safeValue(this.options, 'requestId', {});
        const previousValue = this.safeInteger(options, url, 0);
        const newValue = this.sum(previousValue, 1);
        this.options['requestId'][url] = newValue;
        return newValue;
    }
    stream(type, subscriptionHash) {
        const streamBySubscriptionsHash = this.safeValue(this.options, 'streamBySubscriptionsHash', {});
        let stream = this.safeString(streamBySubscriptionsHash, subscriptionHash);
        if (stream === undefined) {
            let streamIndex = this.safeInteger(this.options, 'streamIndex', -1);
            const streamLimits = this.safeValue(this.options, 'streamLimits');
            const streamLimit = this.safeInteger(streamLimits, type);
            streamIndex = streamIndex + 1;
            const normalizedIndex = streamIndex % streamLimit;
            this.options['streamIndex'] = streamIndex;
            stream = this.numberToString(normalizedIndex);
            this.options['streamBySubscriptionsHash'][subscriptionHash] = stream;
        }
        return stream;
    }
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        //
        // todo add support for <levels>-snapshots (depth)
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/web-socket-streams.md#partial-book-depth-streams        // <symbol>@depth<levels>@100ms or <symbol>@depth<levels> (1000ms)
        // valid <levels> are 5, 10, or 20
        //
        // default 100, max 1000, valid limits 5, 10, 20, 50, 100, 500, 1000
        if (limit !== undefined) {
            if ((limit !== 5) && (limit !== 10) && (limit !== 20) && (limit !== 50) && (limit !== 100) && (limit !== 500) && (limit !== 1000)) {
                throw new errors.ExchangeError(this.id + ' watchOrderBook limit argument must be undefined, 5, 10, 20, 50, 100, 500 or 1000');
            }
        }
        //
        await this.loadMarkets();
        const market = this.market(symbol);
        let type = market['type'];
        if (market['contract']) {
            type = market['linear'] ? 'future' : 'delivery';
        }
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
        const url = this.urls['api']['ws'][type] + '/' + this.stream(type, messageHash);
        const requestId = this.requestId(url);
        const watchOrderBookRate = this.safeString(this.options, 'watchOrderBookRate', '100');
        const request = {
            'method': 'SUBSCRIBE',
            'params': [
                messageHash + '@' + watchOrderBookRate + 'ms',
            ],
            'id': requestId,
        };
        const subscription = {
            'id': requestId.toString(),
            'messageHash': messageHash,
            'name': name,
            'symbol': market['symbol'],
            'method': this.handleOrderBookSubscription,
            'limit': limit,
            'type': type,
            'params': params,
        };
        const message = this.extend(request, params);
        // 1. Open a stream to wss://stream.binance.com:9443/ws/bnbbtc@depth.
        const orderbook = await this.watch(url, messageHash, message, messageHash, subscription);
        return orderbook.limit();
    }
    async fetchOrderBookSnapshot(client, message, subscription) {
        const messageHash = this.safeString(subscription, 'messageHash');
        const symbol = this.safeString(subscription, 'symbol');
        try {
            const defaultLimit = this.safeInteger(this.options, 'watchOrderBookLimit', 1000);
            const type = this.safeValue(subscription, 'type');
            const limit = this.safeInteger(subscription, 'limit', defaultLimit);
            const params = this.safeValue(subscription, 'params');
            // 3. Get a depth snapshot from https://www.binance.com/api/v1/depth?symbol=BNBBTC&limit=1000 .
            // todo: this is a synch blocking call in ccxt.php - make it async
            // default 100, max 1000, valid limits 5, 10, 20, 50, 100, 500, 1000
            const snapshot = await this.fetchOrderBook(symbol, limit, params);
            const orderbook = this.safeValue(this.orderbooks, symbol);
            if (orderbook === undefined) {
                // if the orderbook is dropped before the snapshot is received
                return;
            }
            orderbook.reset(snapshot);
            // unroll the accumulated deltas
            const messages = orderbook.cache;
            for (let i = 0; i < messages.length; i++) {
                const message = messages[i];
                const U = this.safeInteger(message, 'U');
                const u = this.safeInteger(message, 'u');
                const pu = this.safeInteger(message, 'pu');
                if (type === 'future') {
                    // 4. Drop any event where u is < lastUpdateId in the snapshot
                    if (u < orderbook['nonce']) {
                        continue;
                    }
                    // 5. The first processed event should have U <= lastUpdateId AND u >= lastUpdateId
                    if ((U <= orderbook['nonce']) && (u >= orderbook['nonce']) || (pu === orderbook['nonce'])) {
                        this.handleOrderBookMessage(client, message, orderbook);
                    }
                }
                else {
                    // 4. Drop any event where u is <= lastUpdateId in the snapshot
                    if (u <= orderbook['nonce']) {
                        continue;
                    }
                    // 5. The first processed event should have U <= lastUpdateId+1 AND u >= lastUpdateId+1
                    if (((U - 1) <= orderbook['nonce']) && ((u - 1) >= orderbook['nonce'])) {
                        this.handleOrderBookMessage(client, message, orderbook);
                    }
                }
            }
            this.orderbooks[symbol] = orderbook;
            client.resolve(orderbook, messageHash);
        }
        catch (e) {
            delete client.subscriptions[messageHash];
            client.reject(e, messageHash);
        }
    }
    handleDelta(bookside, delta) {
        const price = this.safeFloat(delta, 0);
        const amount = this.safeFloat(delta, 1);
        bookside.store(price, amount);
    }
    handleDeltas(bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta(bookside, deltas[i]);
        }
    }
    handleOrderBookMessage(client, message, orderbook) {
        const u = this.safeInteger(message, 'u');
        this.handleDeltas(orderbook['asks'], this.safeValue(message, 'a', []));
        this.handleDeltas(orderbook['bids'], this.safeValue(message, 'b', []));
        orderbook['nonce'] = u;
        const timestamp = this.safeInteger(message, 'E');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601(timestamp);
        return orderbook;
    }
    handleOrderBook(client, message) {
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
        const isTestnetSpot = client.url.indexOf('testnet') > 0;
        const isSpotMainNet = client.url.indexOf('/stream.binance.') > 0;
        const isSpot = isTestnetSpot || isSpotMainNet;
        const marketType = isSpot ? 'spot' : 'contract';
        const marketId = this.safeString(message, 's');
        const market = this.safeMarket(marketId, undefined, undefined, marketType);
        const symbol = market['symbol'];
        const name = 'depth';
        const messageHash = market['lowercaseId'] + '@' + name;
        const orderbook = this.safeValue(this.orderbooks, symbol);
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
        const nonce = this.safeInteger(orderbook, 'nonce');
        if (nonce === undefined) {
            // 2. Buffer the events you receive from the stream.
            orderbook.cache.push(message);
        }
        else {
            try {
                const U = this.safeInteger(message, 'U');
                const u = this.safeInteger(message, 'u');
                const pu = this.safeInteger(message, 'pu');
                if (pu === undefined) {
                    // spot
                    // 4. Drop any event where u is <= lastUpdateId in the snapshot
                    if (u > orderbook['nonce']) {
                        const timestamp = this.safeInteger(orderbook, 'timestamp');
                        let conditional = undefined;
                        if (timestamp === undefined) {
                            // 5. The first processed event should have U <= lastUpdateId+1 AND u >= lastUpdateId+1
                            conditional = ((U - 1) <= orderbook['nonce']) && ((u - 1) >= orderbook['nonce']);
                        }
                        else {
                            // 6. While listening to the stream, each new event's U should be equal to the previous event's u+1.
                            conditional = ((U - 1) === orderbook['nonce']);
                        }
                        if (conditional) {
                            this.handleOrderBookMessage(client, message, orderbook);
                            if (nonce < orderbook['nonce']) {
                                client.resolve(orderbook, messageHash);
                            }
                        }
                        else {
                            // todo: client.reject from handleOrderBookMessage properly
                            throw new errors.ExchangeError(this.id + ' handleOrderBook received an out-of-order nonce');
                        }
                    }
                }
                else {
                    // future
                    // 4. Drop any event where u is < lastUpdateId in the snapshot
                    if (u >= orderbook['nonce']) {
                        // 5. The first processed event should have U <= lastUpdateId AND u >= lastUpdateId
                        // 6. While listening to the stream, each new event's pu should be equal to the previous event's u, otherwise initialize the process from step 3
                        if ((U <= orderbook['nonce']) || (pu === orderbook['nonce'])) {
                            this.handleOrderBookMessage(client, message, orderbook);
                            if (nonce <= orderbook['nonce']) {
                                client.resolve(orderbook, messageHash);
                            }
                        }
                        else {
                            // todo: client.reject from handleOrderBookMessage properly
                            throw new errors.ExchangeError(this.id + ' handleOrderBook received an out-of-order nonce');
                        }
                    }
                }
            }
            catch (e) {
                delete this.orderbooks[symbol];
                delete client.subscriptions[messageHash];
                client.reject(e, messageHash);
            }
        }
    }
    handleOrderBookSubscription(client, message, subscription) {
        const defaultLimit = this.safeInteger(this.options, 'watchOrderBookLimit', 1000);
        const symbol = this.safeString(subscription, 'symbol');
        const limit = this.safeInteger(subscription, 'limit', defaultLimit);
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        this.orderbooks[symbol] = this.orderBook({}, limit);
        // fetch the snapshot in a separate async call
        this.spawn(this.fetchOrderBookSnapshot, client, message, subscription);
    }
    handleSubscriptionStatus(client, message) {
        //
        //     {
        //         "result": null,
        //         "id": 1574649734450
        //     }
        //
        const id = this.safeString(message, 'id');
        const subscriptionsById = this.indexBy(client.subscriptions, 'id');
        const subscription = this.safeValue(subscriptionsById, id, {});
        const method = this.safeValue(subscription, 'method');
        if (method !== undefined) {
            method.call(this, client, message, subscription);
        }
        return message;
    }
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const options = this.safeValue(this.options, 'watchTrades', {});
        const name = this.safeString(options, 'name', 'trade');
        const messageHash = market['lowercaseId'] + '@' + name;
        let type = market['type'];
        if (market['contract']) {
            type = market['linear'] ? 'future' : 'delivery';
        }
        const query = this.omit(params, 'type');
        const url = this.urls['api']['ws'][type] + '/' + this.stream(type, messageHash);
        const requestId = this.requestId(url);
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
        const trades = await this.watch(url, messageHash, this.extend(request, query), messageHash, subscribe);
        if (this.newUpdates) {
            limit = trades.getLimit(market['symbol'], limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp');
    }
    parseTrade(trade, market = undefined) {
        //
        // public watchTrades
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
        // private watchMyTrades spot
        //
        //     {
        //         e: 'executionReport',
        //         E: 1611063861489,
        //         s: 'BNBUSDT',
        //         c: 'm4M6AD5MF3b1ERe65l4SPq',
        //         S: 'BUY',
        //         o: 'MARKET',
        //         f: 'GTC',
        //         q: '2.00000000',
        //         p: '0.00000000',
        //         P: '0.00000000',
        //         F: '0.00000000',
        //         g: -1,
        //         C: '',
        //         x: 'TRADE',
        //         X: 'PARTIALLY_FILLED',
        //         r: 'NONE',
        //         i: 1296882607,
        //         l: '0.33200000',
        //         z: '0.33200000',
        //         L: '46.86600000',
        //         n: '0.00033200',
        //         N: 'BNB',
        //         T: 1611063861488,
        //         t: 109747654,
        //         I: 2696953381,
        //         w: false,
        //         m: false,
        //         M: true,
        //         O: 1611063861488,
        //         Z: '15.55951200',
        //         Y: '15.55951200',
        //         Q: '0.00000000'
        //     }
        //
        // private watchMyTrades future/delivery
        //
        //     {
        //         s: 'BTCUSDT',
        //         c: 'pb2jD6ZQHpfzSdUac8VqMK',
        //         S: 'SELL',
        //         o: 'MARKET',
        //         f: 'GTC',
        //         q: '0.001',
        //         p: '0',
        //         ap: '33468.46000',
        //         sp: '0',
        //         x: 'TRADE',
        //         X: 'FILLED',
        //         i: 13351197194,
        //         l: '0.001',
        //         z: '0.001',
        //         L: '33468.46',
        //         n: '0.00027086',
        //         N: 'BNB',
        //         T: 1612095165362,
        //         t: 458032604,
        //         b: '0',
        //         a: '0',
        //         m: false,
        //         R: false,
        //         wt: 'CONTRACT_PRICE',
        //         ot: 'MARKET',
        //         ps: 'BOTH',
        //         cp: false,
        //         rp: '0.00335000',
        //         pP: false,
        //         si: 0,
        //         ss: 0
        //     }
        //
        const executionType = this.safeString(trade, 'x');
        const isTradeExecution = (executionType === 'TRADE');
        if (!isTradeExecution) {
            return super.parseTrade(trade, market);
        }
        const id = this.safeString2(trade, 't', 'a');
        const timestamp = this.safeInteger(trade, 'T');
        const price = this.safeString2(trade, 'L', 'p');
        let amount = this.safeString(trade, 'q');
        if (isTradeExecution) {
            amount = this.safeString(trade, 'l', amount);
        }
        let cost = this.safeString(trade, 'Y');
        if (cost === undefined) {
            if ((price !== undefined) && (amount !== undefined)) {
                cost = Precise["default"].stringMul(price, amount);
            }
        }
        const marketId = this.safeString(trade, 's');
        const marketType = ('ps' in trade) ? 'contract' : 'spot';
        const symbol = this.safeSymbol(marketId, undefined, undefined, marketType);
        let side = this.safeStringLower(trade, 'S');
        let takerOrMaker = undefined;
        const orderId = this.safeString(trade, 'i');
        if ('m' in trade) {
            if (side === undefined) {
                side = trade['m'] ? 'sell' : 'buy'; // this is reversed intentionally
            }
            takerOrMaker = trade['m'] ? 'maker' : 'taker';
        }
        let fee = undefined;
        const feeCost = this.safeString(trade, 'n');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString(trade, 'N');
            const feeCurrencyCode = this.safeCurrencyCode(feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const type = this.safeStringLower(trade, 'o');
        return this.safeTrade({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
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
    handleTrade(client, message) {
        // the trade streams push raw trade information in real-time
        // each trade has a unique buyer and seller
        const index = client.url.indexOf('/stream');
        const marketType = (index >= 0) ? 'spot' : 'contract';
        const marketId = this.safeString(message, 's');
        const market = this.safeMarket(marketId, undefined, undefined, marketType);
        const symbol = market['symbol'];
        const lowerCaseId = this.safeStringLower(message, 's');
        const event = this.safeString(message, 'e');
        const messageHash = lowerCaseId + '@' + event;
        const trade = this.parseTrade(message, market);
        let tradesArray = this.safeValue(this.trades, symbol);
        if (tradesArray === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            tradesArray = new Cache.ArrayCache(limit);
        }
        tradesArray.append(trade);
        this.trades[symbol] = tradesArray;
        client.resolve(tradesArray, messageHash);
    }
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        let marketId = market['lowercaseId'];
        const interval = this.safeString(this.timeframes, timeframe, timeframe);
        const options = this.safeValue(this.options, 'watchOHLCV', {});
        const nameOption = this.safeString(options, 'name', 'kline');
        const name = this.safeString(params, 'name', nameOption);
        if (name === 'indexPriceKline') {
            // weird behavior for index price kline we can't use the perp suffix
            marketId = marketId.replace('_perp', '');
        }
        params = this.omit(params, 'name');
        const messageHash = marketId + '@' + name + '_' + interval;
        let type = market['type'];
        if (market['contract']) {
            type = market['linear'] ? 'future' : 'delivery';
        }
        const url = this.urls['api']['ws'][type] + '/' + this.stream(type, messageHash);
        const requestId = this.requestId(url);
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
        const ohlcv = await this.watch(url, messageHash, this.extend(request, params), messageHash, subscribe);
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0);
    }
    handleOHLCV(client, message) {
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
        let event = this.safeString(message, 'e');
        const eventMap = {
            'indexPrice_kline': 'indexPriceKline',
            'markPrice_kline': 'markPriceKline',
        };
        event = this.safeString(eventMap, event, event);
        const kline = this.safeValue(message, 'k');
        let marketId = this.safeString2(kline, 's', 'ps');
        if (event === 'indexPriceKline') {
            // indexPriceKline doesn't have the _PERP suffix
            marketId = this.safeString(message, 'ps');
        }
        const lowercaseMarketId = marketId.toLowerCase();
        const interval = this.safeString(kline, 'i');
        // use a reverse lookup in a static map instead
        const timeframe = this.findTimeframe(interval);
        const messageHash = lowercaseMarketId + '@' + event + '_' + interval;
        const parsed = [
            this.safeInteger(kline, 't'),
            this.safeFloat(kline, 'o'),
            this.safeFloat(kline, 'h'),
            this.safeFloat(kline, 'l'),
            this.safeFloat(kline, 'c'),
            this.safeFloat(kline, 'v'),
        ];
        const index = client.url.indexOf('/stream');
        const marketType = (index >= 0) ? 'spot' : 'contract';
        const symbol = this.safeSymbol(marketId, undefined, undefined, marketType);
        this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
        let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            stored = new Cache.ArrayCacheByTimestamp(limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        stored.append(parsed);
        client.resolve(stored, messageHash);
    }
    async watchTicker(symbol, params = {}) {
        /**
         * @method
         * @name binance#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the binance api endpoint
         * @param {string} params.name stream to use can be ticker or bookTicker
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const marketId = market['lowercaseId'];
        let type = market['type'];
        if (market['contract']) {
            type = market['linear'] ? 'future' : 'delivery';
        }
        const options = this.safeValue(this.options, 'watchTicker', {});
        let name = this.safeString(options, 'name', 'ticker');
        name = this.safeString(params, 'name', name);
        params = this.omit(params, 'name');
        const messageHash = marketId + '@' + name;
        const url = this.urls['api']['ws'][type] + '/' + this.stream(type, messageHash);
        const requestId = this.requestId(url);
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
        return await this.watch(url, messageHash, this.extend(request, params), messageHash, subscribe);
    }
    async watchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name binance#watchTickers
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
         * @param {[string]} symbols unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const marketIds = this.marketIds(symbols);
        let market = undefined;
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('watchTickers', market, params);
        if (marketIds !== undefined) {
            market = this.safeMarket(marketIds[0], undefined, undefined, type);
        }
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('watchTickers', market, params);
        if (this.isLinear(type, subType)) {
            type = 'future';
        }
        else if (this.isInverse(type, subType)) {
            type = 'delivery';
        }
        const options = this.safeValue(this.options, 'watchTickers', {});
        let name = this.safeString(options, 'name', 'ticker');
        name = this.safeString(params, 'name', name);
        const oriParams = params;
        params = this.omit(params, 'name');
        let wsParams = [];
        const messageHash = '!' + name + '@arr';
        if (name === 'bookTicker') {
            if (marketIds === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' watchTickers() requires symbols for bookTicker');
            }
            // simulate watchTickers with subscribe multiple individual bookTicker topic
            for (let i = 0; i < marketIds.length; i++) {
                wsParams.push(marketIds[i].toLowerCase() + '@bookTicker');
            }
        }
        else {
            wsParams = [
                messageHash,
            ];
        }
        const url = this.urls['api']['ws'][type] + '/' + this.stream(type, messageHash);
        const requestId = this.requestId(url);
        const request = {
            'method': 'SUBSCRIBE',
            'params': wsParams,
            'id': requestId,
        };
        const subscribe = {
            'id': requestId,
        };
        const tickers = await this.watch(url, messageHash, this.extend(request, params), messageHash, subscribe);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = tickers[i];
            const tickerSymbol = ticker['symbol'];
            if (symbols === undefined || this.inArray(tickerSymbol, symbols)) {
                result[tickerSymbol] = ticker;
            }
        }
        const resultKeys = Object.keys(result);
        const resultKeysLength = resultKeys.length;
        if (resultKeysLength > 0) {
            if (this.newUpdates) {
                return result;
            }
            return this.filterByArray(this.tickers, 'symbol', symbols);
        }
        return await this.watchTickers(symbols, oriParams);
    }
    parseWsTicker(message, marketType) {
        //
        // ticker
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
        // miniTicker
        //     {
        //         e: '24hrMiniTicker',
        //         E: 1671617114585,
        //         s: 'MOBBUSD',
        //         c: '0.95900000',
        //         o: '0.91200000',
        //         h: '1.04000000',
        //         l: '0.89400000',
        //         v: '2109995.32000000',
        //         q: '2019254.05788000'
        //     }
        //
        let event = this.safeString(message, 'e', 'bookTicker');
        if (event === '24hrTicker') {
            event = 'ticker';
        }
        let timestamp = undefined;
        const now = this.milliseconds();
        if (event === 'bookTicker') {
            // take the event timestamp, if available, for spot tickers it is not
            timestamp = this.safeInteger(message, 'E', now);
        }
        else {
            // take the timestamp of the closing price for candlestick streams
            timestamp = this.safeInteger(message, 'C', now);
        }
        const marketId = this.safeString(message, 's');
        const symbol = this.safeSymbol(marketId, undefined, undefined, marketType);
        const last = this.safeFloat(message, 'c');
        const ticker = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeFloat(message, 'h'),
            'low': this.safeFloat(message, 'l'),
            'bid': this.safeFloat(message, 'b'),
            'bidVolume': this.safeFloat(message, 'B'),
            'ask': this.safeFloat(message, 'a'),
            'askVolume': this.safeFloat(message, 'A'),
            'vwap': this.safeFloat(message, 'w'),
            'open': this.safeFloat(message, 'o'),
            'close': last,
            'last': last,
            'previousClose': this.safeFloat(message, 'x'),
            'change': this.safeFloat(message, 'p'),
            'percentage': this.safeFloat(message, 'P'),
            'average': undefined,
            'baseVolume': this.safeFloat(message, 'v'),
            'quoteVolume': this.safeFloat(message, 'q'),
            'info': message,
        };
        return ticker;
    }
    handleTicker(client, message) {
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
        let event = this.safeString(message, 'e', 'bookTicker');
        if (event === '24hrTicker') {
            event = 'ticker';
        }
        else if (event === '24hrMiniTicker') {
            event = 'miniTicker';
        }
        const wsMarketId = this.safeStringLower(message, 's');
        const messageHash = wsMarketId + '@' + event;
        const index = client.url.indexOf('/stream');
        const marketType = (index >= 0) ? 'spot' : 'contract';
        const result = this.parseWsTicker(message, marketType);
        const symbol = result['symbol'];
        this.tickers[symbol] = result;
        client.resolve(result, messageHash);
        if (event === 'bookTicker') {
            // watch bookTickers
            client.resolve([result], '!' + 'bookTicker@arr');
        }
    }
    handleTickers(client, message) {
        let event = undefined;
        const index = client.url.indexOf('/stream');
        const marketType = (index >= 0) ? 'spot' : 'contract';
        for (let i = 0; i < message.length; i++) {
            const ticker = message[i];
            event = this.safeString(ticker, 'e');
            if (event === '24hrTicker') {
                event = 'ticker';
            }
            else if (event === '24hrMiniTicker') {
                event = 'miniTicker';
            }
            const wsMarketId = this.safeStringLower(ticker, 's');
            const messageHash = wsMarketId + '@' + event;
            const result = this.parseWsTicker(ticker, marketType);
            const symbol = result['symbol'];
            this.tickers[symbol] = result;
            client.resolve(result, messageHash);
        }
        const values = Object.values(this.tickers);
        client.resolve(values, '!' + event + '@arr');
    }
    async authenticate(params = {}) {
        const time = this.milliseconds();
        let type = this.safeString2(this.options, 'defaultType', 'authenticate', 'spot');
        type = this.safeString(params, 'type', type);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('authenticate', undefined, params);
        if (this.isLinear(type, subType)) {
            type = 'future';
        }
        else if (this.isInverse(type, subType)) {
            type = 'delivery';
        }
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('authenticate', params);
        const isIsolatedMargin = (marginMode === 'isolated');
        const isCrossMargin = (marginMode === 'cross') || (marginMode === undefined);
        const symbol = this.safeString(params, 'symbol');
        params = this.omit(params, 'symbol');
        const options = this.safeValue(this.options, type, {});
        const lastAuthenticatedTime = this.safeInteger(options, 'lastAuthenticatedTime', 0);
        const listenKeyRefreshRate = this.safeInteger(this.options, 'listenKeyRefreshRate', 1200000);
        const delay = this.sum(listenKeyRefreshRate, 10000);
        if (time - lastAuthenticatedTime > delay) {
            let method = 'publicPostUserDataStream';
            if (type === 'future') {
                method = 'fapiPrivatePostListenKey';
            }
            else if (type === 'delivery') {
                method = 'dapiPrivatePostListenKey';
            }
            else if (type === 'margin' && isCrossMargin) {
                method = 'sapiPostUserDataStream';
            }
            else if (isIsolatedMargin) {
                method = 'sapiPostUserDataStreamIsolated';
                if (symbol === undefined) {
                    throw new errors.ArgumentsRequired(this.id + ' authenticate() requires a symbol argument for isolated margin mode');
                }
                const marketId = this.marketId(symbol);
                params = this.extend(params, { 'symbol': marketId });
            }
            const response = await this[method](params);
            this.options[type] = this.extend(options, {
                'listenKey': this.safeString(response, 'listenKey'),
                'lastAuthenticatedTime': time,
            });
            this.delay(listenKeyRefreshRate, this.keepAliveListenKey, params);
        }
    }
    async keepAliveListenKey(params = {}) {
        // https://binance-docs.github.io/apidocs/spot/en/#listen-key-spot
        let type = this.safeString2(this.options, 'defaultType', 'authenticate', 'spot');
        type = this.safeString(params, 'type', type);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('keepAliveListenKey', undefined, params);
        if (this.isLinear(type, subType)) {
            type = 'future';
        }
        else if (this.isInverse(type, subType)) {
            type = 'delivery';
        }
        const options = this.safeValue(this.options, type, {});
        const listenKey = this.safeString(options, 'listenKey');
        if (listenKey === undefined) {
            // A network error happened: we can't renew a listen key that does not exist.
            return;
        }
        let method = 'publicPutUserDataStream';
        if (type === 'future') {
            method = 'fapiPrivatePutListenKey';
        }
        else if (type === 'delivery') {
            method = 'dapiPrivatePutListenKey';
        }
        else if (type === 'margin') {
            method = 'sapiPutUserDataStream';
        }
        const request = {
            'listenKey': listenKey,
        };
        const time = this.milliseconds();
        const sendParams = this.omit(params, 'type');
        try {
            await this[method](this.extend(request, sendParams));
        }
        catch (error) {
            const url = this.urls['api']['ws'][type] + '/' + this.options[type]['listenKey'];
            const client = this.client(url);
            const messageHashes = Object.keys(client.futures);
            for (let i = 0; i < messageHashes.length; i++) {
                const messageHash = messageHashes[i];
                client.reject(error, messageHash);
            }
            this.options[type] = this.extend(options, {
                'listenKey': undefined,
                'lastAuthenticatedTime': 0,
            });
            return;
        }
        this.options[type] = this.extend(options, {
            'listenKey': listenKey,
            'lastAuthenticatedTime': time,
        });
        // whether or not to schedule another listenKey keepAlive request
        const clients = Object.values(this.clients);
        const listenKeyRefreshRate = this.safeInteger(this.options, 'listenKeyRefreshRate', 1200000);
        for (let i = 0; i < clients.length; i++) {
            const client = clients[i];
            const subscriptionKeys = Object.keys(client.subscriptions);
            for (let j = 0; j < subscriptionKeys.length; j++) {
                const subscribeType = subscriptionKeys[j];
                if (subscribeType === type) {
                    return this.delay(listenKeyRefreshRate, this.keepAliveListenKey, params);
                }
            }
        }
    }
    setBalanceCache(client, type) {
        if (type in client.subscriptions) {
            return undefined;
        }
        const options = this.safeValue(this.options, 'watchBalance');
        const fetchBalanceSnapshot = this.safeValue(options, 'fetchBalanceSnapshot', false);
        if (fetchBalanceSnapshot) {
            const messageHash = type + ':fetchBalanceSnapshot';
            if (!(messageHash in client.futures)) {
                client.future(messageHash);
                this.spawn(this.loadBalanceSnapshot, client, messageHash, type);
            }
        }
        else {
            this.balance[type] = {};
        }
    }
    async loadBalanceSnapshot(client, messageHash, type) {
        const response = await this.fetchBalance({ 'type': type });
        this.balance[type] = this.extend(response, this.safeValue(this.balance, type, {}));
        // don't remove the future from the .futures cache
        const future = client.futures[messageHash];
        future.resolve();
        client.resolve(this.balance[type], type + ':balance');
    }
    async watchBalance(params = {}) {
        /**
         * @method
         * @name binance#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets();
        await this.authenticate(params);
        const defaultType = this.safeString(this.options, 'defaultType', 'spot');
        let type = this.safeString(params, 'type', defaultType);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('watchBalance', undefined, params);
        if (this.isLinear(type, subType)) {
            type = 'future';
        }
        else if (this.isInverse(type, subType)) {
            type = 'delivery';
        }
        const url = this.urls['api']['ws'][type] + '/' + this.options[type]['listenKey'];
        const client = this.client(url);
        this.setBalanceCache(client, type);
        const options = this.safeValue(this.options, 'watchBalance');
        const fetchBalanceSnapshot = this.safeValue(options, 'fetchBalanceSnapshot', false);
        const awaitBalanceSnapshot = this.safeValue(options, 'awaitBalanceSnapshot', true);
        if (fetchBalanceSnapshot && awaitBalanceSnapshot) {
            await client.future(type + ':fetchBalanceSnapshot');
        }
        const messageHash = type + ':balance';
        const message = undefined;
        return await this.watch(url, messageHash, message, type);
    }
    handleBalance(client, message) {
        //
        // sent upon a balance update not related to orders
        //
        //     {
        //         e: 'balanceUpdate',
        //         E: 1629352505586,
        //         a: 'IOTX',
        //         d: '0.43750000',
        //         T: 1629352505585
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
        const wallet = this.safeValue(this.options, 'wallet', 'wb'); // cw for cross wallet
        // each account is connected to a different endpoint
        // and has exactly one subscriptionhash which is the account type
        const subscriptions = Object.keys(client.subscriptions);
        const accountType = subscriptions[0];
        const messageHash = accountType + ':balance';
        this.balance[accountType]['info'] = message;
        const event = this.safeString(message, 'e');
        if (event === 'balanceUpdate') {
            const currencyId = this.safeString(message, 'a');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            const delta = this.safeString(message, 'd');
            if (code in this.balance[accountType]) {
                let previousValue = this.balance[accountType][code]['free'];
                if (typeof previousValue !== 'string') {
                    previousValue = this.numberToString(previousValue);
                }
                account['free'] = Precise["default"].stringAdd(previousValue, delta);
            }
            else {
                account['free'] = delta;
            }
            this.balance[accountType][code] = account;
        }
        else {
            message = this.safeValue(message, 'a', message);
            const B = this.safeValue(message, 'B');
            for (let i = 0; i < B.length; i++) {
                const entry = B[i];
                const currencyId = this.safeString(entry, 'a');
                const code = this.safeCurrencyCode(currencyId);
                const account = this.account();
                account['free'] = this.safeString(entry, 'f');
                account['used'] = this.safeString(entry, 'l');
                account['total'] = this.safeString(entry, wallet);
                this.balance[accountType][code] = account;
            }
        }
        const timestamp = this.safeInteger(message, 'E');
        this.balance[accountType]['timestamp'] = timestamp;
        this.balance[accountType]['datetime'] = this.iso8601(timestamp);
        this.balance[accountType] = this.safeBalance(this.balance[accountType]);
        client.resolve(this.balance[accountType], messageHash);
    }
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let messageHash = 'orders';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
            params = this.extend(params, { 'symbol': symbol }); // needed inside authenticate for isolated margin
        }
        await this.authenticate(params);
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('watchOrders', market, params);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('watchOrders', market, params);
        if (this.isLinear(type, subType)) {
            type = 'future';
        }
        else if (this.isInverse(type, subType)) {
            type = 'delivery';
        }
        const url = this.urls['api']['ws'][type] + '/' + this.options[type]['listenKey'];
        const client = this.client(url);
        this.setBalanceCache(client, type);
        const message = undefined;
        const orders = await this.watch(url, messageHash, message, type);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit);
    }
    parseWsOrder(order, market = undefined) {
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
        const executionType = this.safeString(order, 'x');
        const orderId = this.safeString(order, 'i');
        const marketId = this.safeString(order, 's');
        const marketType = ('ps' in order) ? 'contract' : 'spot';
        const symbol = this.safeSymbol(marketId, undefined, undefined, marketType);
        let timestamp = this.safeInteger(order, 'O');
        const T = this.safeInteger(order, 'T');
        let lastTradeTimestamp = undefined;
        if (executionType === 'NEW') {
            if (timestamp === undefined) {
                timestamp = T;
            }
        }
        else if (executionType === 'TRADE') {
            lastTradeTimestamp = T;
        }
        let fee = undefined;
        const feeCost = this.safeString(order, 'n');
        if ((feeCost !== undefined) && (Precise["default"].stringGt(feeCost, '0'))) {
            const feeCurrencyId = this.safeString(order, 'N');
            const feeCurrency = this.safeCurrencyCode(feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        const price = this.safeString(order, 'p');
        const amount = this.safeString(order, 'q');
        const side = this.safeStringLower(order, 'S');
        const type = this.safeStringLower(order, 'o');
        const filled = this.safeString(order, 'z');
        const cost = this.safeString(order, 'Z');
        const average = this.safeString(order, 'ap');
        const rawStatus = this.safeString(order, 'X');
        const status = this.parseOrderStatus(rawStatus);
        const trades = undefined;
        let clientOrderId = this.safeString(order, 'C');
        if ((clientOrderId === undefined) || (clientOrderId.length === 0)) {
            clientOrderId = this.safeString(order, 'c');
        }
        const stopPrice = this.safeString2(order, 'P', 'sp');
        let timeInForce = this.safeString(order, 'f');
        if (timeInForce === 'GTX') {
            // GTX means "Good Till Crossing" and is an equivalent way of saying Post Only
            timeInForce = 'PO';
        }
        return this.safeOrder({
            'info': order,
            'symbol': symbol,
            'id': orderId,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'reduceOnly': this.safeValue(order, 'R'),
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
    handleOrderUpdate(client, message) {
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
        const e = this.safeString(message, 'e');
        if (e === 'ORDER_TRADE_UPDATE') {
            message = this.safeValue(message, 'o', message);
        }
        this.handleMyTrade(client, message);
        this.handleOrder(client, message);
    }
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure
         */
        await this.loadMarkets();
        const defaultType = this.safeString2(this.options, 'watchMyTrades', 'defaultType', 'spot');
        let type = this.safeString(params, 'type', defaultType);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('watchMyTrades', undefined, params);
        if (this.isLinear(type, subType)) {
            type = 'future';
        }
        else if (this.isInverse(type, subType)) {
            type = 'delivery';
        }
        let messageHash = 'myTrades';
        if (symbol !== undefined) {
            symbol = this.symbol(symbol);
            messageHash += ':' + symbol;
            params = this.extend(params, { 'symbol': symbol });
        }
        await this.authenticate(params);
        const url = this.urls['api']['ws'][type] + '/' + this.options[type]['listenKey'];
        const client = this.client(url);
        this.setBalanceCache(client, type);
        const message = undefined;
        const trades = await this.watch(url, messageHash, message, type);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit);
    }
    handleMyTrade(client, message) {
        const messageHash = 'myTrades';
        const executionType = this.safeString(message, 'x');
        if (executionType === 'TRADE') {
            const trade = this.parseTrade(message);
            const orderId = this.safeString(trade, 'order');
            const tradeFee = this.safeValue(trade, 'fee');
            const symbol = this.safeString(trade, 'symbol');
            if (orderId !== undefined && tradeFee !== undefined && symbol !== undefined) {
                const cachedOrders = this.orders;
                if (cachedOrders !== undefined) {
                    const orders = this.safeValue(cachedOrders.hashmap, symbol, {});
                    const order = this.safeValue(orders, orderId);
                    if (order !== undefined) {
                        // accumulate order fees
                        const fees = this.safeValue(order, 'fees');
                        const fee = this.safeValue(order, 'fee');
                        if (fees !== undefined) {
                            let insertNewFeeCurrency = true;
                            for (let i = 0; i < fees.length; i++) {
                                const orderFee = fees[i];
                                if (orderFee['currency'] === tradeFee['currency']) {
                                    const feeCost = this.sum(tradeFee['cost'], orderFee['cost']);
                                    order['fees'][i]['cost'] = parseFloat(this.currencyToPrecision(tradeFee['currency'], feeCost));
                                    insertNewFeeCurrency = false;
                                    break;
                                }
                            }
                            if (insertNewFeeCurrency) {
                                order['fees'].push(tradeFee);
                            }
                        }
                        else if (fee !== undefined) {
                            if (fee['currency'] === tradeFee['currency']) {
                                const feeCost = this.sum(fee['cost'], tradeFee['cost']);
                                order['fee']['cost'] = parseFloat(this.currencyToPrecision(tradeFee['currency'], feeCost));
                            }
                            else if (fee['currency'] === undefined) {
                                order['fee'] = tradeFee;
                            }
                            else {
                                order['fees'] = [fee, tradeFee];
                                order['fee'] = undefined;
                            }
                        }
                        else {
                            order['fee'] = tradeFee;
                        }
                        // save this trade in the order
                        const orderTrades = this.safeValue(order, 'trades', []);
                        orderTrades.push(trade);
                        order['trades'] = orderTrades;
                        // don't append twice cause it breaks newUpdates mode
                        // this order already exists in the cache
                    }
                }
            }
            if (this.myTrades === undefined) {
                const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
                this.myTrades = new Cache.ArrayCacheBySymbolById(limit);
            }
            const myTrades = this.myTrades;
            myTrades.append(trade);
            client.resolve(this.myTrades, messageHash);
            const messageHashSymbol = messageHash + ':' + symbol;
            client.resolve(this.myTrades, messageHashSymbol);
        }
    }
    handleOrder(client, message) {
        const messageHash = 'orders';
        const parsed = this.parseWsOrder(message);
        const symbol = this.safeString(parsed, 'symbol');
        const orderId = this.safeString(parsed, 'id');
        if (symbol !== undefined) {
            if (this.orders === undefined) {
                const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
                this.orders = new Cache.ArrayCacheBySymbolById(limit);
            }
            const cachedOrders = this.orders;
            const orders = this.safeValue(cachedOrders.hashmap, symbol, {});
            const order = this.safeValue(orders, orderId);
            if (order !== undefined) {
                const fee = this.safeValue(order, 'fee');
                if (fee !== undefined) {
                    parsed['fee'] = fee;
                }
                const fees = this.safeValue(order, 'fees');
                if (fees !== undefined) {
                    parsed['fees'] = fees;
                }
                parsed['trades'] = this.safeValue(order, 'trades');
                parsed['timestamp'] = this.safeInteger(order, 'timestamp');
                parsed['datetime'] = this.safeString(order, 'datetime');
            }
            cachedOrders.append(parsed);
            client.resolve(this.orders, messageHash);
            const messageHashSymbol = messageHash + ':' + symbol;
            client.resolve(this.orders, messageHashSymbol);
        }
    }
    handleMessage(client, message) {
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
            'ACCOUNT_UPDATE': this.handleBalance,
            'executionReport': this.handleOrderUpdate,
            'ORDER_TRADE_UPDATE': this.handleOrderUpdate,
        };
        let event = this.safeString(message, 'e');
        if (Array.isArray(message)) {
            const data = message[0];
            event = this.safeString(data, 'e') + '@arr';
        }
        const method = this.safeValue(methods, event);
        if (method === undefined) {
            const requestId = this.safeString(message, 'id');
            if (requestId !== undefined) {
                return this.handleSubscriptionStatus(client, message);
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
                this.handleTicker(client, message);
            }
        }
        else {
            return method.call(this, client, message);
        }
    }
}

module.exports = binance;
