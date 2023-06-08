
//  ---------------------------------------------------------------------------

import mexcRest from '../mexc.js';
import { ExchangeError, AuthenticationError } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class mexc extends mexcRest {
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
                    'ws': {
                        'spot': 'wss://wbs.mexc.com/ws',
                        'swap': 'wss://contract.mexc.com/ws',
                    },
                },
            },
            'options': {
                'listenKeyRefreshRate': 1200000,
                // TODO add reset connection after #16754 is merged
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
                    'snapshotDelay': 25,
                    'maxRetries': 3,
                },
                'listenKey': undefined,
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 10000,
            },
            'exceptions': {
            },
        });
    }

    async watchTicker (symbol: string, params = {}) {
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
        const messageHash = 'ticker:' + market['symbol'];
        if (market['spot']) {
            const channel = 'spot@public.bookTicker.v3.api@' + market['id'];
            return await this.watchSpotPublic (channel, messageHash, params);
        } else {
            const channel = 'sub.ticker';
            const requestParams = {
                'symbol': market['id'],
            };
            return await this.watchSwapPublic (channel, messageHash, requestParams, params);
        }
    }

    handleTicker (client: Client, message) {
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
        const rawTicker = this.safeValue2 (message, 'd', 'data');
        const marketId = this.safeString2 (message, 's', 'symbol');
        const timestamp = this.safeInteger (message, 't');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let ticker = undefined;
        if (market['spot']) {
            ticker = this.parseWsTicker (rawTicker, market);
            ticker['timestamp'] = timestamp;
            ticker['datetime'] = this.iso8601 (timestamp);
        } else {
            ticker = this.parseTicker (rawTicker, market);
        }
        this.tickers[symbol] = ticker;
        const messageHash = 'ticker:' + symbol;
        client.resolve (ticker, messageHash);
    }

    parseWsTicker (ticker, market = undefined) {
        //
        // spot
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

    async watchSpotPublic (channel, messageHash, params = {}) {
        const url = this.urls['api']['ws']['spot'];
        const request = {
            'method': 'SUBSCRIPTION',
            'params': [ channel ],
        };
        return await this.watch (url, messageHash, this.extend (request, params), channel);
    }

    async watchSpotPrivate (channel, messageHash, params = {}) {
        this.checkRequiredCredentials ();
        const listenKey = await this.authenticate (channel);
        const url = this.urls['api']['ws']['spot'] + '?listenKey=' + listenKey;
        const request = {
            'method': 'SUBSCRIPTION',
            'params': [ channel ],
        };
        return await this.watch (url, messageHash, this.extend (request, params), channel);
    }

    async watchSwapPublic (channel, messageHash, requestParams, params = {}) {
        const url = this.urls['api']['ws']['swap'];
        const request = {
            'method': channel,
            'param': requestParams,
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    async watchSwapPrivate (messageHash, params = {}) {
        this.checkRequiredCredentials ();
        const channel = 'login';
        const url = this.urls['api']['ws']['swap'];
        const timestamp = this.milliseconds ().toString ();
        const payload = this.apiKey + timestamp;
        const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256);
        const request = {
            'method': channel,
            'param': {
                'apiKey': this.apiKey,
                'signature': signature,
                'reqTime': timestamp,
            },
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, channel);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
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
        const messageHash = 'candles:' + symbol + ':' + timeframe;
        let ohlcv = undefined;
        if (market['spot']) {
            const channel = 'spot@public.kline.v3.api@' + market['id'] + '@' + timeframeId;
            ohlcv = await this.watchSpotPublic (channel, messageHash, params);
        } else {
            const channel = 'sub.kline';
            const requestParams = {
                'symbol': market['id'],
                'interval': timeframeId,
            };
            ohlcv = await this.watchSwapPublic (channel, messageHash, requestParams, params);
        }
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        // spot
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
        // swap
        //
        //   {
        //       channel: 'push.kline',
        //       data: {
        //         a: 325653.3287,
        //         c: 38839,
        //         h: 38909.5,
        //         interval: 'Min1',
        //         l: 38833,
        //         o: 38901.5,
        //         q: 83808,
        //         rc: 38839,
        //         rh: 38909.5,
        //         rl: 38833,
        //         ro: 38909.5,
        //         symbol: 'BTC_USDT',
        //         t: 1651230660
        //       },
        //       symbol: 'BTC_USDT',
        //       ts: 1651230713067
        //   }
        //
        const d = this.safeValue2 (message, 'd', 'data', {});
        const rawOhlcv = this.safeValue (d, 'k', d);
        const timeframeId = this.safeString2 (rawOhlcv, 'i', 'interval');
        const timeframes = this.safeValue (this.options, 'timeframes', {});
        const timeframe = this.findTimeframe (timeframeId, timeframes);
        const marketId = this.safeString2 (message, 's', 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'candles:' + symbol + ':' + timeframe;
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
    }

    parseWsOHLCV (ohlcv, market = undefined) {
        //
        // spot
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
        // swap
        //    {
        //       symbol: 'BTC_USDT',
        //       interval: 'Min1',
        //       t: 1680055080,
        //       o: 27301.9,
        //       c: 27301.8,
        //       h: 27301.9,
        //       l: 27301.8,
        //       a: 8.19054,
        //       q: 3,
        //       ro: 27301.8,
        //       rc: 27301.8,
        //       rh: 27301.8,
        //       rl: 27301.8
        //     }
        //
        return [
            this.safeIntegerProduct (ohlcv, 't', 1000),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber2 (ohlcv, 'v', 'q'),
        ];
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
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
        const messageHash = 'orderbook:' + symbol;
        let orderbook = undefined;
        if (market['spot']) {
            const channel = 'spot@public.increase.depth.v3.api@' + market['id'];
            orderbook = await this.watchSpotPublic (channel, messageHash, params);
        } else {
            const channel = 'sub.depth';
            const requestParams = {
                'symbol': market['id'],
            };
            orderbook = await this.watchSwapPublic (channel, messageHash, requestParams, params);
        }
        return orderbook.limit ();
    }

    handleOrderBookSubscription (client: Client, message) {
        // spot
        //     { id: 0, code: 0, msg: 'spot@public.increase.depth.v3.api@BTCUSDT' }
        //
        const msg = this.safeString (message, 'msg');
        const parts = msg.split ('@');
        const marketId = this.safeString (parts, 2);
        const symbol = this.safeSymbol (marketId);
        this.orderbooks[symbol] = this.orderBook ({});
    }

    getCacheIndex (orderbook, cache) {
        // return the first index of the cache that can be applied to the orderbook or -1 if not possible
        const nonce = this.safeInteger (orderbook, 'nonce');
        const firstDelta = this.safeValue (cache, 0);
        const firstDeltaNonce = this.safeInteger2 (firstDelta, 'r', 'version');
        if (nonce < firstDeltaNonce - 1) {
            return -1;
        }
        for (let i = 0; i < cache.length; i++) {
            const delta = cache[i];
            const deltaNonce = this.safeInteger2 (delta, 'r', 'version');
            if (deltaNonce >= nonce) {
                return i;
            }
        }
        return cache.length;
    }

    handleOrderBook (client: Client, message) {
        //
        // spot
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
        //
        //
        // swap
        //  {
        //      "channel":"push.depth",
        //      "data":{
        //         "asks":[
        //            [
        //               39146.5,
        //               11264,
        //               1
        //            ]
        //         ],
        //         "bids":[
        //            [
        //               39144,
        //               35460,
        //               1
        //            ]
        //         ],
        //         "end":4895965272,
        //         "begin":4895965271
        //      },
        //      "symbol":"BTC_USDT",
        //      "ts":1651239652372
        //  }
        //
        const data = this.safeValue2 (message, 'd', 'data');
        const marketId = this.safeString2 (message, 's', 'symbol');
        const symbol = this.safeSymbol (marketId);
        const messageHash = 'orderbook:' + symbol;
        const subscription = this.safeValue (client.subscriptions, messageHash);
        if (subscription === true) {
            // we set client.subscriptions[messageHash] to 1
            // once we have received the first delta and initialized the orderbook
            client.subscriptions[messageHash] = 1;
            this.orderbooks[symbol] = this.countedOrderBook ({});
        }
        const storedOrderBook = this.safeValue (this.orderbooks, symbol);
        const nonce = this.safeInteger (storedOrderBook, 'nonce');
        if (nonce === undefined) {
            const cacheLength = storedOrderBook.cache.length;
            const snapshotDelay = this.handleOption ('watchOrderBook', 'snapshotDelay', 25);
            if (cacheLength === snapshotDelay) {
                this.spawn (this.loadOrderBook, client, messageHash, symbol);
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
            if (Array.isArray (bidask)) {
                bookside.storeArray (bidask);
            } else {
                const price = this.safeFloat (bidask, 'p');
                const amount = this.safeFloat (bidask, 'v');
                bookside.store (price, amount);
            }
        }
    }

    handleDelta (orderbook, delta) {
        const nonce = this.safeInteger (orderbook, 'nonce');
        const deltaNonce = this.safeInteger2 (delta, 'r', 'version');
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

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
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
        const messageHash = 'trades:' + symbol;
        let trades = undefined;
        if (market['spot']) {
            const channel = 'spot@public.deals.v3.api@' + market['id'];
            trades = await this.watchSpotPublic (channel, messageHash, params);
        } else {
            const channel = 'sub.deal';
            const requestParams = {
                'symbol': market['id'],
            };
            trades = await this.watchSwapPublic (channel, messageHash, requestParams, params);
        }
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
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
        // swap
        //     {
        //         "symbol": "BTC_USDT",
        //         "data": {
        //             "p": 27307.3,
        //             "v": 5,
        //             "T": 2,
        //             "O": 3,
        //             "M": 1,
        //             "t": 1680055941870
        //         },
        //         "channel": "push.deal",
        //         "ts": 1680055941870
        //     }
        //
        const marketId = this.safeString2 (message, 's', 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'trades:' + symbol;
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const d = this.safeValue2 (message, 'd', 'data');
        const trades = this.safeValue (d, 'deals', [ d ]);
        for (let j = 0; j < trades.length; j++) {
            let parsedTrade = undefined;
            if (market['spot']) {
                parsedTrade = this.parseWsTrade (trades[j], market);
            } else {
                parsedTrade = this.parseTrade (trades[j], market);
            }
            stored.append (parsedTrade);
        }
        client.resolve (stored, messageHash);
    }

    async watchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
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
        let messageHash = 'myTrades';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = messageHash + ':' + symbol;
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchMyTrades', market, params);
        let trades = undefined;
        if (type === 'spot') {
            const channel = 'spot@private.deals.v3.api';
            trades = await this.watchSpotPrivate (channel, messageHash, params);
        } else {
            trades = await this.watchSwapPrivate (messageHash, params);
        }
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleMyTrade (client: Client, message, subscription = undefined) {
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
        const messageHash = 'myTrades';
        const data = this.safeValue2 (message, 'd', 'data');
        const futuresMarketId = this.safeString (data, 'symbol');
        const marketId = this.safeString (message, 's', futuresMarketId);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let trade = undefined;
        if (market['spot']) {
            trade = this.parseWsTrade (data, market);
        } else {
            trade = this.parseTrade (data, market);
        }
        let trades = this.myTrades;
        if (trades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            trades = new ArrayCacheBySymbolById (limit);
            this.myTrades = trades;
        }
        trades.append (trade);
        client.resolve (trades, messageHash);
        const symbolSpecificMessageHash = messageHash + ':' + symbol;
        client.resolve (trades, symbolSpecificMessageHash);
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

    async watchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
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
        params = this.omit (params, 'type');
        let messageHash = 'orders';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = messageHash + ':' + symbol;
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchOrders', market, params);
        let orders = undefined;
        if (type === 'spot') {
            const channel = type + '@private.orders.v3.api';
            orders = await this.watchSpotPrivate (channel, messageHash, params);
        } else {
            orders = await this.watchSwapPrivate (messageHash, params);
        }
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    handleOrder (client: Client, message) {
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
        const messageHash = 'orders';
        const data = this.safeValue2 (message, 'd', 'data');
        const futuresMarketId = this.safeString (data, 'symbol');
        const marketId = this.safeString (message, 's', futuresMarketId);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let parsed = undefined;
        if (market['spot']) {
            parsed = this.parseWsOrder (data, market);
        } else {
            parsed = this.parseOrder (data, market);
        }
        let orders = this.orders;
        if (orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            orders = new ArrayCacheBySymbolById (limit);
            this.orders = orders;
        }
        orders.append (parsed);
        client.resolve (orders, messageHash);
        const symbolSpecificMessageHash = messageHash + ':' + symbol;
        client.resolve (orders, symbolSpecificMessageHash);
    }

    parseWsOrder (order, market = undefined) {
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
            'cost': this.safeString (order, 'a'),
            'filled': this.safeString (order, 'cv'),
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
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchBalance', undefined, params);
        const messageHash = 'balance:' + type;
        if (type === 'spot') {
            const channel = 'spot@private.account.v3.api';
            return await this.watchSpotPrivate (channel, messageHash, params);
        } else {
            return await this.watchSwapPrivate (messageHash, params);
        }
    }

    handleBalance (client: Client, message) {
        //
        // spot
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
        //
        // swap balance
        //
        //     {
        //         "channel": "push.personal.asset",
        //         "data": {
        //             "availableBalance": 67.2426683348,
        //             "bonus": 0,
        //             "currency": "USDT",
        //             "frozenBalance": 0,
        //             "positionMargin": 1.36945756
        //         },
        //         "ts": 1680059188190
        //     }
        //
        const c = this.safeString (message, 'c');
        const type = (c === undefined) ? 'swap' : 'spot';
        const messageHash = 'balance:' + type;
        const data = this.safeValue2 (message, 'd', 'data');
        const futuresTimestamp = this.safeInteger (message, 'ts');
        const timestamp = this.safeInteger (data, 'c', futuresTimestamp);
        if (!(type in this.balance)) {
            this.balance[type] = {};
        }
        this.balance[type]['info'] = data;
        this.balance[type]['timestamp'] = timestamp;
        this.balance[type]['datetime'] = this.iso8601 (timestamp);
        const currencyId = this.safeString2 (data, 'a', 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const account = this.account ();
        account['free'] = this.safeString2 (data, 'f', 'availableBalance');
        account['used'] = this.safeString2 (data, 'l', 'frozenBalance');
        this.balance[type][code] = account;
        this.balance[type] = this.safeBalance (this.balance[type]);
        client.resolve (this.balance[type], messageHash);
    }

    async authenticate (subscriptionHash, params = {}) {
        // we only need one listenKey since ccxt shares connections
        let listenKey = this.safeString (this.options, 'listenKey');
        if (listenKey !== undefined) {
            return listenKey;
        }
        const response = await this.spotPrivatePostUserDataStream (params);
        //
        //    {
        //        "listenKey": "pqia91ma19a5s61cv6a81va65sdf19v8a65a1a5s61cv6a81va65sdf19v8a65a1"
        //    }
        //
        listenKey = this.safeString (response, 'listenKey');
        this.options['listenKey'] = listenKey;
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
        try {
            await this.spotPrivatePutUserDataStream (this.extend (request, params));
            const listenKeyRefreshRate = this.safeInteger (this.options, 'listenKeyRefreshRate', 1200000);
            this.delay (listenKeyRefreshRate, this.keepAliveListenKey, listenKey, params);
        } catch (error) {
            const url = this.urls['api']['ws'] + '?listenKey=' + listenKey;
            const client = this.client (url);
            this.options['listenKey'] = undefined;
            client.reject (error);
            delete this.clients[url];
        }
    }

    handlePong (client: Client, message) {
        client.lastPong = this.milliseconds ();
        return message;
    }

    handleSubscriptionStatus (client: Client, message) {
        //
        //    {
        //        id: 0,
        //        code: 0,
        //        msg: 'spot@public.increase.depth.v3.api@BTCUSDT'
        //    }
        //
        const msg = this.safeString (message, 'msg');
        if (msg === 'PONG') {
            return this.handlePong (client, message);
        } else if (msg.indexOf ('@') > -1) {
            const parts = msg.split ('@');
            const channel = this.safeString (parts, 1);
            const methods = {
                'public.increase.depth.v3.api': this.handleOrderBookSubscription,
            };
            const method = this.safeValue (methods, channel);
            if (method !== undefined) {
                method.call (this, client, message);
            }
        }
    }

    handleMessage (client: Client, message) {
        if (typeof message === 'string') {
            if (message === 'Invalid listen key') {
                const error = new AuthenticationError (this.id + ' invalid listen key');
                client.reject (error);
            }
            return;
        }
        if ('msg' in message) {
            return this.handleSubscriptionStatus (client, message);
        }
        const c = this.safeString (message, 'c');
        let channel = undefined;
        if (c === undefined) {
            channel = this.safeString (message, 'channel');
        } else {
            const parts = c.split ('@');
            channel = this.safeString (parts, 1);
        }
        const methods = {
            'public.deals.v3.api': this.handleTrades,
            'push.deal': this.handleTrades,
            'public.kline.v3.api': this.handleOHLCV,
            'push.kline': this.handleOHLCV,
            'public.bookTicker.v3.api': this.handleTicker,
            'push.ticker': this.handleTicker,
            'public.increase.depth.v3.api': this.handleOrderBook,
            'push.depth': this.handleOrderBook,
            'private.orders.v3.api': this.handleOrder,
            'push.personal.order': this.handleOrder,
            'private.account.v3.api': this.handleBalance,
            'push.personal.asset': this.handleBalance,
            'private.deals.v3.api': this.handleMyTrade,
            'push.personal.order.deal': this.handleMyTrade,
            'pong': this.handlePong,
        };
        if (channel in methods) {
            const method = methods[channel];
            method.call (this, client, message);
        }
    }

    ping (client) {
        return { 'method': 'ping' };
    }
}
