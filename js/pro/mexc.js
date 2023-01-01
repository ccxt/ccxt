'use strict';

//  ---------------------------------------------------------------------------

const mexcRest = require ('../mexc.js');
const { AuthenticationError, BadSymbol, BadRequest, NotSupported } = require ('../base/errors');
const { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class mexc extends mexcRest {
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
                'watchTickers': false, // for now
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': 'wss://wbs.mexc.com/raw/ws',
                        'swap': 'wss://contract.mexc.com/ws',
                    },
                },
            },
            'options': {
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
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 10000,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        'signature validation failed': AuthenticationError, // { channel: 'sub.personal', msg: 'signature validation failed'}
                    },
                    'broad': {
                        'Contract not exists': BadSymbol, // { channel: 'rs.error', data: 'Contract not exists', ts: 1651509181535}
                    },
                },
            },
        });
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name mexc#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const channel = 'sub.ticker';
        const messageHash = 'ticker' + ':' + symbol;
        const requestParams = {
            'symbol': market['id'],
        };
        if (market['type'] === 'spot') {
            throw new NotSupported (this.id + ' watchTicker does not support spot markets');
        } else {
            return await this.watchSwapPublic (messageHash, channel, requestParams, params);
        }
    }

    handleTicker (client, message) {
        //
        //     {
        //         channel: 'push.ticker',
        //         data: {
        //           amount24: 491939387.90105,
        //           ask1: 39530.5,
        //           bid1: 39530,
        //           contractId: 10,
        //           fairPrice: 39533.4,
        //           fundingRate: 0.00015,
        //           high24Price: 40310.5,
        //           holdVol: 187680157,
        //           indexPrice: 39538.5,
        //           lastPrice: 39530,
        //           lower24Price: 38633,
        //           maxBidPrice: 43492,
        //           minAskPrice: 35584.5,
        //           riseFallRate: 0.0138,
        //           riseFallValue: 539.5,
        //           symbol: 'BTC_USDT',
        //           timestamp: 1651160401009,
        //           volume24: 125171687
        //         },
        //         symbol: 'BTC_USDT',
        //         ts: 1651160401009
        //     }
        //
        const data = this.safeValue (message, 'data', {});
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const ticker = this.parseTicker (data, market);
        this.tickers[symbol] = ticker;
        const messageHash = 'ticker:' + symbol;
        client.resolve (ticker, messageHash);
        return message;
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const requestParams = {};
        symbol = market['symbol'];
        const type = market['type'];
        const timeframes = this.safeValue (this.options, 'timeframes', {});
        const timeframeValue = this.safeString (timeframes, timeframe);
        const channel = 'sub.kline';
        const messageHash = 'kline' + ':' + timeframeValue + ':' + symbol;
        requestParams['symbol'] = market['id'];
        requestParams['interval'] = timeframeValue;
        if (since !== undefined) {
            requestParams['start'] = since;
        }
        let ohlcv = undefined;
        if (type === 'spot') {
            ohlcv = await this.watchSpotPublic (messageHash, channel, requestParams, params);
        } else {
            ohlcv = await this.watchSwapPublic (messageHash, channel, requestParams, params);
        }
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        // spot
        //   {
        //       symbol: 'BTC_USDT',
        //       data: {
        //         symbol: 'BTC_USDT',
        //         interval: 'Min1',
        //         t: 1651230720,
        //         o: 38870.18,
        //         c: 38867.55,
        //         h: 38873.19,
        //         l: 38867.05,
        //         v: 71031.87886502,
        //         q: 1.827357,
        //         e: 38867.05,
        //         rh: 38873.19,
        //         rl: 38867.05
        //       },
        //       channel: 'push.kline',
        //       symbol_display: 'BTC_USDT'
        //   }
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
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const data = this.safeValue (message, 'data', {});
        const interval = this.safeString (data, 'interval');
        const messageHash = 'kline' + ':' + interval + ':' + symbol;
        const timeframes = this.safeValue (this.options, 'timeframes', {});
        const timeframe = this.findTimeframe (interval, timeframes);
        const parsed = this.parseWsOHLCV (data, market);
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
        // spot
        //    {
        //       symbol: 'BTC_USDT',
        //       interval: 'Min1',
        //       t: 1651230720,
        //       o: 38870.18,
        //       c: 38867.55,
        //       h: 38873.19,
        //       l: 38867.05,
        //       v: 71031.87886502,
        //       q: 1.827357,
        //       e: 38867.05,
        //       rh: 38873.19,
        //       rl: 38867.05
        //     }
        //
        // swap
        //
        //   {
        //        a: 325653.3287,
        //        c: 38839,
        //        h: 38909.5,
        //        interval: 'Min1',
        //        l: 38833,
        //        o: 38901.5,
        //        q: 83808,
        //        rc: 38839,
        //        rh: 38909.5,
        //        rl: 38833,
        //        ro: 38909.5,
        //        symbol: 'BTC_USDT',
        //        t: 1651230660
        //    }
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

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'orderbook' + ':' + symbol;
        const requestParams = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            if (limit !== 5 && limit !== 10 && limit !== 20) {
                throw new BadRequest (this.id + ' watchOrderBook limit parameter cannot be different from 5, 10 or 20');
            }
        } else {
            limit = 20;
        }
        let orderbook = undefined;
        if (market['type'] === 'swap') {
            const channel = 'sub.depth';
            requestParams['compress'] = true;
            requestParams['limit'] = limit;
            orderbook = await this.watchSwapPublic (messageHash, channel, requestParams, params);
        } else {
            const channel = 'sub.limit.depth';
            requestParams['depth'] = limit;
            orderbook = await this.watchSpotPublic (messageHash, channel, requestParams, params);
        }
        return orderbook.limit ();
    }

    handleOrderBook (client, message) {
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
        // spot
        // {
        //     "channel":"push.limit.depth",
        //     "symbol":"BTC_USDT",
        //     "data":{
        //        "asks":[
        //           [
        //              "38694.68",
        //              "2.250996"
        //           ],
        //        ],
        //        "bids":[
        //           [
        //              "38694.65",
        //              "0.783084"
        //           ],
        //        ]
        //     },
        //     "depth":5,
        //     "version":"1170951528"
        //  }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const data = this.safeValue (message, 'data');
        const timestamp = this.safeInteger (message, 'ts');
        const snapshot = this.parseOrderBook (data, symbol, timestamp);
        let nonce = this.safeNumber (data, 'end');
        if (nonce === undefined) {
            nonce = this.safeNumber (message, 'version');
        }
        snapshot['nonce'] = nonce;
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook (snapshot);
            this.orderbooks[symbol] = orderbook;
        } else {
            // spot channels always return entire snapshots
            // whereas swap channels return incremental updates
            // after the first message
            if (market['type'] === 'spot') {
                orderbook.reset (snapshot);
            } else {
                this.handleOrderBookMessage (client, message, orderbook);
            }
        }
        const messageHash = 'orderbook' + ':' + symbol;
        client.resolve (orderbook, messageHash);
    }

    handleOrderBookMessage (client, message, orderbook) {
        //
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
        //
        const data = this.safeValue (message, 'data', {});
        const nonce = this.safeNumber (data, 'end');
        const asks = this.safeValue (data, 'asks', []);
        const bids = this.safeValue (data, 'bids', []);
        this.handleDeltas (orderbook['asks'], asks);
        this.handleDeltas (orderbook['bids'], bids);
        const timestamp = this.safeInteger (message, 'ts');
        const marketId = this.safeString (message, 'symbol');
        const symbol = this.safeSymbol (marketId);
        orderbook['nonce'] = nonce;
        orderbook['symbol'] = symbol;
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        return orderbook;
    }

    handleDelta (bookside, delta) {
        //
        //  [
        //     39146.5,
        //     11264,
        //     1
        //  ]
        //
        const price = this.safeFloat (delta, 0);
        const amount = this.safeFloat (delta, 1);
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const channel = 'sub.deal';
        const messageHash = 'trades' + ':' + symbol;
        const requestParams = {
            'symbol': market['id'],
        };
        let trades = undefined;
        if (market['type'] === 'spot') {
            trades = await this.watchSpotPublic (messageHash, channel, requestParams, params);
        } else {
            trades = await this.watchSwapPublic (messageHash, channel, requestParams, params);
        }
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        // swap trades
        //     {
        //         "channel":"push.deal",
        //         "data":{
        //             "M":1,
        //             "O":1,
        //             "T":1,
        //             "p":6866.5,
        //             "t":1587442049632,
        //             "v":2096
        //         },
        //         "symbol":"BTC_USDT",
        //         "ts":1587442022003
        //     }
        //
        // spot trades
        //
        //    {
        //        "symbol":"BTC_USDT",
        //        "data":{
        //           "deals":[
        //              {
        //                 "t":1651227552839,
        //                 "p":"39190.01",
        //                 "q":"0.001357",
        //                 "T":2
        //              }
        //           ]
        //        },
        //        "channel":"push.deal"
        //     }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const data = this.safeValue (message, 'data', {});
        let trades = undefined;
        if ('deals' in data) {
            trades = this.safeValue (data, 'deals', []);
        } else {
            trades = [ data ];
        }
        for (let j = 0; j < trades.length; j++) {
            const parsedTrade = this.parseWsTrade (trades[j], market);
            stored.append (parsedTrade);
        }
        const messageHash = 'trades' + ':' + symbol;
        client.resolve (stored, messageHash);
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure
         */
        await this.loadMarkets ();
        let messageHash = 'trade';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + market['symbol'];
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchMyTrades', market, params);
        let trades = undefined;
        if (type === 'spot') {
            throw new NotSupported (this.id + ' watchMyTrades does not support spot markets');
        } else {
            trades = await this.watchSwapPrivate (messageHash, params);
        }
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleMyTrade (client, message, subscription = undefined) {
        //
        // swap trade
        //    {
        //        channel: 'push.personal.order.deal',
        //        data: {
        //          category: 1,
        //          fee: 0.00060288,
        //          feeCurrency: 'USDT',
        //          id: '311655369',
        //          isSelf: false,
        //          orderId: '276461245253669888',
        //          positionMode: 1,
        //          price: 100.48,
        //          profit: 0.0003,
        //          side: 4,
        //          symbol: 'LTC_USDT',
        //          taker: true,
        //          timestamp: 1651583897276,
        //          vol: 1
        //        },
        //        ts: 1651583897291
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        const parsed = this.parseWsTrade (data, market);
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const trades = this.myTrades;
        trades.append (parsed);
        let channel = 'trade';
        // non-symbol specific
        client.resolve (trades, channel);
        channel += ':' + market['symbol'];
        client.resolve (trades, channel);
    }

    parseWsTrade (trade, market = undefined) {
        //
        // public spot
        //    {
        //       "t":1651227552839,
        //       "p":"39190.01",
        //       "q":"0.001357",
        //       "T":2
        //    }
        //
        // public swap
        //
        //   {
        //     "M":1,
        //     "O":1,
        //     "T":1,
        //     "p":6866.5,
        //     "t":1587442049632,
        //     "v":2096
        //   }
        //
        // private swap
        //   {
        //       category: 1,
        //       fee: 0.00060288,2
        //       feeCurrency: 'USDT',
        //       id: '311655369',
        //       isSelf: false,
        //       orderId: '276461245253669888',
        //       positionMode: 1,
        //       price: 100.48,
        //       profit: 0.0003,
        //       side: 4,
        //       symbol: 'LTC_USDT',
        //       taker: true,
        //       timestamp: 1651583897276,
        //       vol: 1
        //   }
        //
        const timestamp = this.safeInteger2 (trade, 'timestamp', 't');
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market, '_');
        const symbol = market['symbol'];
        const priceString = this.safeString2 (trade, 'price', 'p');
        let amountString = this.safeString2 (trade, 'vol', 'q');
        if (amountString === undefined) {
            amountString = this.safeString (trade, 'v');
        }
        let rawSide = this.safeString (trade, 'T');
        let side = undefined;
        if (rawSide === undefined) {
            rawSide = this.safeString (trade, 'side');
            side = this.parseSwapSide (rawSide);
        } else {
            side = (rawSide === '1') ? 'buy' : 'sell';
        }
        let id = this.safeString (trade, 'id');
        if (id === undefined) {
            id = timestamp.toString () + '-' + market['id'] + '-' + amountString;
        }
        const feeCostString = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'feeCurrency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        const orderId = this.safeString (trade, 'orderId');
        const isTaker = this.safeValue (trade, 'taker', true);
        const takerOrMaker = isTaker ? 'taker' : 'maker';
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let messageHash = 'order';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + market['symbol'];
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchOrders', market, params);
        let orders = undefined;
        if (type === 'spot') {
            orders = await this.watchSpotPrivate (messageHash, params);
        } else {
            orders = await this.watchSwapPrivate (messageHash, params);
        }
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrder (client, message, subscription = undefined) {
        //
        // spot order
        //     {
        //         symbol: 'LTC_USDT',
        //         data: {
        //           price: 100.25,
        //           quantity: 0.0498,
        //           amount: 4.99245,
        //           remainAmount: 0.01245,
        //           remainQuantity: 0,
        //           remainQ: 0,
        //           remainA: 0,
        //           id: '0b1bf3a33916499f8d1a711a7d5a6fc4',
        //           status: 2,
        //           tradeType: 1,
        //           orderType: 3,
        //           createTime: 1651499416000,
        //           isTaker: 1,
        //           symbolDisplay: 'LTC_USDT',
        //           clientOrderId: ''
        //         },
        //         channel: 'push.personal.order',
        //         eventTime: 1651499416639,
        //         symbol_display: 'LTC_USDT'
        //     }
        //
        // spot trigger
        //
        //   {
        //       symbol: 'LTC_USDT',
        //       data: {
        //         id: '048dddc31b9a451084b8db8b561a0e33',
        //         market: 'USDT',
        //         currency: 'LTC',
        //         triggerType: 'LE',
        //         triggerPrice: 80,
        //         tradeType: 'BUY',
        //         orderType: 100,
        //         price: 70,
        //         quantity: 0.0857,
        //         state: 'NEW',
        //         createTime: 1651578450223,
        //         currencyDisplay: 'LTC'
        //       },
        //       channel: 'push.personal.trigger.order',
        //       symbol_display: 'LTC_USDT'
        //     }
        //
        //  swap order
        // {
        //     channel: 'push.personal.order',
        //     data: {
        //       category: 1,
        //       createTime: 1651500368131,
        //       dealAvgPrice: 0,
        //       dealVol: 0,
        //       errorCode: 0,
        //       externalOid: '_m_4a78c91ca8be4c4580d94e637b1f70d1',
        //       feeCurrency: 'USDT',
        //       leverage: 1,
        //       makerFee: 0,
        //       openType: 2,
        //       orderId: '276110898672819715',
        //       orderMargin: 0.5006,
        //       orderType: 1,
        //       positionId: 0,
        //       positionMode: 1,
        //       price: 50,
        //       profit: 0,
        //       remainVol: 1,
        //       side: 1,
        //       state: 2,
        //       symbol: 'LTC_USDT',
        //       takerFee: 0,
        //       updateTime: 1651500368142,
        //       usedMargin: 0,
        //       version: 1,
        //       vol: 1
        //     },
        //     ts: 1651500368149
        //   }
        //
        const data = this.safeValue (message, 'data', {});
        let marketId = this.safeString (message, 'symbol');
        if (marketId === undefined) {
            marketId = this.safeString (data, 'symbol');
        }
        const market = this.safeMarket (marketId);
        const parsed = this.parseWSOrder (data, market);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (parsed);
        let channel = 'order';
        // non-symbol specific
        client.resolve (orders, channel);
        channel += ':' + market['symbol'];
        client.resolve (orders, channel);
    }

    parseWSOrder (order, market = undefined) {
        //
        // spot order
        //     {
        //           price: 100.25,
        //           quantity: 0.0498,
        //           amount: 4.99245,
        //           remainAmount: 0.01245,
        //           remainQuantity: 0,
        //           remainQ: 0,
        //           remainA: 0,
        //           id: '0b1bf3a33916499f8d1a711a7d5a6fc4',
        //           status: 2,
        //           tradeType: 1, // 1 = buy, 2 = sell
        //           orderType: 3, // 1 = limit, 3 = market, 100 = 'limit
        //           createTime: 1651499416000,
        //           isTaker: 1,
        //           symbolDisplay: 'LTC_USDT',
        //           clientOrderId: ''
        //     }
        //
        // spot trigger order
        //    {
        //        id: '048dddc31b9a451084b8db8b561a0e33',
        //        market: 'USDT',
        //        currency: 'LTC',
        //        triggerType: 'LE',
        //        triggerPrice: 80,
        //        tradeType: 'BUY',
        //        orderType: 100,
        //        price: 70,
        //        quantity: 0.0857,
        //        state: 'NEW',
        //        createTime: 1651578450223,
        //        currencyDisplay: 'LTC'
        //    }
        //
        //  swap order
        //   {
        //       category: 1,
        //       createTime: 1651500368131,
        //       dealAvgPrice: 0,
        //       dealVol: 0,
        //       errorCode: 0,
        //       externalOid: '_m_4a78c91ca8be4c4580d94e637b1f70d1',
        //       feeCurrency: 'USDT',
        //       leverage: 1,
        //       makerFee: 0,
        //       openType: 2,
        //       orderId: '276110898672819715',
        //       orderMargin: 0.5006,
        //       orderType: 1, // 5 = market, 1 = limit,
        //       positionId: 0,
        //       positionMode: 1,
        //       price: 50,
        //       profit: 0,
        //       remainVol: 1,
        //       side: 1,
        //       state: 2,
        //       symbol: 'LTC_USDT',
        //       takerFee: 0,
        //       updateTime: 1651500368142,
        //       usedMargin: 0,
        //       version: 1,
        //       vol: 1
        //     }
        //
        const id = this.safeString2 (order, 'orderId', 'id');
        const state = this.safeString2 (order, 'state', 'status');
        const timestamp = this.safeInteger (order, 'createTime');
        const price = this.safeString (order, 'price');
        const amount = this.safeString2 (order, 'quantity', 'vol');
        const remaining = this.safeString (order, 'remainQuantity');
        const filled = this.safeString (order, 'dealVol');
        const cost = this.safeString (order, 'amount');
        const avgPrice = this.safeString (order, 'dealAvgPrice');
        const marketId = this.safeString2 (order, 'symbol', 'symbolDisplay');
        const symbol = this.safeSymbol (marketId, market, '_');
        const sideCheck = this.safeString (order, 'side');
        let side = this.parseSwapSide (sideCheck);
        if (side === undefined) {
            const tradeType = this.safeStringLower (order, 'tradeType');
            if ((tradeType === 'ask') || (tradeType === '2')) {
                side = 'sell';
            } else if ((tradeType === 'bid') || (tradeType === '1')) {
                side = 'buy';
            } else {
                side = tradeType;
            }
        }
        const status = this.parseWsOrderStatus (state, market);
        let clientOrderId = this.safeString2 (order, 'client_order_id', 'orderId');
        if (clientOrderId === '') {
            clientOrderId = undefined;
        }
        const rawType = this.safeString (order, 'orderType');
        const isMarket = (rawType === '3') || (rawType === '5');
        const type = isMarket ? 'market' : 'limit';
        return this.safeOrder ({
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': this.safeInteger (order, 'updateTime'),
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'average': avgPrice,
            'amount': amount,
            'cost': cost,
            'filled': filled,
            'remaining': remaining,
            'fee': undefined,
            'trades': undefined,
            'info': order,
        }, market);
    }

    parseSwapSide (side) {
        const sides = {
            '1': 'open long',
            '2': 'close short',
            '3': 'open short',
            '4': 'close long',
        };
        return this.safeString (sides, side);
    }

    parseWsOrderStatus (status, market = undefined) {
        let statuses = {};
        if (market['type'] === 'spot') {
            statuses = {
                // spot limit/market
                '1': 'open',
                '2': 'closed',
                '3': 'open',
                '4': 'canceled',
                '5': 'open',
                // spot trigger only
                'NEW': 'open',
                'FILLED': 'closed',
                'PARTIALLY_FILLED': 'open',
                'CANCELED': 'canceled',
                'PARTIALLY_CANCELED': 'canceled',
            };
        } else {
            statuses = {
                '2': 'open',
                '3': 'closed',
                '4': 'canceled',
            };
        }
        return this.safeString (statuses, status, status);
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name mexc#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the mexc api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const messageHash = 'balance';
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchBalance', undefined, params);
        if (type === 'spot') {
            throw new NotSupported (this.id + ' watchBalance does not support spot markets');
        } else {
            return this.watchSwapPrivate (messageHash, params);
        }
    }

    handleBalance (client, message) {
        //
        // swap balance
        //
        // {
        //     channel: 'push.personal.asset',
        //     data: {
        //       availableBalance: 49.2076809226,
        //       bonus: 0,
        //       currency: 'USDT',
        //       frozenBalance: 0.5006,
        //       positionMargin: 0
        //     },
        //     ts: 1651501676430
        // }
        //
        const data = this.safeValue (message, 'data');
        const currencyId = this.safeString (data, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const account = this.account ();
        account['free'] = this.safeString (data, 'availableBalance');
        account['used'] = this.safeString (data, 'frozenBalance');
        this.balance[code] = account;
        this.balance = this.safeBalance (this.balance);
        const messageHash = 'balance';
        client.resolve (this.balance, messageHash);
    }

    async watchSwapPublic (messageHash, channel, requestParams, params = {}) {
        const url = this.urls['api']['ws']['swap'];
        const request = {
            'method': channel,
            'param': requestParams,
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    async watchSpotPublic (messageHash, channel, requestParams, params = {}) {
        const url = this.urls['api']['ws']['spot'];
        const request = {
            'op': channel,
        };
        const extendedRequest = this.extend (request, requestParams);
        const message = this.extend (extendedRequest, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    async watchSpotPrivate (messageHash, params = {}) {
        this.checkRequiredCredentials ();
        const channel = 'sub.personal';
        const url = this.urls['api']['ws']['spot'];
        const timestamp = this.milliseconds ().toString ();
        const request = {
            'op': channel,
            'api_key': this.apiKey,
            'req_time': timestamp,
        };
        const sortedParams = this.keysort (request);
        sortedParams['api_secret'] = this.secret;
        const encodedParams = this.urlencode (sortedParams);
        const hash = this.hash (this.encode (encodedParams), 'md5');
        request['sign'] = hash;
        const extendedRequest = this.extend (request, params);
        return await this.watch (url, messageHash, extendedRequest, channel);
    }

    async watchSwapPrivate (messageHash, params = {}) {
        this.checkRequiredCredentials ();
        const channel = 'login';
        const url = this.urls['api']['ws']['swap'];
        const timestamp = this.milliseconds ().toString ();
        const payload = this.apiKey + timestamp;
        const signature = this.hmac (this.encode (payload), this.encode (this.secret), 'sha256');
        const request = {
            'method': channel,
            'param': {
                'apiKey': this.apiKey,
                'signature': signature,
                'reqTime': timestamp,
            },
        };
        const extendedRequest = this.extend (request, params);
        const message = this.extend (extendedRequest, params);
        return await this.watch (url, messageHash, message, channel);
    }

    handleErrorMessage (client, message) {
        //
        //   { channel: 'sub.personal', msg: 'signature validation failed' }
        //
        //   {
        //       channel: 'rs.error',
        //       data: 'Contract not exists',
        //       ts: 1651509181535
        //   }
        //
        const channel = this.safeString (message, 'channel');
        try {
            const feedback = this.id + ' ' + this.json (message);
            if (channel.indexOf ('error') >= 0) {
                const data = this.safeValue (message, 'data');
                if (typeof data === 'string') {
                    this.throwExactlyMatchedException (this.exceptions['ws']['exact'], data, feedback);
                    this.throwBroadlyMatchedException (this.exceptions['ws']['broad'], data, feedback);
                }
            }
            if (channel === 'sub.personal') {
                const msg = this.safeString (message, 'msg');
                this.throwExactlyMatchedException (this.exceptions['ws']['exact'], msg, feedback);
            }
        } catch (e) {
            if (e instanceof AuthenticationError) {
                return false;
            }
        }
        return message;
    }

    handleAuthenticate (client, message) {
        //
        //  { channel: 'rs.login', data: 'success', ts: 1651486643082 }
        //
        //  { channel: 'sub.personal', msg: 'OK' }
        //
        return message;
    }

    handleMessage (client, message) {
        //
        // spot pong
        //
        //  "ping"
        //
        // swap pong
        //  { channel: 'pong', data: 1651570941402, ts: 1651570941402 }
        //
        // auth spot
        //
        //  { channel: 'sub.personal', msg: 'OK' }
        //
        // auth swap
        //
        //  { channel: 'rs.login', data: 'success', ts: 1651486643082 }
        //
        // subscription
        //
        //  { channel: 'rs.sub.depth', data: 'success', ts: 1651239594401 }
        //
        // swap ohlcv
        //     {
        //         "channel":"push.kline",
        //         "data":{
        //             "a":233.740269343644737245,
        //             "c":6885,
        //             "h":6910.5,
        //             "interval":"Min60",
        //             "l":6885,
        //             "o":6894.5,
        //             "q":1611754,
        //             "symbol":"BTC_USDT",
        //             "t":1587448800
        //         },
        //         "symbol":"BTC_USDT",
        //         "ts":1587442022003
        //     }
        //
        // swap ticker
        //     {
        //         channel: 'push.ticker',
        //         data: {
        //           amount24: 491939387.90105,
        //           ask1: 39530.5,
        //           bid1: 39530,
        //           contractId: 10,
        //           fairPrice: 39533.4,
        //           fundingRate: 0.00015,
        //           high24Price: 40310.5,
        //           holdVol: 187680157,
        //           indexPrice: 39538.5,
        //           lastPrice: 39530,
        //           lower24Price: 38633,
        //           maxBidPrice: 43492,
        //           minAskPrice: 35584.5,
        //           riseFallRate: 0.0138,
        //           riseFallValue: 539.5,
        //           symbol: 'BTC_USDT',
        //           timestamp: 1651160401009,
        //           volume24: 125171687
        //         },
        //         symbol: 'BTC_USDT',
        //         ts: 1651160401009
        //       }
        //
        // swap trades
        //     {
        //         "channel":"push.deal",
        //         "data":{
        //             "M":1,
        //             "O":1,
        //             "T":1,
        //             "p":6866.5,
        //             "t":1587442049632,
        //             "v":2096
        //         },
        //         "symbol":"BTC_USDT",
        //         "ts":1587442022003
        //     }
        //
        // spot trades
        //
        //    {
        //        "symbol":"BTC_USDT",
        //        "data":{
        //           "deals":[
        //              {
        //                 "t":1651227552839,
        //                 "p":"39190.01",
        //                 "q":"0.001357",
        //                 "T":2
        //              }
        //           ]
        //        },
        //        "channel":"push.deal"
        //     }
        //
        // spot order
        //     {
        //         symbol: 'LTC_USDT',
        //         data: {
        //           price: 100.25,
        //           quantity: 0.0498,
        //           amount: 4.99245,
        //           remainAmount: 0.01245,
        //           remainQuantity: 0,
        //           remainQ: 0,
        //           remainA: 0,
        //           id: '0b1bf3a33916499f8d1a711a7d5a6fc4',
        //           status: 2,
        //           tradeType: 1,
        //           orderType: 3,
        //           createTime: 1651499416000,
        //           isTaker: 1,
        //           symbolDisplay: 'LTC_USDT',
        //           clientOrderId: ''
        //         },
        //         channel: 'push.personal.order',
        //         eventTime: 1651499416639,
        //         symbol_display: 'LTC_USDT'
        //     }
        //
        if (!this.handleErrorMessage (client, message)) {
            return;
        }
        if (message === 'pong') {
            this.handlePong (client, message);
            return;
        }
        const channel = this.safeString (message, 'channel');
        const methods = {
            'pong': this.handlePong,
            'rs.login': this.handleAuthenticate,
            'push.deal': this.handleTrades,
            'orderbook': this.handleOrderBook,
            'push.kline': this.handleOHLCV,
            'push.ticker': this.handleTicker,
            'push.depth': this.handleOrderBook,
            'push.limit.depth': this.handleOrderBook,
            'push.personal.order': this.handleOrder,
            'push.personal.trigger.order': this.handleOrder,
            'push.personal.plan.order': this.handleOrder,
            'push.personal.order.deal': this.handleMyTrade,
            'push.personal.asset': this.handleBalance,
        };
        const method = this.safeValue (methods, channel);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }

    ping (client) {
        const type = this.safeString (this.options, 'defaultType', 'spot');
        if (type === 'spot') {
            return 'ping';
        }
        return { 'method': 'ping' };
    }

    handlePong (client, message) {
        //
        // { channel: 'pong', data: 1651570941402, ts: 1651570941402 }
        //
        client.lastPong = this.milliseconds ();
        return message;
    }
};
