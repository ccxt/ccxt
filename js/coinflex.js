'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { AuthenticationError, BadSymbol, BadRequest } = require ('ccxt/js/base/errors');
const { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class coinflex extends ccxt.coinflex {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': false,
                'watchOHLCV': false,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': false, // for now
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://v2api.coinflex.com/v2/websocket',
                },
                'test': {
                    'ws': 'wss://v2stgapi.coinflex.com/v2/websocket',
                },
            },
            'options': {
            },
            'exceptions': {
                'ws': {
                },
            },
        });
    }

    async watchTicker (symbol, params = {}) {
        const channel = 'ticker';
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = channel + ':' + market['id'];
        return await this.watchPublic (messageHash, params);
    }

    handleTicker (client, message) {
        //
        //     {
        //         table: 'ticker',
        //         data: [
        //           {
        //             last: '29586',
        //             open24h: '29718',
        //             high24h: '31390',
        //             low24h: '29299',
        //             volume24h: '30861108.9365753390',
        //             currencyVolume24h: '1017.773',
        //             openInterest: '0',
        //             marketCode: 'BTC-USD',
        //             timestamp: '1652693831002',
        //             lastQty: '0.001',
        //             markPrice: '29586',
        //             lastMarkPrice: '29601'
        //           }
        //         ]
        //     }
        //
        const topic = this.safeString (message, 'table');
        const tickers = this.safeValue (message, 'data', []);
        for (let i = 0; i < tickers.length; i++) {
            const data = tickers[i];
            const marketId = this.safeString (data, 'marketCode');
            const market = this.safeMarket (marketId, undefined);
            const messageHash = topic + ':' + marketId;
            // we need a custom parser here
            const ticker = this.parseTicker (data, market);
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
            client.resolve (ticker, messageHash);
        }
        return message;
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const channel = 'candles';
        await this.loadMarkets ();
        const market = this.market (symbol);
        const interval = this.timeframes[timeframe];
        const messageHash = channel + interval + ':' + market['id'];
        const ohlcv = await this.watchPublic (messageHash, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        //
        //     "table":"candles60s",
        //     "data":[
        //        {
        //           "candle":[
        //              "1652695200000",
        //              "29598",
        //              "29598",
        //              "29597.585628",
        //              "29597.585628",
        //              "1589597.531322996",
        //              "53.707"
        //           ],
        //           "marketCode":"BTC-USD"
        //        }
        //     ]
        //  }
        //
        const topic = this.safeString (message, 'table');
        const interval = topic.replace ('candles', '');
        const data = this.safeValue (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const candles = this.safeValue (entry, 'candle', []);
            const marketId = this.safeString (entry, 'marketCode');
            const market = this.safeMarket (marketId, undefined);
            const messageHash = topic + ':' + marketId;
            const symbol = market['symbol'];
            const timeframe = this.findTimeframe (interval);
            const ohlcvs = this.parseWsOHLCV (candles, market);
            this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
            let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                stored = new ArrayCacheByTimestamp (limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            stored.append (ohlcvs);
            client.resolve (stored, messageHash);
        }
    }

    parseWsOHLCV (ohlcv, market = undefined) {
        //
        //  [
        //     "1652695200000",
        //     "29598",
        //     "29598",
        //     "29597.585628",
        //     "29597.585628",
        //     "1589597.531322996",
        //     "53.707"
        //  ]
        //
        return [
            this.safeNumber (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 6),
        ];
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        const channel = 'depth';
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = channel + ':' + market['id'];
        const orderbook = await this.watchPublic (messageHash, params);
        return orderbook.limit (limit);
    }

    handleOrderBook (client, message) {
        //
        // we get always the full snapshot
        //
        // {
        //     "table":"depth",
        //     "data":[
        //        {
        //           "instrumentId":"BTC-USD-SWAP-LIN",
        //           "seqNum":"1650424356029712528",
        //           "asks":[
        //              [29878,0.303,0,0 ],
        //              [29880,0.004,0,0 ],
        //           ],
        //           "checksum":-1222631948,
        //           "bids":[
        //              [ 29877, 0.047, 0, 0 ],
        //              [ 29872, 0.001, 0, 0 ],
        //           ],
        //           "timestamp":"1652708448921"
        //        }
        //     ],
        //     "action":"partial"
        //  }
        //
        const channel = this.safeString (message, 'table');
        const data = this.safeValue (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const marketId = this.safeString (entry, 'instrumentId');
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const timestamp = this.safeInteger (entry, 'timestamp');
            const snapshot = this.parseOrderBook (entry, symbol, timestamp);
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
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const channel = 'trade';
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = channel + ':' + market['id'];
        const trades = await this.watchPublic (messageHash, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        //    {
        //        table: 'trade',
        //        data: [
        //          {
        //            side: 'BUY',
        //            quantity: '0.042',
        //            price: '30081.0',
        //            marketCode: 'BTC-USD-SWAP-LIN',
        //            tradeId: '304734619689878207',
        //            timestamp: '1652698566797'
        //          }
        //        ]
        //    }
        //
        const topic = this.safeString (message, 'table');
        const data = this.safeValue (message, 'data', []);
        const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
        const marketIds = {};
        for (let i = 0; i < data.length; i++) {
            const trade = data[i];
            const marketId = this.safeString (trade, 'marketCode');
            marketIds[marketId] = true;
            const market = this.safeMarket (marketId, undefined);
            const symbol = market['symbol'];
            // we need a custom parser here too
            const parsedTrade = this.parseWsTrade (trade, market);
            let stored = this.safeValue (this.trades, symbol);
            if (stored === undefined) {
                stored = new ArrayCache (tradesLimit);
                this.trades[symbol] = stored;
            }
            stored.append (parsedTrade);
        }
        const marketIdsArray = Object.keys (marketIds);
        for (let i = 0; i < marketIdsArray.length; i++) {
            const marketId = marketIdsArray[i];
            const messageHash = topic + ':' + marketId;
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const stored = this.safeValue (this.trades, symbol);
            client.resolve (stored, messageHash);
        }
    }

    parseWsTrade (trade, market = undefined) {
        //
        //   {
        //       side: 'BUY',
        //       quantity: '0.042',
        //       price: '30081.0',
        //       marketCode: 'BTC-USD-SWAP-LIN',
        //       tradeId: '304734619689878207',
        //       timestamp: '1652698566797'
        //   }
        //
        const marketId = this.safeString (trade, 'marketCode');
        market = this.safeMarket (marketId, market);
        const id = this.safeString (trade, 'tradeId');
        const timestamp = this.safeInteger (trade, 'timestamp');
        const side = this.safeStringLower (trade, 'side');
        const amount = this.safeString (trade, 'quantity');
        const price = this.safeString (trade, 'price');
        return this.safeTrade ({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }

    // async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
    //     await this.loadMarkets ();
    //     let messageHash = 'usertrade';
    //     let market = undefined;
    //     if (symbol !== undefined) {
    //         market = this.market (symbol);
    //         symbol = market['symbol'];
    //         messageHash += ':' + market['id'];
    //     }
    //     const trades = await this.watchPrivate (messageHash, 'watchOrders', params);
    //     if (this.newUpdates) {
    //         limit = trades.getLimit (symbol, limit);
    //     }
    //     return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    // }

    // handleMyTrades (client, message, subscription = undefined) {
    //     //
    //     // {
    //     //     "topic":"usertrade",
    //     //     "action":"insert",
    //     //     "user_id":"103",
    //     //     "symbol":"xht-usdt",
    //     //     "data":[
    //     //        {
    //     //           "size":1,
    //     //           "side":"buy",
    //     //           "price":0.24,
    //     //           "symbol":"xht-usdt",
    //     //           "timestamp":"2022-05-13T09:30:15.014Z",
    //     //           "order_id":"6065a66e-e9a4-44a3-9726-4f8fa54b6bb6",
    //     //           "fee":0.001,
    //     //           "fee_coin":"xht",
    //     //           "is_same":true
    //     //        }
    //     //     ],
    //     //     "time":1652434215
    //     // }
    //     //
    //     const channel = this.safeString (message, 'topic');
    //     const rawTrades = this.safeValue (message, 'data');
    //     // usually the first message is an empty array
    //     // when the user does not have any trades yet
    //     const dataLength = rawTrades.length;
    //     if (dataLength === 0) {
    //         return 0;
    //     }
    //     if (this.myTrades === undefined) {
    //         const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
    //         this.myTrades = new ArrayCache (limit);
    //     }
    //     const stored = this.myTrades;
    //     const marketIds = {};
    //     for (let i = 0; i < rawTrades.length; i++) {
    //         const trade = rawTrades[i];
    //         const parsed = this.parseTrade (trade);
    //         stored.append (parsed);
    //         const symbol = trade['symbol'];
    //         const market = this.market (symbol);
    //         const marketId = market['id'];
    //         marketIds[marketId] = true;
    //     }
    //     // non-symbol specific
    //     client.resolve (this.myTrades, channel);
    //     const keys = Object.keys (marketIds);
    //     for (let i = 0; i < keys.length; i++) {
    //         const marketId = keys[i];
    //         const messageHash = channel + ':' + marketId;
    //         client.resolve (this.myTrades, messageHash);
    //     }
    // }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let messageHash = 'order';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + market['id'];
        } else {
            messageHash += ':all';
        }
        const orders = await this.watchPrivate (messageHash, params);
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
        const messageHash = 'balance:all';
        return await this.watchPrivate (messageHash, params);
    }

    handleBalance (client, message) {
        //
        //    {
        //        table: 'balance',
        //        accountId: '39422',
        //        timestamp: '1652710563235',
        //        tradeType: 'LINEAR',
        //        data: [
        //          {
        //            total: '47.7114057900',
        //            reserved: '6.00',
        //            instrumentId: 'USD',
        //            available: '41.7114057900',
        //            quantityLastUpdated: '1652188203911'
        //          },
        //          {
        //            total: '0.98',
        //            reserved: '0',
        //            instrumentId: 'DOGE',
        //            available: '0.98',
        //            quantityLastUpdated: '1651655519741'
        //          }
        //        ]
        //    }
        //
        const channel = this.safeString (message, 'table');
        const data = this.safeValue (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const currencyId = this.safeString (balance, 'instrumentId');
            const code = this.safeCurrencyCode (currencyId);
            const account = (code in this.balance) ? this.balance[code] : this.account ();
            account['total'] = this.safeString (balance, 'total');
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'reserved');
            this.balance[code] = account;
        }
        this.balance = this.safeBalance (this.balance);
        const messageHash = channel + ':all';
        client.resolve (this.balance, messageHash);
    }

    async watchPublic (messageHash, params = {}) {
        const url = this.urls['api']['ws'];
        const id = this.nonce ();
        const request = {
            'op': 'subscribe',
            'tag': id,
            'args': [ messageHash ],
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    async watchPrivate (messageHash, params = {}) {
        await this.authenticate ();
        return await this.watchPublic (messageHash, params);
    }

    async authenticate (params = {}) {
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws'];
        const messageHash = 'login';
        const client = this.client (url);
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            future = client.future ('authenticated');
            const timestamp = this.milliseconds ().toString ();
            const method = 'GET';
            const path = '/auth/self/verify';
            const auth = timestamp + method + path;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256', 'base64');
            const request = {
                'op': messageHash,
                'data': {
                    'apiKey': this.apiKey,
                    'timestamp': timestamp,
                    'signature': signature,
                },
            };
            this.spawn (this.watch, url, messageHash, request, messageHash, future);
        }
        return await future;
    }

    handleErrorMessage (client, message) {
        //
        // {
        //     event: 'login',
        //     success: false,
        //     message: 'Signature is invalid',
        //     code: '20000',
        //     timestamp: '1652709878447'
        // }
        //
        const success = this.safeValue (message, 'success');
        try {
            if (!success) {
                const error = this.safeString (message, 'code');
                const feedback = this.id + ' ' + this.json (message);
                this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            }
        } catch (e) {
            if (e instanceof AuthenticationError) {
                client.reject (e, 'authenticated');
                const method = 'login';
                if (method in client.subscriptions) {
                    delete client.subscriptions[method];
                }
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
        const event = this.safeString (message, 'event');
        if (event === 'login') {
            this.handleAuthenticate (client, message);
            return;
        }
        const tables = {
            'ticker': this.handleTicker,
            'trade': this.handleTrades,
            'depth': this.handleOrderBook,
            'order': this.handleOrder,
            'balance': this.handleBalance,
            // 'usertrade': this.handleMyTrades,
        };
        const topic = this.safeString (message, 'table');
        // specific check because this topic has the timeframe attached
        // so we would need to list all possibilities in the methods object
        if (topic !== undefined && topic.indexOf ('candles') >= 0) {
            this.handleOHLCV (client, message);
            return;
        }
        const method = this.safeValue (tables, topic);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }

    handleAuthenticate (client, message) {
        //
        //  { event: 'login', success: true, timestamp: '1652710009321' }
        //
        client.resolve (message, 'authenticated');
        return message;
    }

    handlePong (client, message) {
        client.lastPong = this.milliseconds ();
        return message;
    }
};
