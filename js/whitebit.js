'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { AuthenticationError, BadSymbol, BadRequest } = require ('ccxt/js/base/errors');
const { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class whitebit extends ccxt.whitebit {
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
                    'ws': 'wss://api.whitebit.com/ws',
                },
            },
            'options': {
                'timeframes': {
                    '1m': '60',
                    '5m': '300',
                    '15m': '900',
                    '30m': '1800',
                    '1h': '3600',
                    '4h': '14400',
                    '8h': '28800',
                    '1d': '86400',
                    '1w': '604800',
                },
                'watchOrderBook': {
                    'priceInterval': 0, // "0" - no interval, available values - "0.00000001", "0.0000001", "0.000001", "0.00001", "0.0001", "0.001", "0.01", "0.1"
                },
            },
            'streaming': {
                'ping': this.ping,
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

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
    //     const method = 'candles_subscribe';
    //     await this.loadMarkets ();
    //     const market = this.market (symbol);
    //     symbol = market['symbol'];
    //     const timeframes = this.safeValue (this.options, 'timeframes', {});
    //     const interval = this.safeInteger (timeframes, timeframe);
    //     const marketId = market['id'];
    //     const messageHash = 'candles:' + interval + ':' + symbol;
    //     const reqParams = [ marketId ];
    //     // start and end are mandatory
    //     const now = this.milliseconds ();
    //     const end = this.safeInteger (params, 'end', now);
    //     params = this.omit (params, 'end');
    //     if (since === undefined) {
    //         since = now - (86400 * 1000); // 24 hours
    //     }
    //     // reqParams.push (since);
    //     // reqParams.push (end);
    //     reqParams.push (interval);
    //     const ohlcv = await this.watchPublic (messageHash, method, reqParams, params);
    //     if (this.newUpdates) {
    //         limit = ohlcv.getLimit (symbol, limit);
    //     }
    //     return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        //
        // {
        //     method: 'candles_update',
        //     params: [
        //       [
        //         1655204760,
        //         '22374.15',
        //         '22351.34',
        //         '22374.27',
        //         '22342.52',
        //         '30.213426',
        //         '675499.29718947',
        //         'BTC_USDT'
        //       ]
        //     ],
        //     id: null
        // }
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

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 10; // max 100
        }
        const messageHash = 'orderbook' + ':' + market['symbol'];
        const method = 'depth_subscribe';
        const options = this.safeValue (this.options, 'watchOrderBook', {});
        const defaultPriceInterval = this.safeString (options, 'priceInterval', '0');
        const priceInterval = this.safeString (params, 'priceInterval', defaultPriceInterval);
        params = this.omit (params, 'priceInterval');
        const reqParams = [
            market['id'],
            limit,
            priceInterval,
            true, // true for allowing multiple subscriptions
        ];
        const orderbook = await this.watchPublic (messageHash, method, reqParams, params);
        return orderbook.limit (limit);
    }

    handleOrderBook (client, message) {
        //
        // {
        //     "method":"depth_update",
        //     "params":[
        //        true,
        //        {
        //           "asks":[
        //              [ "21252.45","0.01957"],
        //              ["21252.55","0.126205"],
        //              ["21252.66","0.222689"],
        //              ["21252.76","0.185358"],
        //              ["21252.87","0.210077"],
        //              ["21252.98","0.303991"],
        //              ["21253.08","0.327909"],
        //              ["21253.19","0.399007"],
        //              ["21253.3","0.427695"],
        //              ["21253.4","0.492901"]
        //           ],
        //           "bids":[
        //              ["21248.82","0.22"],
        //              ["21248.73","0.000467"],
        //              ["21248.62","0.100864"],
        //              ["21248.51","0.061436"],
        //              ["21248.42","0.091"],
        //              ["21248.41","0.126839"],
        //              ["21248.3","0.063511"],
        //              ["21248.2","0.110547"],
        //              ["21248","0.25257"],
        //              ["21247.7","1.71813"]
        //           ]
        //        },
        //        "BTC_USDT"
        //     ],
        //     "id":null
        //  }
        //
        const params = this.safeValue (message, 'params', []);
        const marketId = this.safeString (params, 2);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const data = this.safeValue (params, 1);
        const snapshot = this.parseOrderBook (data, symbol, undefined);
        let orderbook = undefined;
        if (!(symbol in this.orderbooks)) {
            orderbook = this.orderBook (snapshot);
            this.orderbooks[symbol] = orderbook;
        } else {
            orderbook = this.orderbooks[symbol];
            orderbook.reset (snapshot);
        }
        const messageHash = 'orderbook' + ':' + symbol;
        client.resolve (orderbook, messageHash);
    }

    async watchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const marketId = market['id'];
        const reqParams = [ marketId ];
        const method = 'market_subscribe';
        const messageHash = 'ticker:' + symbol;
        return await this.watchPublic (messageHash, method, reqParams, params);
    }

    handleTicker (client, message) {
        //
        //   {
        //       method: 'market_update',
        //       params: [
        //         'BTC_USDT',
        //         {
        //           close: '22293.86',
        //           deal: '1986990019.96552952',
        //           high: '24360.7',
        //           last: '22293.86',
        //           low: '20851.44',
        //           open: '24076.12',
        //           period: 86400,
        //           volume: '87016.995668'
        //         }
        //       ],
        //       id: null
        //   }
        //
        const tickers = this.safeValue (message, 'params', []);
        const marketId = this.safeString (tickers, 0);
        const market = this.safeMarket (marketId, undefined);
        const symbol = market['symbol'];
        const rawTicker = this.safeValue (tickers, 1, {});
        const messageHash = 'ticker' + ':' + symbol;
        const ticker = this.parseTicker (rawTicker, market);
        this.tickers[symbol] = ticker;
        client.resolve (ticker, messageHash);
        return message;
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'trade' + ':' + symbol;
        const method = 'trades_request';
        const reqParams = [ market['id'] ];
        if (limit !== undefined) {
            reqParams.push (limit);
        }
        const trades = await this.watchPublic (messageHash, method, reqParams, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        //     {
        //         topic: 'trade',
        //         action: 'partial',
        //         symbol: 'btc-usdt',
        //         data: [
        //             {
        //                 size: 0.05145,
        //                 price: 41977.9,
        //                 side: 'buy',
        //                 timestamp: '2022-04-11T09:40:10.881Z'
        //             },
        //         ]
        //     }
        //
        const channel = this.safeString (message, 'topic');
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const data = this.safeValue (message, 'data', []);
        const parsedTrades = this.parseTrades (data, market);
        for (let j = 0; j < parsedTrades.length; j++) {
            stored.append (parsedTrades[j]);
        }
        const messageHash = channel + ':' + marketId;
        client.resolve (stored, messageHash);
        client.resolve (stored, channel);
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let messageHash = 'usertrade';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + market['id'];
        }
        const trades = await this.watchPrivate (messageHash, 'watchOrders', params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleMyTrades (client, message, subscription = undefined) {
        //
        // {
        //     "topic":"usertrade",
        //     "action":"insert",
        //     "user_id":"103",
        //     "symbol":"xht-usdt",
        //     "data":[
        //        {
        //           "size":1,
        //           "side":"buy",
        //           "price":0.24,
        //           "symbol":"xht-usdt",
        //           "timestamp":"2022-05-13T09:30:15.014Z",
        //           "order_id":"6065a66e-e9a4-44a3-9726-4f8fa54b6bb6",
        //           "fee":0.001,
        //           "fee_coin":"xht",
        //           "is_same":true
        //        }
        //     ],
        //     "time":1652434215
        // }
        //
        const channel = this.safeString (message, 'topic');
        const rawTrades = this.safeValue (message, 'data');
        // usually the first message is an empty array
        // when the user does not have any trades yet
        const dataLength = rawTrades.length;
        if (dataLength === 0) {
            return 0;
        }
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCache (limit);
        }
        const stored = this.myTrades;
        const marketIds = {};
        for (let i = 0; i < rawTrades.length; i++) {
            const trade = rawTrades[i];
            const parsed = this.parseTrade (trade);
            stored.append (parsed);
            const symbol = trade['symbol'];
            const market = this.market (symbol);
            const marketId = market['id'];
            marketIds[marketId] = true;
        }
        // non-symbol specific
        client.resolve (this.myTrades, channel);
        const keys = Object.keys (marketIds);
        for (let i = 0; i < keys.length; i++) {
            const marketId = keys[i];
            const messageHash = channel + ':' + marketId;
            client.resolve (this.myTrades, messageHash);
        }
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
        //    {
        //        "topic":"order",
        //        "action":"partial",
        //        "user_id":155328,
        //        "data":[
        //           {
        //              "created_at":"2022-05-13T08:19:07.694Z",
        //              "fee":0,
        //              "meta":{
        //
        //              },
        //              "symbol":"ltc-usdt",
        //              "side":"buy",
        //              "size":0.1,
        //              "type":"limit",
        //              "price":55,
        //              "fee_structure":{
        //                 "maker":0.1,
        //                 "taker":0.1
        //              },
        //              "fee_coin":"ltc",
        //              "id":"d5e77182-ad4c-4ac9-8ce4-a97f9b43e33c",
        //              "created_by":155328,
        //              "filled":0,
        //              "status":"new",
        //              "updated_at":"2022-05-13T08:19:07.694Z",
        //              "stop":null
        //           }
        //        ],
        //        "time":1652430035
        //       }
        //
        const channel = this.safeString (message, 'topic');
        const data = this.safeValue (message, 'data', {});
        // usually the first message is an empty array
        const dataLength = data.length;
        if (dataLength === 0) {
            return 0;
        }
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const stored = this.orders;
        let rawOrders = undefined;
        if (!Array.isArray (data)) {
            rawOrders = [ data ];
        } else {
            rawOrders = data;
        }
        const marketIds = {};
        for (let i = 0; i < rawOrders.length; i++) {
            const order = rawOrders[i];
            const parsed = this.parseOrder (order);
            stored.append (parsed);
            const symbol = order['symbol'];
            const market = this.market (symbol);
            const marketId = market['id'];
            marketIds[marketId] = true;
        }
        // non-symbol specific
        client.resolve (this.orders, channel);
        const keys = Object.keys (marketIds);
        for (let i = 0; i < keys.length; i++) {
            const marketId = keys[i];
            const messageHash = channel + ':' + marketId;
            client.resolve (this.orders, messageHash);
        }
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

    async watchPublic (messageHash, method, reqParams = [], params = {}) {
        const url = this.urls['api']['ws'];
        const id = this.nonce ();
        const request = {
            'id': id,
            'method': method,
            'params': reqParams,
        };
        const message = this.extend (request, params);
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
        //
        //
        if (!this.handleErrorMessage (client, message)) {
            return;
        }
        const content = this.safeString (message, 'message');
        if (content === 'pong') {
            this.handlePong (client, message);
            return;
        }
        const methods = {
            'market_update': this.handleTicker,
            'trade': this.handleTrades,
            'depth_update': this.handleOrderBook,
            'order': this.handleOrder,
            'wallet': this.handleBalance,
            'usertrade': this.handleMyTrades,
        };
        const topic = this.safeValue (message, 'method');
        const method = this.safeValue (methods, topic);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }

    ping (client) {
        return {
            'id': 0,
            'method': 'ping',
            'params': [],
        };
    }

    handlePong (client, message) {
        client.lastPong = this.milliseconds ();
        return message;
    }
};
