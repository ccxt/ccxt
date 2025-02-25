'use strict';

var hitbtc$1 = require('../hitbtc.js');
var Cache = require('../base/ws/Cache.js');
var sha256 = require('../static_dependencies/noble-hashes/sha256.js');
var errors = require('../base/errors.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class hitbtc extends hitbtc$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchBidsAsks': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchOrderBook': true,
                'watchBalance': true,
                'watchOrders': true,
                'watchOHLCV': true,
                'watchMyTrades': false,
                'createOrderWs': true,
                'cancelOrderWs': true,
                'fetchOpenOrdersWs': true,
                'cancelAllOrdersWs': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://api.hitbtc.com/api/3/ws/public',
                        'private': 'wss://api.hitbtc.com/api/3/ws/trading',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://api.demo.hitbtc.com/api/3/ws/public',
                        'private': 'wss://api.demo.hitbtc.com/api/3/ws/trading',
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
                'watchTicker': {
                    'method': 'ticker/{speed}', // 'ticker/{speed}' or 'ticker/price/{speed}'
                },
                'watchTickers': {
                    'method': 'ticker/{speed}', // 'ticker/{speed}','ticker/price/{speed}', 'ticker/{speed}/batch', or 'ticker/{speed}/price/batch''
                },
                'watchBidsAsks': {
                    'method': 'orderbook/top/{speed}', // 'orderbook/top/{speed}', 'orderbook/top/{speed}/batch'
                },
                'watchOrderBook': {
                    'method': 'orderbook/full', // 'orderbook/full', 'orderbook/{depth}/{speed}', 'orderbook/{depth}/{speed}/batch'
                },
            },
            'timeframes': {
                '1m': 'M1',
                '3m': 'M3',
                '5m': 'M5',
                '15m': 'M15',
                '30m': 'M30',
                '1h': 'H1',
                '4h': 'H4',
                '1d': 'D1',
                '1w': 'D7',
                '1M': '1M',
            },
            'streaming': {
                'keepAlive': 4000,
            },
        });
    }
    /**
     * @ignore
     * @method
     * @description authenticates the user to access private web socket channels
     * @see https://api.hitbtc.com/#socket-authentication
     * @returns {object} response from exchange
     */
    async authenticate() {
        this.checkRequiredCredentials();
        const url = this.urls['api']['ws']['private'];
        const messageHash = 'authenticated';
        const client = this.client(url);
        const future = client.future(messageHash);
        const authenticated = this.safeValue(client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const timestamp = this.milliseconds();
            const signature = this.hmac(this.encode(this.numberToString(timestamp)), this.encode(this.secret), sha256.sha256, 'hex');
            const request = {
                'method': 'login',
                'params': {
                    'type': 'HS256',
                    'api_key': this.apiKey,
                    'timestamp': timestamp,
                    'signature': signature,
                },
            };
            this.watch(url, messageHash, request, messageHash);
            //
            //    {
            //        "jsonrpc": "2.0",
            //        "result": true
            //    }
            //
            //    # Failure to return results
            //
            //    {
            //        "jsonrpc": "2.0",
            //        "error": {
            //            "code": 1002,
            //            "message": "Authorization is required or has been failed",
            //            "description": "invalid signature format"
            //        }
            //    }
            //
        }
        return await future;
    }
    /**
     * @ignore
     * @method
     * @param {string} name websocket endpoint name
     * @param {string} messageHashPrefix prefix for the message hash
     * @param {string[]} [symbols] unified CCXT symbol(s)
     * @param {object} [params] extra parameters specific to the hitbtc api
     */
    async subscribePublic(name, messageHashPrefix, symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const isBatch = name.indexOf('batch') >= 0;
        const url = this.urls['api']['ws']['public'];
        const messageHashes = [];
        if (symbols !== undefined && !isBatch) {
            for (let i = 0; i < symbols.length; i++) {
                messageHashes.push(messageHashPrefix + '::' + symbols[i]);
            }
        }
        else {
            messageHashes.push(messageHashPrefix);
        }
        const subscribe = {
            'method': 'subscribe',
            'id': this.nonce(),
            'ch': name,
        };
        const request = this.extend(subscribe, params);
        return await this.watchMultiple(url, messageHashes, request, messageHashes);
    }
    /**
     * @ignore
     * @method
     * @param {string} name websocket endpoint name
     * @param {string} [symbol] unified CCXT symbol
     * @param {object} [params] extra parameters specific to the hitbtc api
     */
    async subscribePrivate(name, symbol = undefined, params = {}) {
        await this.loadMarkets();
        await this.authenticate();
        const url = this.urls['api']['ws']['private'];
        const splitName = name.split('_subscribe');
        let messageHash = this.safeString(splitName, 0);
        if (symbol !== undefined) {
            messageHash = messageHash + '::' + symbol;
        }
        const subscribe = {
            'method': name,
            'params': params,
            'id': this.nonce(),
        };
        return await this.watch(url, messageHash, subscribe, messageHash);
    }
    /**
     * @ignore
     * @method
     * @param {string} name websocket endpoint name
     * @param {object} [params] extra parameters specific to the hitbtc api
     */
    async tradeRequest(name, params = {}) {
        await this.loadMarkets();
        await this.authenticate();
        const url = this.urls['api']['ws']['private'];
        const messageHash = this.nonce().toString();
        const subscribe = {
            'method': name,
            'params': params,
            'id': messageHash,
        };
        return await this.watch(url, messageHash, subscribe, messageHash);
    }
    /**
     * @method
     * @name hitbtc#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api.hitbtc.com/#subscribe-to-full-order-book
     * @see https://api.hitbtc.com/#subscribe-to-partial-order-book
     * @see https://api.hitbtc.com/#subscribe-to-partial-order-book-in-batches
     * @see https://api.hitbtc.com/#subscribe-to-top-of-book
     * @see https://api.hitbtc.com/#subscribe-to-top-of-book-in-batches
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] 'orderbook/full', 'orderbook/{depth}/{speed}', 'orderbook/{depth}/{speed}/batch'
     * @param {int} [params.depth] 5 , 10, or 20 (default)
     * @param {int} [params.speed] 100 (default), 500, or 1000
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        const options = this.safeValue(this.options, 'watchOrderBook');
        const defaultMethod = this.safeString(options, 'method', 'orderbook/full');
        let name = this.safeString2(params, 'method', 'defaultMethod', defaultMethod);
        const depth = this.safeString(params, 'depth', '20');
        const speed = this.safeString(params, 'depth', '100');
        if (name === 'orderbook/{depth}/{speed}') {
            name = 'orderbook/D' + depth + '/' + speed + 'ms';
        }
        else if (name === 'orderbook/{depth}/{speed}/batch') {
            name = 'orderbook/D' + depth + '/' + speed + 'ms/batch';
        }
        const market = this.market(symbol);
        const request = {
            'params': {
                'symbols': [market['id']],
            },
        };
        const orderbook = await this.subscribePublic(name, 'orderbooks', [symbol], this.deepExtend(request, params));
        return orderbook.limit();
    }
    handleOrderBook(client, message) {
        //
        //    {
        //        "ch": "orderbook/full",                 // Channel
        //        "snapshot": {
        //            "ETHBTC": {
        //                "t": 1626866578796,             // Timestamp in milliseconds
        //                "s": 27617207,                  // Sequence number
        //                "a": [                          // Asks
        //                    ["0.060506", "0"],
        //                    ["0.060549", "12.6431"],
        //                    ["0.060570", "0"],
        //                    ["0.060612", "0"]
        //                ],
        //                "b": [                          // Bids
        //                    ["0.060439", "4.4095"],
        //                    ["0.060414", "0"],
        //                    ["0.060407", "7.3349"],
        //                    ["0.060390", "0"]
        //                ]
        //            }
        //        }
        //    }
        //
        const snapshot = this.safeDict(message, 'snapshot');
        const update = this.safeDict(message, 'update');
        const data = snapshot ? snapshot : update;
        const type = snapshot ? 'snapshot' : 'update';
        const marketIds = Object.keys(data);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket(marketId);
            const symbol = market['symbol'];
            const item = data[marketId];
            const messageHash = 'orderbooks::' + symbol;
            if (!(symbol in this.orderbooks)) {
                const subscription = this.safeDict(client.subscriptions, messageHash, {});
                const limit = this.safeInteger(subscription, 'limit');
                this.orderbooks[symbol] = this.orderBook({}, limit);
            }
            const orderbook = this.orderbooks[symbol];
            const timestamp = this.safeInteger(item, 't');
            const nonce = this.safeInteger(item, 's');
            if (type === 'snapshot') {
                const parsedSnapshot = this.parseOrderBook(item, symbol, timestamp, 'b', 'a');
                orderbook.reset(parsedSnapshot);
            }
            else {
                const asks = this.safeList(item, 'a', []);
                const bids = this.safeList(item, 'b', []);
                this.handleDeltas(orderbook['asks'], asks);
                this.handleDeltas(orderbook['bids'], bids);
            }
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601(timestamp);
            orderbook['nonce'] = nonce;
            orderbook['symbol'] = symbol;
            this.orderbooks[symbol] = orderbook;
            client.resolve(orderbook, messageHash);
        }
    }
    handleDelta(bookside, delta) {
        const price = this.safeNumber(delta, 0);
        const amount = this.safeNumber(delta, 1);
        bookside.store(price, amount);
    }
    handleDeltas(bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta(bookside, deltas[i]);
        }
    }
    /**
     * @method
     * @name hitbtc#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api.hitbtc.com/#subscribe-to-ticker
     * @see https://api.hitbtc.com/#subscribe-to-ticker-in-batches
     * @see https://api.hitbtc.com/#subscribe-to-mini-ticker
     * @see https://api.hitbtc.com/#subscribe-to-mini-ticker-in-batches
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] 'ticker/{speed}' (default), or 'ticker/price/{speed}'
     * @param {string} [params.speed] '1s' (default), or '3s'
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        const ticker = await this.watchTickers([symbol], params);
        return this.safeValue(ticker, symbol);
    }
    /**
     * @method
     * @name hitbtc#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string[]} [symbols]
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @param {string} params.method 'ticker/{speed}' ,'ticker/price/{speed}', 'ticker/{speed}/batch' (default), or 'ticker/{speed}/price/batch''
     * @param {string} params.speed '1s' (default), or '3s'
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const options = this.safeValue(this.options, 'watchTicker');
        const defaultMethod = this.safeString(options, 'method', 'ticker/{speed}/batch');
        const method = this.safeString2(params, 'method', 'defaultMethod', defaultMethod);
        const speed = this.safeString(params, 'speed', '1s');
        const name = this.implodeParams(method, { 'speed': speed });
        params = this.omit(params, ['method', 'speed']);
        const marketIds = [];
        if (symbols === undefined) {
            marketIds.push('*');
        }
        else {
            for (let i = 0; i < symbols.length; i++) {
                const marketId = this.marketId(symbols[i]);
                marketIds.push(marketId);
            }
        }
        const request = {
            'params': {
                'symbols': marketIds,
            },
        };
        const newTickers = await this.subscribePublic(name, 'tickers', symbols, this.deepExtend(request, params));
        if (this.newUpdates) {
            if (!Array.isArray(newTickers)) {
                const tickers = {};
                tickers[newTickers['symbol']] = newTickers;
                return tickers;
            }
        }
        return this.filterByArray(newTickers, 'symbol', symbols);
    }
    handleTicker(client, message) {
        //
        //    {
        //        "ch": "ticker/1s",
        //        "data": {
        //            "ETHBTC": {
        //                "t": 1614815872000,             // Timestamp in milliseconds
        //                "a": "0.031175",                // Best ask
        //                "A": "0.03329",                 // Best ask quantity
        //                "b": "0.031148",                // Best bid
        //                "B": "0.10565",                 // Best bid quantity
        //                "c": "0.031210",                // Last price
        //                "o": "0.030781",                // Open price
        //                "h": "0.031788",                // High price
        //                "l": "0.030733",                // Low price
        //                "v": "62.587",                  // Base asset volume
        //                "q": "1.951420577",             // Quote asset volume
        //                "p": "0.000429",                // Price change
        //                "P": "1.39",                    // Price change percent
        //                "L": 1182694927                 // Last trade identifier
        //            }
        //        }
        //    }
        //
        //    {
        //        "ch": "ticker/price/1s",
        //        "data": {
        //            "BTCUSDT": {
        //                "t": 1614815872030,
        //                "o": "32636.79",
        //                "c": "32085.51",
        //                "h": "33379.92",
        //                "l": "30683.28",
        //                "v": "11.90667",
        //                "q": "384081.1955629"
        //            }
        //        }
        //    }
        //
        const data = this.safeValue(message, 'data', {});
        const marketIds = Object.keys(data);
        const result = [];
        const topic = 'tickers';
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket(marketId);
            const symbol = market['symbol'];
            const ticker = this.parseWsTicker(data[marketId], market);
            this.tickers[symbol] = ticker;
            result.push(ticker);
            const messageHash = topic + '::' + symbol;
            client.resolve(ticker, messageHash);
        }
        client.resolve(result, topic);
    }
    parseWsTicker(ticker, market = undefined) {
        //
        //    {
        //        "t": 1614815872000,             // Timestamp in milliseconds
        //        "a": "0.031175",                // Best ask
        //        "A": "0.03329",                 // Best ask quantity
        //        "b": "0.031148",                // Best bid
        //        "B": "0.10565",                 // Best bid quantity
        //        "c": "0.031210",                // Last price
        //        "o": "0.030781",                // Open price
        //        "h": "0.031788",                // High price
        //        "l": "0.030733",                // Low price
        //        "v": "62.587",                  // Base asset volume
        //        "q": "1.951420577",             // Quote asset volume
        //        "p": "0.000429",                // Price change
        //        "P": "1.39",                    // Price change percent
        //        "L": 1182694927                 // Last trade identifier
        //    }
        //
        //    {
        //        "t": 1614815872030,
        //        "o": "32636.79",
        //        "c": "32085.51",
        //        "h": "33379.92",
        //        "l": "30683.28",
        //        "v": "11.90667",
        //        "q": "384081.1955629"
        //    }
        //
        const timestamp = this.safeInteger(ticker, 't');
        const symbol = this.safeSymbol(undefined, market);
        const last = this.safeString(ticker, 'c');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'h'),
            'low': this.safeString(ticker, 'l'),
            'bid': this.safeString(ticker, 'b'),
            'bidVolume': this.safeString(ticker, 'B'),
            'ask': this.safeString(ticker, 'a'),
            'askVolume': this.safeString(ticker, 'A'),
            'vwap': undefined,
            'open': this.safeString(ticker, 'o'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString(ticker, 'v'),
            'quoteVolume': this.safeString(ticker, 'q'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name hitbtc#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://api.hitbtc.com/#subscribe-to-top-of-book
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] 'orderbook/top/{speed}' or 'orderbook/top/{speed}/batch (default)'
     * @param {string} [params.speed] '100ms' (default) or '500ms' or '1000ms'
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchBidsAsks(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        const options = this.safeValue(this.options, 'watchBidsAsks');
        const defaultMethod = this.safeString(options, 'method', 'orderbook/top/{speed}/batch');
        const method = this.safeString2(params, 'method', 'defaultMethod', defaultMethod);
        const speed = this.safeString(params, 'speed', '100ms');
        const name = this.implodeParams(method, { 'speed': speed });
        params = this.omit(params, ['method', 'speed']);
        const marketIds = this.marketIds(symbols);
        const request = {
            'params': {
                'symbols': marketIds,
            },
        };
        const newTickers = await this.subscribePublic(name, 'bidask', symbols, this.deepExtend(request, params));
        if (this.newUpdates) {
            if (!Array.isArray(newTickers)) {
                const tickers = {};
                tickers[newTickers['symbol']] = newTickers;
                return tickers;
            }
        }
        return this.filterByArray(newTickers, 'symbol', symbols);
    }
    handleBidAsk(client, message) {
        //
        //     {
        //         "ch": "orderbook/top/100ms", // or 'orderbook/top/100ms/batch'
        //         "data": {
        //             "BTCUSDT": {
        //                 "t": 1727276919771,
        //                 "a": "63931.45",
        //                 "A": "0.02879",
        //                 "b": "63926.97",
        //                 "B": "0.00100"
        //             }
        //         }
        //     }
        //
        const data = this.safeDict(message, 'data', {});
        const marketIds = Object.keys(data);
        const result = [];
        const topic = 'bidask';
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket(marketId);
            const symbol = market['symbol'];
            const ticker = this.parseWsBidAsk(data[marketId], market);
            this.bidsasks[symbol] = ticker;
            result.push(ticker);
            const messageHash = topic + '::' + symbol;
            client.resolve(ticker, messageHash);
        }
        client.resolve(result, topic);
    }
    parseWsBidAsk(ticker, market = undefined) {
        const timestamp = this.safeInteger(ticker, 't');
        return this.safeTicker({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'ask': this.safeString(ticker, 'a'),
            'askVolume': this.safeString(ticker, 'A'),
            'bid': this.safeString(ticker, 'b'),
            'bidVolume': this.safeString(ticker, 'B'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name hitbtc#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api.hitbtc.com/#subscribe-to-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'params': {
                'symbols': [market['id']],
            },
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const name = 'trades';
        const trades = await this.subscribePublic(name, 'trades', [symbol], this.deepExtend(request, params));
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp');
    }
    handleTrades(client, message) {
        //
        //    {
        //        "result": {
        //            "ch": "trades",                           // Channel
        //            "subscriptions": ["ETHBTC", "BTCUSDT"]
        //        },
        //        "id": 123
        //    }
        //
        // Notification snapshot
        //
        //    {
        //        "ch": "trades",                               // Channel
        //        "snapshot": {
        //            "BTCUSDT": [{
        //                "t": 1626861109494,                   // Timestamp in milliseconds
        //                "i": 1555634969,                      // Trade identifier
        //                "p": "30881.96",                      // Price
        //                "q": "12.66828",                      // Quantity
        //                "s": "buy"                            // Side
        //            }]
        //        }
        //    }
        //
        // Notification update
        //
        //    {
        //        "ch": "trades",
        //        "update": {
        //            "BTCUSDT": [{
        //                "t": 1626861123552,
        //                "i": 1555634969,
        //                "p": "30877.68",
        //                "q": "0.00006",
        //                "s": "sell"
        //            }]
        //        }
        //    }
        //
        const data = this.safeValue2(message, 'snapshot', 'update', {});
        const marketIds = Object.keys(data);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket(marketId);
            const tradesLimit = this.safeInteger(this.options, 'tradesLimit', 1000);
            const symbol = market['symbol'];
            let stored = this.safeValue(this.trades, symbol);
            if (stored === undefined) {
                stored = new Cache.ArrayCache(tradesLimit);
                this.trades[symbol] = stored;
            }
            const trades = this.parseWsTrades(data[marketId], market);
            for (let j = 0; j < trades.length; j++) {
                stored.append(trades[j]);
            }
            const messageHash = 'trades::' + symbol;
            client.resolve(stored, messageHash);
        }
        return message;
    }
    parseWsTrades(trades, market = undefined, since = undefined, limit = undefined, params = {}) {
        trades = this.toArray(trades);
        let result = [];
        for (let i = 0; i < trades.length; i++) {
            const trade = this.extend(this.parseWsTrade(trades[i], market), params);
            result.push(trade);
        }
        result = this.sortBy2(result, 'timestamp', 'id');
        const symbol = this.safeString(market, 'symbol');
        return this.filterBySymbolSinceLimit(result, symbol, since, limit);
    }
    parseWsTrade(trade, market = undefined) {
        //
        //    {
        //        "t": 1626861123552,       // Timestamp in milliseconds
        //        "i": 1555634969,          // Trade identifier
        //        "p": "30877.68",          // Price
        //        "q": "0.00006",           // Quantity
        //        "s": "sell"               // Side
        //    }
        //
        const timestamp = this.safeInteger(trade, 't');
        return this.safeTrade({
            'info': trade,
            'id': this.safeString(trade, 'i'),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': this.safeString(market, 'symbol'),
            'type': undefined,
            'side': this.safeString(trade, 's'),
            'takerOrMaker': undefined,
            'price': this.safeString(trade, 'p'),
            'amount': this.safeString(trade, 'q'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }
    /**
     * @method
     * @name hitbtc#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api.hitbtc.com/#subscribe-to-candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} [timeframe] the length of time each candle represents
     * @param {int} [since] not used by hitbtc watchOHLCV
     * @param {int} [limit] 0 – 1000, default value = 0 (no history returned)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const period = this.safeString(this.timeframes, timeframe, timeframe);
        const name = 'candles/' + period;
        const market = this.market(symbol);
        const request = {
            'params': {
                'symbols': [market['id']],
            },
        };
        if (limit !== undefined) {
            request['params']['limit'] = limit;
        }
        const ohlcv = await this.subscribePublic(name, 'candles', [symbol], this.deepExtend(request, params));
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0);
    }
    handleOHLCV(client, message) {
        //
        //    {
        //        "ch": "candles/M1",                     // Channel
        //        "snapshot": {
        //            "BTCUSDT": [{
        //                "t": 1626860340000,             // Message timestamp
        //                "o": "30881.95",                // Open price
        //                "c": "30890.96",                // Last price
        //                "h": "30900.8",                 // High price
        //                "l": "30861.27",                // Low price
        //                "v": "1.27852",                 // Base asset volume
        //                "q": "39493.9021811"            // Quote asset volume
        //            }
        //            ...
        //            ]
        //        }
        //    }
        //
        //    {
        //        "ch": "candles/M1",
        //        "update": {
        //            "ETHBTC": [{
        //                "t": 1626860880000,
        //                "o": "0.060711",
        //                "c": "0.060749",
        //                "h": "0.060749",
        //                "l": "0.060711",
        //                "v": "12.2800",
        //                "q": "0.7455339675"
        //          }]
        //        }
        //    }
        //
        const data = this.safeValue2(message, 'snapshot', 'update', {});
        const marketIds = Object.keys(data);
        const channel = this.safeString(message, 'ch');
        const splitChannel = channel.split('/');
        const period = this.safeString(splitChannel, 1);
        const timeframe = this.findTimeframe(period);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket(marketId);
            const symbol = market['symbol'];
            this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
            let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
                stored = new Cache.ArrayCacheByTimestamp(limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            const ohlcvs = this.parseWsOHLCVs(data[marketId], market);
            for (let j = 0; j < ohlcvs.length; j++) {
                stored.append(ohlcvs[j]);
            }
            const messageHash = 'candles::' + symbol;
            client.resolve(stored, messageHash);
        }
        return message;
    }
    parseWsOHLCV(ohlcv, market = undefined) {
        //
        //    {
        //        "t": 1626860340000,             // Message timestamp
        //        "o": "30881.95",                // Open price
        //        "c": "30890.96",                // Last price
        //        "h": "30900.8",                 // High price
        //        "l": "30861.27",                // Low price
        //        "v": "1.27852",                 // Base asset volume
        //        "q": "39493.9021811"            // Quote asset volume
        //    }
        //
        return [
            this.safeInteger(ohlcv, 't'),
            this.safeNumber(ohlcv, 'o'),
            this.safeNumber(ohlcv, 'h'),
            this.safeNumber(ohlcv, 'l'),
            this.safeNumber(ohlcv, 'c'),
            this.safeNumber(ohlcv, 'v'),
        ];
    }
    /**
     * @method
     * @name hitbtc#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://api.hitbtc.com/#subscribe-to-reports
     * @see https://api.hitbtc.com/#subscribe-to-reports-2
     * @see https://api.hitbtc.com/#subscribe-to-reports-3
     * @param {string} [symbol] unified CCXT market symbol
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum amount of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let marketType = undefined;
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        [marketType, params] = this.handleMarketTypeAndParams('watchOrders', market, params);
        const name = this.getSupportedMapping(marketType, {
            'spot': 'spot_subscribe',
            'margin': 'margin_subscribe',
            'swap': 'futures_subscribe',
            'future': 'futures_subscribe',
        });
        const orders = await this.subscribePrivate(name, symbol, params);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(orders, since, limit, 'timestamp');
    }
    handleOrder(client, message) {
        //
        //    {
        //        "jsonrpc": "2.0",
        //        "method": "spot_order",                            // "margin_order", "future_order"
        //        "params": {
        //            "id": 584244931496,
        //            "client_order_id": "b5acd79c0a854b01b558665bcf379456",
        //            "symbol": "BTCUSDT",
        //            "side": "buy",
        //            "status": "new",
        //            "type": "limit",
        //            "time_in_force": "GTC",
        //            "quantity": "0.01000",
        //            "quantity_cumulative": "0",
        //            "price": "0.01",                              // only updates and snapshots
        //            "post_only": false,
        //            "reduce_only": false,                         // only margin and contract
        //            "display_quantity": "0",                      // only updates and snapshot
        //            "created_at": "2021-07-02T22:52:32.864Z",
        //            "updated_at": "2021-07-02T22:52:32.864Z",
        //            "trade_id": 1361977606,                       // only trades
        //            "trade_quantity": "0.00001",                  // only trades
        //            "trade_price": "49595.04",                    // only trades
        //            "trade_fee": "0.001239876000",                // only trades
        //            "trade_taker": true,                          // only trades, only spot
        //            "trade_position_id": 485308,                  // only trades, only margin
        //            "report_type": "new"                          // "trade", "status" (snapshot)
        //        }
        //    }
        //
        //    {
        //       "jsonrpc": "2.0",
        //       "method": "spot_orders",                            // "margin_orders", "future_orders"
        //       "params": [
        //            {
        //                "id": 584244931496,
        //                "client_order_id": "b5acd79c0a854b01b558665bcf379456",
        //                "symbol": "BTCUSDT",
        //                "side": "buy",
        //                "status": "new",
        //                "type": "limit",
        //                "time_in_force": "GTC",
        //                "quantity": "0.01000",
        //                "quantity_cumulative": "0",
        //                "price": "0.01",                              // only updates and snapshots
        //                "post_only": false,
        //                "reduce_only": false,                         // only margin and contract
        //                "display_quantity": "0",                      // only updates and snapshot
        //                "created_at": "2021-07-02T22:52:32.864Z",
        //                "updated_at": "2021-07-02T22:52:32.864Z",
        //                "trade_id": 1361977606,                       // only trades
        //                "trade_quantity": "0.00001",                  // only trades
        //                "trade_price": "49595.04",                    // only trades
        //                "trade_fee": "0.001239876000",                // only trades
        //                "trade_taker": true,                          // only trades, only spot
        //                "trade_position_id": 485308,                  // only trades, only margin
        //                "report_type": "new"                          // "trade", "status" (snapshot)
        //            }
        //        ]
        //    }
        //
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit');
            this.orders = new Cache.ArrayCacheBySymbolById(limit);
        }
        const data = this.safeValue(message, 'params', []);
        if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                const order = data[i];
                this.handleOrderHelper(client, message, order);
            }
        }
        else {
            this.handleOrderHelper(client, message, data);
        }
        return message;
    }
    handleOrderHelper(client, message, order) {
        const orders = this.orders;
        const marketId = this.safeStringLower2(order, 'instrument', 'symbol');
        const method = this.safeString(message, 'method');
        const splitMethod = method.split('_order');
        const messageHash = this.safeString(splitMethod, 0);
        const symbol = this.safeSymbol(marketId);
        const parsed = this.parseOrder(order);
        orders.append(parsed);
        client.resolve(orders, messageHash);
        client.resolve(orders, messageHash + '::' + symbol);
    }
    parseWsOrderTrade(trade, market = undefined) {
        //
        //    {
        //        "id": 584244931496,
        //        "client_order_id": "b5acd79c0a854b01b558665bcf379456",
        //        "symbol": "BTCUSDT",
        //        "side": "buy",
        //        "status": "new",
        //        "type": "limit",
        //        "time_in_force": "GTC",
        //        "quantity": "0.01000",
        //        "quantity_cumulative": "0",
        //        "price": "0.01",                              // only updates and snapshots
        //        "post_only": false,
        //        "reduce_only": false,                         // only margin and contract
        //        "display_quantity": "0",                      // only updates and snapshot
        //        "created_at": "2021-07-02T22:52:32.864Z",
        //        "updated_at": "2021-07-02T22:52:32.864Z",
        //        "trade_id": 1361977606,                       // only trades
        //        "trade_quantity": "0.00001",                  // only trades
        //        "trade_price": "49595.04",                    // only trades
        //        "trade_fee": "0.001239876000",                // only trades
        //        "trade_taker": true,                          // only trades, only spot
        //        "trade_position_id": 485308,                  // only trades, only margin
        //        "report_type": "new"                          // "trade", "status" (snapshot)
        //    }
        //
        const timestamp = this.safeInteger(trade, 'created_at');
        const marketId = this.safeString(trade, 'symbol');
        return this.safeTrade({
            'info': trade,
            'id': this.safeString(trade, 'trade_id'),
            'order': this.safeString(trade, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': this.safeMarket(marketId, market),
            'type': undefined,
            'side': this.safeString(trade, 'side'),
            'takerOrMaker': this.safeString(trade, 'trade_taker'),
            'price': this.safeString(trade, 'trade_price'),
            'amount': this.safeString(trade, 'trade_quantity'),
            'cost': undefined,
            'fee': {
                'cost': this.safeString(trade, 'trade_fee'),
                'currency': undefined,
                'rate': undefined,
            },
        }, market);
    }
    parseWsOrder(order, market = undefined) {
        //
        //    {
        //        "id": 584244931496,
        //        "client_order_id": "b5acd79c0a854b01b558665bcf379456",
        //        "symbol": "BTCUSDT",
        //        "side": "buy",
        //        "status": "new",
        //        "type": "limit",
        //        "time_in_force": "GTC",
        //        "quantity": "0.01000",
        //        "quantity_cumulative": "0",
        //        "price": "0.01",                              // only updates and snapshots
        //        "post_only": false,
        //        "reduce_only": false,                         // only margin and contract
        //        "display_quantity": "0",                      // only updates and snapshot
        //        "created_at": "2021-07-02T22:52:32.864Z",
        //        "updated_at": "2021-07-02T22:52:32.864Z",
        //        "trade_id": 1361977606,                       // only trades
        //        "trade_quantity": "0.00001",                  // only trades
        //        "trade_price": "49595.04",                    // only trades
        //        "trade_fee": "0.001239876000",                // only trades
        //        "trade_taker": true,                          // only trades, only spot
        //        "trade_position_id": 485308,                  // only trades, only margin
        //        "report_type": "new"                          // "trade", "status" (snapshot)
        //    }
        //
        const timestamp = this.safeString(order, 'created_at');
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market);
        const tradeId = this.safeString(order, 'trade_id');
        let trades = undefined;
        if (tradeId !== undefined) {
            const trade = this.parseWsOrderTrade(order, market);
            trades = [trade];
        }
        const rawStatus = this.safeString(order, 'status');
        const report_type = this.safeString(order, 'report_type');
        let parsedStatus = undefined;
        if (report_type === 'canceled') {
            parsedStatus = this.parseOrderStatus(report_type);
        }
        else {
            parsedStatus = this.parseOrderStatus(rawStatus);
        }
        return this.safeOrder({
            'info': order,
            'id': this.safeString(order, 'id'),
            'clientOrderId': this.safeString(order, 'client_order_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'price': this.safeString(order, 'price'),
            'amount': this.safeString(order, 'quantity'),
            'type': this.safeString(order, 'type'),
            'side': this.safeStringUpper(order, 'side'),
            'timeInForce': this.safeString(order, 'time_in_force'),
            'postOnly': this.safeString(order, 'post_only'),
            'reduceOnly': this.safeValue(order, 'reduce_only'),
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'status': parsedStatus,
            'average': undefined,
            'trades': trades,
            'fee': undefined,
        }, market);
    }
    /**
     * @method
     * @name hitbtc#watchBalance
     * @description watches balance updates, cannot subscribe to margin account balances
     * @see https://api.hitbtc.com/#subscribe-to-spot-balances
     * @see https://api.hitbtc.com/#subscribe-to-futures-balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot', 'swap', or 'future'
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} [params.mode] 'updates' or 'batches' (default), 'updates' = messages arrive after balance updates, 'batches' = messages arrive at equal intervals if there were any updates
     * @returns {object[]} a list of [balance structures]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        await this.loadMarkets();
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('watchBalance', undefined, params);
        const name = this.getSupportedMapping(type, {
            'spot': 'spot_balance_subscribe',
            'swap': 'futures_balance_subscribe',
            'future': 'futures_balance_subscribe',
        });
        const mode = this.safeString(params, 'mode', 'batches');
        params = this.omit(params, 'mode');
        const request = {
            'mode': mode,
        };
        return await this.subscribePrivate(name, undefined, this.extend(request, params));
    }
    /**
     * @method
     * @name hitbtc#createOrder
     * @description create a trade order
     * @see https://api.hitbtc.com/#create-new-spot-order
     * @see https://api.hitbtc.com/#create-margin-order
     * @see https://api.hitbtc.com/#create-futures-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported for spot-margin, swap supports both, default is 'cross'
     * @param {bool} [params.margin] true for creating a margin order
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately
     * @param {string} [params.timeInForce] "GTC", "IOC", "FOK", "Day", "GTD"
     * @returns {object} an [order structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
     */
    async createOrderWs(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let request = undefined;
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('createOrder', market, params);
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('createOrder', params);
        [request, params] = this.createOrderRequest(market, marketType, type, side, amount, price, marginMode, params);
        request = this.extend(request, params);
        if (marketType === 'swap') {
            return await this.tradeRequest('futures_new_order', request);
        }
        else if ((marketType === 'margin') || (marginMode !== undefined)) {
            return await this.tradeRequest('margin_new_order', request);
        }
        else {
            return await this.tradeRequest('spot_new_order', request);
        }
    }
    /**
     * @method
     * @name hitbtc#cancelOrderWs
     * @see https://api.hitbtc.com/#cancel-spot-order-2
     * @see https://api.hitbtc.com/#cancel-futures-order-2
     * @see https://api.hitbtc.com/#cancel-margin-order-2
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
     * @param {bool} [params.margin] true for canceling a margin order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrderWs(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        let request = {
            'client_order_id': id,
        };
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('cancelOrderWs', market, params);
        const [marginMode, query] = this.handleMarginModeAndParams('cancelOrderWs', params);
        request = this.extend(request, query);
        if (marketType === 'swap') {
            return await this.tradeRequest('futures_cancel_order', request);
        }
        else if ((marketType === 'margin') || (marginMode !== undefined)) {
            return await this.tradeRequest('margin_cancel_order', request);
        }
        else {
            return await this.tradeRequest('spot_cancel_order', request);
        }
    }
    /**
     * @method
     * @name hitbtc#cancelAllOrdersWs
     * @see https://api.hitbtc.com/#cancel-spot-orders
     * @see https://api.hitbtc.com/#cancel-futures-order-3
     * @description cancel all open orders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
     * @param {bool} [params.margin] true for canceling margin orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrdersWs(symbol = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('cancelAllOrdersWs', market, params);
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('cancelAllOrdersWs', params);
        if (marketType === 'swap') {
            return await this.tradeRequest('futures_cancel_orders', params);
        }
        else if ((marketType === 'margin') || (marginMode !== undefined)) {
            throw new errors.NotSupported(this.id + ' cancelAllOrdersWs is not supported for margin orders');
        }
        else {
            return await this.tradeRequest('spot_cancel_orders', params);
        }
    }
    /**
     * @method
     * @name hitbtc#fetchOpenOrdersWs
     * @see https://api.hitbtc.com/#get-active-futures-orders-2
     * @see https://api.hitbtc.com/#get-margin-orders
     * @see https://api.hitbtc.com/#get-active-spot-orders
     * @description fetch all unfilled currently open orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
     * @param {bool} [params.margin] true for fetching open margin orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrdersWs(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchOpenOrdersWs', market, params);
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchOpenOrdersWs', params);
        if (marketType === 'swap') {
            return await this.tradeRequest('futures_get_orders', request);
        }
        else if ((marketType === 'margin') || (marginMode !== undefined)) {
            return await this.tradeRequest('margin_get_orders', request);
        }
        else {
            return await this.tradeRequest('spot_get_orders', request);
        }
    }
    handleBalance(client, message) {
        //
        //    {
        //        "jsonrpc": "2.0",
        //        "method": "futures_balance",
        //        "params": [
        //            {
        //                "currency": "BCN",
        //                "available": "100.000000000000",
        //                "reserved": "0",
        //                "reserved_margin": "0"
        //            },
        //            ...
        //        ]
        //    }
        //
        const messageHash = this.safeString(message, 'method');
        const params = this.safeValue(message, 'params');
        const balance = this.parseBalance(params);
        this.balance = this.deepExtend(this.balance, balance);
        client.resolve(this.balance, messageHash);
    }
    handleNotification(client, message) {
        //
        //     { jsonrpc: "2.0", result: true, id: null }
        //
        return message;
    }
    handleOrderRequest(client, message) {
        //
        // createOrderWs, cancelOrderWs
        //
        //    {
        //        "jsonrpc": "2.0",
        //        "result": {
        //            "id": 1130310696965,
        //            "client_order_id": "OPC2oyHSkEBqIpPtniLqeW-597hUL3Yo",
        //            "symbol": "ADAUSDT",
        //            "side": "buy",
        //            "status": "new",
        //            "type": "limit",
        //            "time_in_force": "GTC",
        //            "quantity": "4",
        //            "quantity_cumulative": "0",
        //            "price": "0.3300000",
        //            "post_only": false,
        //            "created_at": "2023-11-17T14:58:15.903Z",
        //            "updated_at": "2023-11-17T14:58:15.903Z",
        //            "original_client_order_id": "d6b645556af740b1bd1683400fd9cbce",       // spot_replace_order only
        //            "report_type": "new"
        //            "margin_mode": "isolated",                                            // margin and future only
        //            "reduce_only": false,                                                 // margin and future only
        //        },
        //        "id": 1700233093414
        //    }
        //
        const messageHash = this.safeString(message, 'id');
        const result = this.safeValue(message, 'result', {});
        if (Array.isArray(result)) {
            const parsedOrders = [];
            for (let i = 0; i < result.length; i++) {
                const parsedOrder = this.parseWsOrder(result[i]);
                parsedOrders.push(parsedOrder);
            }
            client.resolve(parsedOrders, messageHash);
        }
        else {
            const parsedOrder = this.parseWsOrder(result);
            client.resolve(parsedOrder, messageHash);
        }
        return message;
    }
    handleMessage(client, message) {
        if (this.handleError(client, message)) {
            return;
        }
        let channel = this.safeString2(message, 'ch', 'method');
        if (channel !== undefined) {
            const splitChannel = channel.split('/');
            channel = this.safeString(splitChannel, 0);
            if (channel === 'orderbook') {
                const channel2 = this.safeString(splitChannel, 1);
                if (channel2 !== undefined && channel2 === 'top') {
                    channel = 'orderbook/top';
                }
            }
            const methods = {
                'candles': this.handleOHLCV,
                'ticker': this.handleTicker,
                'trades': this.handleTrades,
                'orderbook': this.handleOrderBook,
                'orderbook/top': this.handleBidAsk,
                'spot_order': this.handleOrder,
                'spot_orders': this.handleOrder,
                'margin_order': this.handleOrder,
                'margin_orders': this.handleOrder,
                'futures_order': this.handleOrder,
                'futures_orders': this.handleOrder,
                'spot_balance': this.handleBalance,
                'futures_balance': this.handleBalance,
            };
            const method = this.safeValue(methods, channel);
            if (method !== undefined) {
                method.call(this, client, message);
            }
        }
        else {
            const result = this.safeValue(message, 'result');
            const clientOrderId = this.safeString(result, 'client_order_id');
            if (clientOrderId !== undefined) {
                this.handleOrderRequest(client, message);
            }
            if ((result === true) && !('id' in message)) {
                this.handleAuthenticate(client, message);
            }
            if (Array.isArray(result)) {
                // to do improve this, not very reliable right now
                const first = this.safeValue(result, 0, {});
                const arrayLength = result.length;
                if ((arrayLength === 0) || ('client_order_id' in first)) {
                    this.handleOrderRequest(client, message);
                }
            }
        }
    }
    handleAuthenticate(client, message) {
        //
        //    {
        //        "jsonrpc": "2.0",
        //        "result": true
        //    }
        //
        const success = this.safeValue(message, 'result');
        const messageHash = 'authenticated';
        if (success) {
            const future = this.safeValue(client.futures, messageHash);
            future.resolve(true);
        }
        else {
            const error = new errors.AuthenticationError(this.id + ' ' + this.json(message));
            client.reject(error, messageHash);
            if (messageHash in client.subscriptions) {
                delete client.subscriptions[messageHash];
            }
        }
        return message;
    }
    handleError(client, message) {
        //
        //    {
        //        jsonrpc: '2.0',
        //        error: {
        //          code: 20001,
        //          message: 'Insufficient funds',
        //          description: 'Check that the funds are sufficient, given commissions'
        //        },
        //        id: 1700228604325
        //    }
        //
        const error = this.safeValue(message, 'error');
        if (error !== undefined) {
            try {
                const code = this.safeValue(error, 'code');
                const errorMessage = this.safeString(error, 'message');
                const description = this.safeString(error, 'description');
                const feedback = this.id + ' ' + description;
                this.throwExactlyMatchedException(this.exceptions['exact'], code, feedback);
                this.throwBroadlyMatchedException(this.exceptions['broad'], errorMessage, feedback);
                throw new errors.ExchangeError(feedback); // unknown message
            }
            catch (e) {
                if (e instanceof errors.AuthenticationError) {
                    const messageHash = 'authenticated';
                    client.reject(e, messageHash);
                    if (messageHash in client.subscriptions) {
                        delete client.subscriptions[messageHash];
                    }
                }
                else {
                    const id = this.safeString(message, 'id');
                    client.reject(e, id);
                }
                return true;
            }
        }
        return undefined;
    }
}

module.exports = hitbtc;
