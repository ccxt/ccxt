
//  ---------------------------------------------------------------------------

import mexc3Rest from '../mexc3.js';
import { BadRequest, ExchangeError } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } from '../base/ws/Cache.js';

//  ---------------------------------------------------------------------------

export default class mexc3 extends mexc3Rest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://wbs.mexc.com/ws',
                },
            },
            'options': {
                'subscriptionsLimit': 30,
                'listenKeyRefreshRate': 1200000,
                // TODO add reset connection after #16754 is merged
                'connectionsPerListenKey': 5,
                'maximumListenKeys': 60,
                'timeframes': {
                    '1m': 'Min1',
                    '5m': 'Min5',
                    '15m': 'Min15',
                    '30m': 'Min30',
                    '1h': 'Min60',
                    '4h': 'Hour4',
                    '8h': 'Hour8',
                    '1d': 'Day1',
                    '1w': 'Week1',
                    '1M': 'Month1',
                },
                'watchOrderBook': {
                    'snapshotDelay': 5,
                    'maxRetries': 3,
                },
            },
            'streaming': {
                'ping': this.ping,
            },
            'exceptions': {
            },
        });
    }

    checkSubscriptionLimit (url, subscriptionHash) {
        const client = this.safeValue (this.clients, url);
        if (client === undefined) {
            return;
        }
        const subscription = this.safeValue (client.subscriptions, subscriptionHash);
        if (subscription !== undefined) {
            return;
        }
        const subscriptionKeys = Object.keys (client.subscriptions);
        const numberOfSubscriptions = subscriptionKeys.length;
        const subscriptionsLimit = this.safeInteger (this.options, 'subscriptionsLimit', 30);
        if (numberOfSubscriptions >= subscriptionsLimit) {
            throw new BadRequest (this.id + ' has reached its subscription limit of ' + subscriptionsLimit.toString () + ' subscriptions');
        }
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name mexc3#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the mexc3 api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const channel = 'spot@public.bookTicker.v3.api@' + market['id'];
        return await this.watchPublicChannel (channel, params);
    }

    handleTicker (client, message) {
        //
        //    {
        //        c: 'spot@public.bookTicker.v3.api@BTCUSDT',
        //        d: {
        //            A: '4.70432',
        //            B: '6.714863',
        //            a: '20744.54',
        //            b: '20744.17'
        //        },
        //        s: 'BTCUSDT',
        //        t: 1678643605721
        //    }
        //
        const messageHash = this.safeString (message, 'c');
        const rawTicker = this.safeValue (message, 'd', {});
        const marketId = this.safeString (message, 's');
        const timestamp = this.safeInteger (message, 't');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const ticker = this.parseWsTicker (rawTicker, market);
        ticker['timestamp'] = timestamp;
        ticker['datetime'] = this.iso8601 (timestamp);
        this.tickers[symbol] = ticker;
        client.resolve (ticker, messageHash);
    }

    parseWsTicker (ticker, market = undefined) {
        //
        //    {
        //        A: '4.70432',
        //        B: '6.714863',
        //        a: '20744.54',
        //        b: '20744.17'
        //    }
        //
        return this.safeTicker ({
            'symbol': this.safeSymbol (undefined, market),
            'timestamp': undefined,
            'datetime': undefined,
            'open': undefined,
            'high': undefined,
            'low': undefined,
            'close': undefined,
            'bid': this.safeNumber (ticker, 'b'),
            'bidVolume': this.safeNumber (ticker, 'B'),
            'ask': this.safeNumber (ticker, 'a'),
            'askVolume': this.safeNumber (ticker, 'A'),
            'vwap': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async watchPublicChannel (channel, subscription, params = {}) {
        const url = this.urls['api']['ws'];
        const request = {
            'method': 'SUBSCRIPTION',
            'params': [ channel ],
        };
        this.checkSubscriptionLimit (url, channel);
        return await this.watch (url, channel, this.extend (request, params), channel, subscription);
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc3#watchOHLCV
         * @see https://mxcdevelop.github.io/apidocs/spot_v3_en/#kline-streams
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the mexc3 api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const timeframes = this.safeValue (this.options, 'timeframes', {});
        const timeframeId = this.safeString (timeframes, timeframe);
        const channel = 'spot@public.kline.v3.api@' + market['id'] + '@' + timeframeId;
        const ohlcv = await this.watchPublicChannel (channel, undefined, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        //
        //    {
        //        d: {
        //            e: 'spot@public.kline.v3.api',
        //            k: {
        //                t: 1678642260,
        //                o: 20626.94,
        //                c: 20599.69,
        //                h: 20626.94,
        //                l: 20597.06,
        //                v: 27.678686,
        //                a: 570332.77,
        //                T: 1678642320,
        //                i: 'Min1'
        //            }
        //        },
        //        c: 'spot@public.kline.v3.api@BTCUSDT@Min1',
        //        t: 1678642276459,
        //        s: 'BTCUSDT'
        //    }
        //
        const d = this.safeValue (message, 'd', {});
        const rawOhlcv = this.safeValue (d, 'k', {});
        const timeframeId = this.safeString (rawOhlcv, 'i');
        const timeframes = this.safeValue (this.options, 'timeframes', {});
        const timeframe = this.findTimeframe (timeframeId, timeframes);
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId);
        const symbol = this.safeSymbol (marketId, market);
        const messageHash = this.safeString (message, 'c');
        const parsed = this.parseWsOHLCV (rawOhlcv, market);
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        stored.append (parsed);
        client.resolve (stored, messageHash);
        return message;
    }

    parseWsOHLCV (ohlcv, market = undefined) {
        //
        //    {
        //        t: 1678642260,
        //        o: 20626.94,
        //        c: 20599.69,
        //        h: 20626.94,
        //        l: 20597.06,
        //        v: 27.678686,
        //        a: 570332.77,
        //        T: 1678642320,
        //        i: 'Min1'
        //    }
        //
        return [
            this.safeIntegerProduct (ohlcv, 't', 1000),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber (ohlcv, 'v'),
        ];
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc3#watchOrderBook
         * @see https://mxcdevelop.github.io/apidocs/spot_v3_en/#diff-depth-stream
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the mexc3 api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const channel = 'spot@public.increase.depth.v3.api@' + market['id'];
        const subscription = {
            'method': this.handleOrderBookSubscription,
            'symbol': symbol,
            'limit': limit,
        };
        const orderbook = await this.watchPublicChannel (channel, subscription, params);
        return orderbook.limit ();
    }

    handleOrderBookSubscription (client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit');
        this.orderbooks[symbol] = this.orderBook ({}, limit);
    }

    getCacheIndex (orderbook, cache) {
        // return the first index of the cache that can be applied to the orderbook or -1 if not possible
        const nonce = this.safeInteger (orderbook, 'nonce');
        const firstDelta = this.safeValue (cache, 0);
        const firstDeltaNonce = this.safeInteger (firstDelta, 'r');
        if (nonce < firstDeltaNonce - 1) {
            return -1;
        }
        for (let i = 0; i < cache.length; i++) {
            const delta = cache[i];
            const deltaNonce = this.safeInteger (delta, 'r');
            if (deltaNonce >= nonce) {
                return i;
            }
        }
        return -1;
    }

    handleOrderBook (client, message) {
        //
        //    {
        //        "c": "spot@public.increase.depth.v3.api@BTCUSDT",
        //        "d": {
        //            "asks": [{
        //                "p": "20290.89",
        //                "v": "0.000000"
        //            }],
        //            "e": "spot@public.increase.depth.v3.api",
        //            "r": "3407459756"
        //        },
        //        "s": "BTCUSDT",
        //        "t": 1661932660144
        //    }
        //
        const messageHash = this.safeString (message, 'c');
        const data = this.safeValue (message, 'd', {});
        const marketId = this.safeString (message, 's');
        const symbol = this.safeSymbol (marketId);
        const storedOrderBook = this.orderbooks[symbol];
        const nonce = this.safeInteger (storedOrderBook, 'nonce');
        if (nonce === undefined) {
            const cacheLength = storedOrderBook.cache.length;
            const subscription = client.subscriptions[messageHash];
            const limit = this.safeInteger (subscription, 'limit', 1000);
            const snapshotDelay = this.handleOption ('watchOrderBook', 'snapshotDelay', 5);
            if (cacheLength === snapshotDelay) {
                this.spawn (this.loadOrderBook, client, messageHash, symbol, limit);
            }
            storedOrderBook.cache.push (data);
            return;
        }
        try {
            this.handleDelta (storedOrderBook, data);
            const timestamp = this.safeInteger (message, 't');
            storedOrderBook['timestamp'] = timestamp;
            storedOrderBook['datetime'] = this.iso8601 (timestamp);
        } catch (e) {
            delete client.subscriptions[messageHash];
            client.reject (e, messageHash);
        }
        client.resolve (storedOrderBook, messageHash);
    }

    handleBooksideDelta (bookside, bidasks) {
        //
        //    [{
        //        "p": "20290.89",
        //        "v": "0.000000"
        //    }]
        //
        for (let i = 0; i < bidasks.length; i++) {
            const bidask = bidasks[i];
            const price = this.safeFloat (bidask, 'p');
            const amount = this.safeFloat (bidask, 'v');
            bookside.store (price, amount);
        }
    }

    handleDelta (orderbook, delta) {
        const nonce = this.safeInteger (orderbook, 'nonce');
        const deltaNonce = this.safeInteger (delta, 'r');
        if (deltaNonce !== nonce && deltaNonce !== nonce + 1) {
            throw new ExchangeError (this.id + ' handleOrderBook received an out-of-order nonce');
        }
        orderbook['nonce'] = deltaNonce;
        const asks = this.safeValue (delta, 'asks', []);
        const bids = this.safeValue (delta, 'bids', []);
        const asksOrderSide = orderbook['asks'];
        const bidsOrderSide = orderbook['bids'];
        this.handleBooksideDelta (asksOrderSide, asks);
        this.handleBooksideDelta (bidsOrderSide, bids);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc3#watchTrades
         * @see https://mxcdevelop.github.io/apidocs/spot_v3_en/#trade-streams
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the mexc3 api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const channel = 'spot@public.deals.v3.api@' + market['id'];
        const trades = await this.watchPublicChannel (channel, undefined, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        //    {
        //        c: "spot@public.deals.v3.api@BTCUSDT",
        //        d: {
        //            deals: [{
        //                p: "20382.70",
        //                v: "0.043800",
        //                S: 1,
        //                t: 1678593222456,
        //            }, ],
        //            e: "spot@public.deals.v3.api",
        //        },
        //        s: "BTCUSDT",
        //        t: 1678593222460,
        //    }
        //
        const messageHash = this.safeString (message, 'c');
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId);
        const symbol = this.safeSymbol (marketId);
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const d = this.safeValue (message, 'd', {});
        const trades = this.safeValue (d, 'deals', []);
        for (let j = 0; j < trades.length; j++) {
            const parsedTrade = this.parseWsTrade (trades[j], market);
            stored.append (parsedTrade);
        }
        client.resolve (stored, messageHash);
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc3#watchMyTrades
         * @see https://mxcdevelop.github.io/apidocs/spot_v3_en/#spot-account-deals
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the mexc3 api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure
         */
        await this.loadMarkets ();
        const messageHash = 'spot@private.deals.v3.api';
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
        }
        let trades = await this.watchPrivateChannel (messageHash, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        trades = this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
        const tradesLength = Object.keys (trades).length;
        if (tradesLength === 0) {
            return await this.watchMyTrades (symbol, since, limit, params);
        }
        return trades;
    }

    handleMyTrade (client, message, subscription = undefined) {
        //
        //    {
        //        c: 'spot@private.deals.v3.api',
        //        d: {
        //            p: '22339.99',
        //            v: '0.000235',
        //            S: 1,
        //            T: 1678670940695,
        //            t: '9f6a47fb926442e496c5c4c104076ae3',
        //            c: '',
        //            i: 'e2b9835d1b6745f8a10ab74a81a16d50',
        //            m: 0,
        //            st: 0
        //        },
        //        s: 'BTCUSDT',
        //        t: 1678670940700
        //    }
        //
        const messageHash = this.safeString (message, 'c');
        const data = this.safeValue (message, 'd', {});
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId);
        const trade = this.parseWsTrade (data, market);
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const trades = this.myTrades;
        trades.append (trade);
        client.resolve (trades, messageHash);
    }

    parseWsTrade (trade, market = undefined) {
        //
        // public trade
        //    {
        //        p: "20382.70",
        //        v: "0.043800",
        //        S: 1,
        //        t: 1678593222456,
        //    }
        // private trade
        //    {
        //        "S": 1,
        //        "T": 1661938980268,
        //        "c": "",
        //        "i": "c079b0fcb80a46e8b128b281ce4e4f38",
        //        "m": 1,
        //        "p": "1.008",
        //        "st": 0,
        //        "t": "4079b1522a0b40e7919f609e1ea38d44",
        //        "v": "5"
        //    }
        //
        let timestamp = this.safeInteger (trade, 'T');
        let tradeId = this.safeString (trade, 't');
        if (timestamp === undefined) {
            timestamp = this.safeInteger (trade, 't');
            tradeId = undefined;
        }
        const priceString = this.safeString (trade, 'p');
        const amountString = this.safeString (trade, 'v');
        const rawSide = this.safeString (trade, 'S');
        const side = (rawSide === '1') ? 'buy' : 'sell';
        const isMaker = this.safeInteger (trade, 'm');
        return this.safeTrade ({
            'info': trade,
            'id': tradeId,
            'order': this.safeString (trade, 'i'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeSymbol (undefined, market),
            'type': undefined,
            'side': side,
            'takerOrMaker': (isMaker) ? 'maker' : 'taker',
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc3#watchOrders
         * @see https://mxcdevelop.github.io/apidocs/spot_v3_en/#spot-account-orders
         * @see https://mxcdevelop.github.io/apidocs/spot_v3_en/#margin-account-orders
         * @description watches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the mexc3 api endpoint
         * @params {string|undefined} params.type the type of orders to retrieve, can be 'spot' or 'margin'
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const type = this.safeString (params, 'type', 'spot');
        params = this.omit (params, 'type');
        const channel = type + '@private.orders.v3.api';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
        }
        let orders = await this.watchPrivateChannel (channel, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        orders = this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
        const ordersLength = Object.keys (orders).length;
        if (ordersLength === 0) {
            return await this.watchOrders (symbol, since, limit, params);
        }
        return orders;
    }

    handleOrder (client, message, subscription = undefined) {
        //
        // spot
        //    {
        //        "c": "spot@private.orders.v3.api",
        //        "d": {
        //              "A":8.0,
        //              "O":1661938138000,
        //              "S":1,
        //              "V":10,
        //              "a":8,
        //              "c":"",
        //              "i":"e03a5c7441e44ed899466a7140b71391",
        //              "m":0,
        //              "o":1,
        //              "p":0.8,
        //              "s":1,
        //              "v":10,
        //              "ap":0,
        //              "cv":0,
        //              "ca":0
        //        },
        //        "s": "MXUSDT",
        //        "t": 1661938138193
        //    }
        // spot - stop
        //    {
        //        "c": "spot@private.orders.v3.api",
        //        "d": {
        //              "N":"USDT",
        //              "O":1661938853715,
        //              "P":0.9,
        //              "S":1,
        //              "T":"LE",
        //              "i":"f6d82e5f41d745f59fe9d3cafffd80b5",
        //              "o":100,
        //              "p":1.01,
        //              "s":"NEW",
        //              "v":6
        //        },
        //        "s": "MXUSDT",
        //        "t": 1661938853727
        //    }
        // margin
        //    {
        //        "c": "margin@private.orders.v3.api",
        //        "d":{
        //             "O":1661938138000,
        //             "p":"0.8",
        //             "a":"8",
        //             "v":"10",
        //            "da":"0",
        //            "dv":"0",
        //             "A":"8.0",
        //             "V":"10",
        //             "n": "0",
        //             "N": "USDT",
        //             "S":1,
        //             "o":1,
        //             "s":1,
        //             "i":"e03a5c7441e44ed899466a7140b71391",
        //        },
        //        "s": "MXUSDT",
        //        "t":1661938138193
        //    }
        //
        const messageHash = this.safeString (message, 'c');
        const data = this.safeValue (message, 'd', {});
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId);
        const parsed = this.parseWSOrder (data, market);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (parsed);
        // non-symbol specific
        client.resolve (orders, messageHash);
    }

    parseWSOrder (order, market = undefined) {
        //
        // spot
        //     {
        //          "A":8.0,
        //          "O":1661938138000,
        //          "S":1,
        //          "V":10,
        //          "a":8,
        //          "c":"",
        //          "i":"e03a5c7441e44ed899466a7140b71391",
        //          "m":0,
        //          "o":1,
        //          "p":0.8,
        //          "s":1,
        //          "v":10,
        //          "ap":0,
        //          "cv":0,
        //          "ca":0
        //    }
        // spot - stop
        //    {
        //        "N":"USDT",
        //        "O":1661938853715,
        //        "P":0.9,
        //        "S":1,
        //        "T":"LE",
        //        "i":"f6d82e5f41d745f59fe9d3cafffd80b5",
        //        "o":100,
        //        "p":1.01,
        //        "s":"NEW",
        //        "v":6
        //    }
        // margin
        //    {
        //        "O":1661938138000,
        //        "p":"0.8",
        //        "a":"8",
        //        "v":"10",
        //       "da":"0",
        //       "dv":"0",
        //        "A":"8.0",
        //        "V":"10",
        //        "n": "0",
        //        "N": "USDT",
        //        "S":1,
        //        "o":1,
        //        "s":1,
        //        "i":"e03a5c7441e44ed899466a7140b71391",
        //    }
        //
        const timestamp = this.safeInteger (order, 'O');
        const side = this.safeString (order, 'S');
        const status = this.safeString (order, 's');
        const type = this.safeString (order, 'o');
        let fee = undefined;
        const feeCurrency = this.safeString (order, 'N');
        if (feeCurrency !== undefined) {
            fee = {
                'currency': feeCurrency,
                'cost': undefined,
            };
        }
        return this.safeOrder ({
            'id': this.safeString (order, 'i'),
            'clientOrderId': this.safeString (order, 'c'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': this.parseWsOrderStatus (status, market),
            'symbol': this.safeSymbol (undefined, market),
            'type': this.parseWsOrderType (type),
            'timeInForce': this.parseWsTimeInForce (type),
            'side': (side === '1') ? 'buy' : 'sell',
            'price': this.safeString (order, 'p'),
            'stopPrice': undefined,
            'triggerPrice': this.safeNumber (order, 'P'),
            'average': this.safeString (order, 'ap'),
            'amount': this.safeString (order, 'v'),
            'cost': this.safeString (order, 'cv'),
            'filled': this.safeString (order, 'ca'),
            'remaining': this.safeString (order, 'V'),
            'fee': fee,
            'trades': undefined,
            'info': order,
        }, market);
    }

    parseWsOrderStatus (status, market = undefined) {
        const statuses = {
            '1': 'open',     // new order
            '2': 'closed',   // filled
            '3': 'open',     // partially filled
            '4': 'canceled', // canceled
            '5': 'open',     // order partially filled
            '6': 'closed',   // partially filled then canceled
            'NEW': 'open',
            'CANCELED': 'canceled',
            'EXECUTED': 'closed',
            'FAILED': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseWsOrderType (type) {
        const types = {
            '1': 'limit',   // LIMIT_ORDER
            '2': undefined, // POST_ONLY
            '3': undefined, // IMMEDIATE_OR_CANCEL
            '4': undefined, // FILL_OR_KILL
            '5': 'market',  // MARKET_ORDER
            '100': 'limit', // STOP_LIMIT
        };
        return this.safeString (types, type);
    }

    parseWsTimeInForce (timeInForce) {
        const timeInForceIds = {
            '1': 'GTC',   // LIMIT_ORDER
            '2': 'PO', // POST_ONLY
            '3': 'IOC', // IMMEDIATE_OR_CANCEL
            '4': 'FOK', // FILL_OR_KILL
            '5': 'GTC',  // MARKET_ORDER
            '100': 'GTC', // STOP_LIMIT
        };
        return this.safeString (timeInForceIds, timeInForce);
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name mexc3#watchBalance
         * @see https://mxcdevelop.github.io/apidocs/spot_v3_en/#spot-account-upadte
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the mexc3 api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const channel = 'spot@private.account.v3.api';
        return await this.watchPrivateChannel (channel, params);
    }

    handleBalance (client, message) {
        //
        //    {
        //        "c": "spot@private.account.v3.api",
        //        "d": {
        //            "a": "USDT",
        //            "c": 1678185928428,
        //            "f": "302.185113007893322435",
        //            "fd": "-4.990689704",
        //            "l": "4.990689704",
        //            "ld": "4.990689704",
        //            "o": "ENTRUST_PLACE"
        //        },
        //        "t": 1678185928435
        //    }
        //
        const messageHash = this.safeString (message, 'c');
        const data = this.safeValue (message, 'd');
        const timestamp = this.safeInteger (data, 'c');
        this.balance['info'] = data;
        this.balance['timestamp'] = timestamp;
        this.balance['datetime'] = this.iso8601 (timestamp);
        const currencyId = this.safeString (data, 'a');
        const code = this.safeCurrencyCode (currencyId);
        const account = this.account ();
        account['free'] = this.safeString (data, 'f');
        account['used'] = this.safeString (data, 'l');
        this.balance[code] = account;
        this.balance = this.safeBalance (this.balance);
        client.resolve (this.balance, messageHash);
    }

    async watchPrivateChannel (channel, params = {}) {
        const listenKey = await this.authenticate (channel);
        const url = this.urls['api']['ws'] + '?listenKey=' + listenKey;
        const request = {
            'method': 'SUBSCRIPTION',
            'params': [ channel ],
        };
        return await this.watch (url, channel, this.extend (request, params), channel);
    }

    async authenticate (subscriptionHash, params = {}) {
        const listenKeyBySubscriptionsHash = this.safeValue (this.options, 'listenKeyBySubscriptionsHash');
        if (listenKeyBySubscriptionsHash === undefined) {
            this.options['listenKeyBySubscriptionsHash'] = {};
        }
        let listenKey = this.safeString (listenKeyBySubscriptionsHash, subscriptionHash);
        if (listenKey === undefined) {
            this.checkRequiredCredentials ();
            listenKey = await this.createListenKey (params);
            this.options['listenKeyBySubscriptionsHash'][subscriptionHash] = listenKey;
        }
        return listenKey;
    }

    async createListenKey (params = {}) {
        let listenKeys = this.safeValue (this.options, 'listenKeys');
        if (listenKeys === undefined) {
            listenKeys = {};
        }
        const numListenKeys = Object.keys (listenKeys).length;
        const listenKeysLimit = this.safeInteger (this.options, 'maximumListenKeys', 60);
        if (numListenKeys >= listenKeysLimit) {
            throw new ExchangeError (this.id + ' has reached the maximum number of listen keys (' + listenKeysLimit.toString () + ')');
        }
        const time = this.milliseconds ();
        const response = await (this as any).spotPrivatePostUserDataStream (params);
        //
        //    {
        //        "listenKey": "pqia91ma19a5s61cv6a81va65sdf19v8a65a1a5s61cv6a81va65sdf19v8a65a1"
        //    }
        //
        const listenKey = this.safeString (response, 'listenKey');
        listenKeys[listenKey] = time;
        this.options['listenKeys'] = listenKeys;
        const listenKeyRefreshRate = this.safeInteger (this.options, 'listenKeyRefreshRate', 1200000);
        this.delay (listenKeyRefreshRate, this.keepAliveListenKey, listenKey, params);
        return listenKey;
    }

    async keepAliveListenKey (listenKey, params = {}) {
        if (listenKey === undefined) {
            return;
        }
        const request = {
            'listenKey': listenKey,
        };
        const time = this.milliseconds ();
        try {
            await (this as any).spotPrivatePutUserDataStream (this.extend (request, params));
            this.options['listenKeys'][listenKey] = time;
            const listenKeyRefreshRate = this.safeInteger (this.options, 'listenKeyRefreshRate', 1200000);
            this.delay (listenKeyRefreshRate, this.keepAliveListenKey, params);
        } catch (error) {
            const url = this.urls['api']['ws'] + '?listenKey=' + listenKey;
            const client = this.client (url);
            delete this.options['listenKeys'][listenKey];
            client.reject (error);
            delete this.clients[url];
        }
    }

    handlePong (client, message) {
        client.lastPong = this.milliseconds ();
        return message;
    }

    handleSubscriptionStatus (client, message) {
        //
        //    {
        //        id: 0,
        //        code: 0,
        //        msg: 'spot@public.increase.depth.v3.api@BTCUSDT'
        //    }
        //
        const messageHash = this.safeString (message, 'msg');
        if (messageHash === 'PONG') {
            return this.handlePong (client, message);
        }
        const subscription = this.safeValue (client.subscriptions, messageHash);
        if (subscription === undefined) {
            client.reject (message);
            return;
        }
        const method = this.safeValue (subscription, 'method');
        if (method !== undefined) {
            method.call (this, client, message, subscription);
        }
    }

    handleMessage (client, message) {
        if ('msg' in message) {
            return this.handleSubscriptionStatus (client, message);
        }
        const c = this.safeString (message, 'c', '');
        const methods = {
            'public.deals': this.handleTrades,
            'kline': this.handleOHLCV,
            'bookTicker': this.handleTicker,
            'depth': this.handleOrderBook,
            'orders': this.handleOrder,
            'account': this.handleBalance,
            'private.deals': this.handleMyTrade,
        };
        const keys = Object.keys (methods);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (c.indexOf (key) >= 0) {
                return methods[key].call (this, client, message);
            }
        }
    }

    ping (client) {
        return { 'method': 'PING' };
    }
}
