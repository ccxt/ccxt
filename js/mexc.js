'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { AuthenticationError, BadSymbol, BadRequest, NotSupported } = require ('ccxt/js/base/errors');
const { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class mexc extends ccxt.mexc {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': false,
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
                'keepAlive': 9000,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        'Bearer or HMAC authentication required': BadSymbol, // { error: 'Bearer or HMAC authentication required' }
                        'Error: wrong input': BadRequest, // { error: 'Error: wrong input' }
                    },
                },
            },
        });
    }

    async watchTicker (symbol, params = {}) {
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
        // {
        //     symbol: 'BTC_USDT',
        //     data: {
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
        //     },
        //     channel: 'push.kline',
        //     symbol_display: 'BTC_USDT'
        // }
        //
        // swap
        //
        //  {
        //      channel: 'push.kline',
        //      data: {
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
        //      },
        //      symbol: 'BTC_USDT',
        //      ts: 1651230713067
        //  }
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
        //      },
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
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const channel = 'sub.depth';
        const messageHash = 'orderbook' + ':' + symbol;
        const requestParams = {
            'symbol': market['id'],
            'compress': true,
        };
        if (limit !== undefined) {
            if (limit !== 5 && limit !== 10 && limit !== 20) {
                throw new BadRequest (this.id + ' watchOrderBook limit parameter cannot be different from 5, 10 or 20');
            } else {
                requestParams['limit'] = limit;
            }
        }
        let orderbook = undefined;
        if (market['type'] === 'swap') {
            orderbook = await this.watchSwapPublic (messageHash, channel, requestParams, params);
        } else {
            orderbook = await this.watchSpotPublic (messageHash, channel, requestParams, params);
        }
        return orderbook.limit (limit);
    }

    handleOrderBook (client, message) {
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
        //  }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const data = this.safeValue (message, 'data');
        const timestamp = this.safeInteger (message, 'ts');
        const snapshot = this.parseOrderBook (data, symbol, timestamp);
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            const nonce = this.safeNumber (data, 'end');
            snapshot['nonce'] = nonce;
            orderbook = this.orderBook (snapshot);
            this.orderbooks[symbol] = orderbook;
        } else {
            this.handleOrderBookMessage (client, message, orderbook);
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
        // this is only needed for spot markets
        // const nonce = this.safeNumber (data, 'end');
        // if (nonce > orderbook['nonce'])
        const asks = this.safeValue (data, 'asks', []);
        const bids = this.safeValue (data, 'bids', []);
        this.handleDeltas (orderbook['asks'], asks);
        this.handleDeltas (orderbook['bids'], bids);
        const timestamp = this.safeInteger (message, 'ts');
        const marketId = this.safeString (message, 'symbol');
        const symbol = this.safeSymbol (marketId);
        orderbook['symbol'] = symbol;
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        return orderbook;
    }

    handleDelta (bookside, delta) {
        //   [
        //     39146.5,
        //     11264,
        //     1
        //    ]
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
        const parsedTrades = this.parseTrades (trades, market);
        for (let j = 0; j < parsedTrades.length; j++) {
            stored.append (parsedTrades[j]);
        }
        const messageHash = 'trades' + ':' + symbol;
        client.resolve (stored, messageHash);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
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
            const channel = 'sub.personal';
            orders = await this.watchSpotPrivate (messageHash, channel, undefined, params);
        } else {
            // const channel = 'push.personal.order';
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
        const parsed = this.parseOrder (data, market);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (parsed);
        // non-symbol specific
        let channel = 'order';
        client.resolve (orders, channel);
        channel += ':' + market['symbol'];
        client.resolve (orders, channel);
    }

    async watchBalance (params = {}) {
        await this.loadMarkets ();
        const messageHash = 'balance';
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams ('watchBalance', undefined, params);
        if (type === 'spot') {
            throw new NotSupported (this.id + ' watchBalance does not support spot markets');
        } else {
            return this.watchSwapPrivate (messageHash, params);
        }
    }

    handleBalance (client, message) {
        //
        // swap balance
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

    async watchSpotPrivate (messageHash, channel, requestParams = {}, params = {}) {
        this.checkRequiredCredentials ();
        channel = 'sub.personal';
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
        const hash = this.hash (encodedParams, 'md5');
        request['sign'] = hash;
        const extendedRequest = this.extend (request, params);
        const message = this.extend (extendedRequest, requestParams);
        return await this.watch (url, messageHash, message, messageHash);
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
        //     { error: 'Bearer or HMAC authentication required' }
        //     { error: 'Error: wrong input' }
        //
        const error = this.safeInteger (message, 'error');
        try {
            if (error !== undefined) {
                const feedback = this.id + ' ' + this.json (message);
                this.throwExactlyMatchedException (this.exceptions['ws']['exact'], error, feedback);
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
        // auth spot
        //
        // { channel: 'sub.personal', msg: 'OK' }
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
        //     swap ticker
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
        const channel = this.safeString (message, 'channel');
        const methods = {
            'rs.login': this.handleAuthenticate,
            'push.deal': this.handleTrades,
            'orderbook': this.handleOrderBook,
            'push.kline': this.handleOHLCV,
            'push.ticker': this.handleTicker,
            'push.depth': this.handleOrderBook,
            'push.personal.order': this.handleOrder,
        };
        const method = this.safeValue (methods, channel);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }

    ping (client) {
        return { 'method': 'ping' };
    }
};
