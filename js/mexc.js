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
                'watchTicker': false,
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
            },
            'streaming': {
                '!!ping': this.ping,
                'keepAlive': 10000,
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
            throw new NotSupported ();
            // return await this.watchSpotPublic (messageHash, channel, requestParams, params) ;
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
        const options = this.safeValue (this.options, 'timeframes', {});
        const timeframes = this.safeValue (options, 'contract', {});
        const timeframeValue = this.safeString (timeframes, timeframe);
        const channel = 'sub.kline';
        const messageHash = 'kline' + ':' + symbol + ':' + timeframeValue;
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
        //
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
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const data = this.safeValue (message, 'data', {});
        const interval = this.safeString (data, 'interval');
        const messageHash = 'kline' + ':' + interval + ':' + symbol;
        const timeframe = this.findTimeframe (interval);
        const parsed = this.parseOHLCV (message, market);
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

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const channel = 'sub.depth';
        const messageHash = 'orderbook' + ':' + market['id'];
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
        //     {
        //         "topic":"orderbook",
        //         "action":"partial",
        //         "symbol":"ltc-usdt",
        //         "data":{
        //             "bids":[
        //                 [104.29, 5.2264],
        //                 [103.86,1.3629],
        //                 [101.82,0.5942]
        //             ],
        //             "asks":[
        //                 [104.81,9.5531],
        //                 [105.54,0.6416],
        //                 [106.18,1.4141],
        //             ],
        //             "timestamp":"2022-04-12T08:17:05.932Z"
        //         },
        //         "time":1649751425
        //     }
        //
        const marketId = this.safeString (message, 'symbol');
        const channel = this.safeString (message, 'topic');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const data = this.safeValue (message, 'data');
        let timestamp = this.safeString (data, 'timestamp');
        timestamp = this.parse8601 (timestamp);
        const snapshot = this.parseOrderBook (data, symbol, timestamp);
        let orderbook = undefined;
        if (!(symbol in this.orderbooks)) {
            orderbook = this.orderBook (snapshot);
            this.orderbooks[symbol] = orderbook;
        } else {
            orderbook = this.orderbooks[symbol];
            orderbook.reset (snapshot);
        }
        const messageHash = channel + ':' + marketId;
        client.resolve (orderbook, messageHash);
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
            messageHash += ':' + market['id'];
        }
        const orders = await this.watchPrivate (messageHash, 'watchOrders', params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrder (client, message, subscription = undefined) {
        //
        //     {
        //         topic: 'order',
        //         action: 'insert',
        //         user_id: 155328,
        //         symbol: 'ltc-usdt',
        //         data: {
        //             symbol: 'ltc-usdt',
        //             side: 'buy',
        //             size: 0.05,
        //             type: 'market',
        //             price: 0,
        //             fee_structure: { maker: 0.1, taker: 0.1 },
        //             fee_coin: 'ltc',
        //             id: 'ce38fd48-b336-400b-812b-60c636454231',
        //             created_by: 155328,
        //             filled: 0.05,
        //             method: 'market',
        //             created_at: '2022-04-11T14:09:00.760Z',
        //             updated_at: '2022-04-11T14:09:00.760Z',
        //             status: 'filled'
        //         },
        //         time: 1649686140
        //     }
        //
        const channel = this.safeString (message, 'topic');
        const marketId = this.safeString (message, 'symbol');
        const data = this.safeValue (message, 'data', {});
        // usually the first message is an empty array
        const dataLength = data.length;
        if (dataLength === 0) {
            return 0;
        }
        const parsed = this.parseOrder (data);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (parsed);
        client.resolve (orders);
        // non-symbol specific
        client.resolve (orders, channel);
        const messageHash = channel + ':' + marketId;
        client.resolve (orders, messageHash);
    }

    async watchBalance (params = {}) {
        const messageHash = 'wallet';
        return await this.watchPrivate (messageHash, 'watchBalance', params);
    }

    handleBalance (client, message) {
        //
        //     {
        //         topic: 'wallet',
        //         action: 'partial',
        //         user_id: 155328,
        //         data: {
        //             eth_balance: 0,
        //             eth_available: 0,
        //             usdt_balance: 18.94344188,
        //             usdt_available: 18.94344188,
        //             ltc_balance: 0.00005,
        //             ltc_available: 0.00005,
        //         },
        //         time: 1649687396
        //     }
        //
        const messageHash = this.safeString (message, 'topic');
        const data = this.safeValue (message, 'data');
        const keys = Object.keys (data);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const parts = key.split ('_');
            const currencyId = this.safeString (parts, 0);
            const code = this.safeCurrencyCode (currencyId);
            const account = (code in this.balance) ? this.balance[code] : this.account ();
            const second = this.safeString (parts, 1);
            const freeOrTotal = (second === 'available') ? 'free' : 'total';
            account[freeOrTotal] = this.safeString (data, key);
            this.balance[code] = account;
        }
        this.balance = this.safeBalance (this.balance);
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

    async watchPrivate (messageHash, method, params = {}) {
        const options = this.safeValue (this.options, method, {});
        let expires = this.safeString (options, 'api-expires');
        if (expires === undefined) {
            const timeout = parseInt (this.timeout / 1000);
            expires = this.sum (this.seconds (), timeout);
            expires = expires.toString ();
            // we need to memoize these values to avoid generating a new url on each method execution
            // that would trigger a new connection on each received message
            this.options[method]['api-expires'] = expires;
        }
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws'];
        const auth = 'CONNECT' + '/stream' + expires;
        const signature = this.hmac (this.encode (auth), this.encode (this.secret));
        const authParams = {
            'api-key': this.apiKey,
            'api-signature': signature,
            'api-expires': expires,
        };
        const signedUrl = url + '?' + this.urlencode (authParams);
        const request = {
            'op': 'subscribe',
            'args': [ messageHash ],
        };
        const message = this.extend (request, params);
        return await this.watch (signedUrl, messageHash, message, messageHash);
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

    handleMessage (client, message) {
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
        //
        if (!this.handleErrorMessage (client, message)) {
            return;
        }
        const channel = this.safeString (message, 'channel');
        const methods = {
            'push.deal': this.handleTrades,
            'orderbook': this.handleOrderBook,
            'push.kline': this.handleOHLCV,
            'push.ticker': this.handleTicker,
        };
        const method = this.safeValue (methods, channel);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }

    ping (client) {
        return { 'method': 'ping' };
    }

    handlePong (client, message) {
        client.lastPong = this.milliseconds ();
        return message;
    }
};
