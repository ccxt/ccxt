'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ExchangeError, AuthenticationError, BadRequest, ArgumentsRequired } = require ('ccxt/js/base/errors');
const { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class gateio extends ccxt.gateio {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchTicker': true,
                'watchTickers': false, // for now
                'watchTrades': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchBalance': true,
                'watchOrders': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.gate.io/v4',
                    'spot': 'wss://api.gateio.ws/ws/v4/',
                    'swap': {
                        'usdt': 'wss://fx-ws.gateio.ws/v4/ws/usdt',
                        'btc': 'wss://fx-ws.gateio.ws/v4/ws/btc',
                    },
                    'future': {
                        'usdt': 'wss://fx-ws.gateio.ws/v4/ws/delivery/usdt',
                        'btc': 'wss://fx-ws.gateio.ws/v4/ws/delivery/btc',
                    },
                    'option': 'wss://op-ws.gateio.live/v4/ws',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
                'watchTradesSubscriptions': {},
                'watchTickerSubscriptions': {},
                'watchOrderBookSubscriptions': {},
            },
        });
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const uppercaseId = marketId.toUpperCase ();
        const requestId = this.nonce ();
        const url = this.urls['api']['ws'];
        const options = this.safeValue (this.options, 'watchOrderBook', {});
        const defaultLimit = this.safeInteger (options, 'limit', 30);
        if (!limit) {
            limit = defaultLimit;
        } else if (limit !== 1 && limit !== 5 && limit !== 10 && limit !== 20 && limit !== 30) {
            throw new ExchangeError (this.id + ' watchOrderBook limit argument must be undefined, 1, 5, 10, 20, or 30');
        }
        const interval = this.safeString (params, 'interval', '100ms');
        const parameters = [ uppercaseId, limit, interval ];
        const subscriptions = this.safeValue (options, 'subscriptions', {});
        subscriptions[symbol] = parameters;
        options['subscriptions'] = subscriptions;
        this.options['watchOrderBook'] = options;
        const toSend = Object.values (subscriptions);
        const messageHash = 'depth.update' + ':' + marketId;
        const subscribeMessage = {
            'id': requestId,
            'method': 'depth.subscribe',
            'params': toSend,
        };
        const subscription = {
            'id': requestId,
        };
        const orderbook = await this.watch (url, messageHash, subscribeMessage, messageHash, subscription);
        return orderbook.limit (limit);
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

    handleOrderBook (client, message) {
        //
        //     {
        //         "method":"depth.update",
        //         "params":[
        //             true, // snapshot or not
        //             {
        //                 "asks":[
        //                     ["7449.62","0.3933"],
        //                     ["7450","3.58662932"],
        //                     ["7450.44","0.15"],
        //                 "bids":[
        //                     ["7448.31","0.69984534"],
        //                     ["7447.08","0.7506"],
        //                     ["7445.74","0.4433"],
        //                 ]
        //             },
        //             "BTC_USDT"
        //         ],
        //         "id":null
        //     }
        //
        const params = this.safeValue (message, 'params', []);
        const clean = this.safeValue (params, 0);
        const book = this.safeValue (params, 1);
        const marketId = this.safeString (params, 2);
        const symbol = this.safeSymbol (marketId);
        const method = this.safeString (message, 'method');
        const messageHash = method + ':' + marketId;
        let orderBook = undefined;
        const options = this.safeValue (this.options, 'watchOrderBook', {});
        const subscriptions = this.safeValue (options, 'subscriptions', {});
        const subscription = this.safeValue (subscriptions, symbol, []);
        const defaultLimit = this.safeInteger (options, 'limit', 30);
        const limit = this.safeValue (subscription, 1, defaultLimit);
        if (clean) {
            orderBook = this.orderBook ({}, limit);
            this.orderbooks[symbol] = orderBook;
        } else {
            orderBook = this.orderbooks[symbol];
        }
        this.handleDeltas (orderBook['asks'], this.safeValue (book, 'asks', []));
        this.handleDeltas (orderBook['bids'], this.safeValue (book, 'bids', []));
        client.resolve (orderBook, messageHash);
    }

    async watchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const uppercaseId = marketId.toUpperCase ();
        const requestId = this.nonce ();
        const url = this.urls['api']['ws'];
        const options = this.safeValue (this.options, 'watchTicker', {});
        const subscriptions = this.safeValue (options, 'subscriptions', {});
        subscriptions[uppercaseId] = true;
        options['subscriptions'] = subscriptions;
        this.options['watchTicker'] = options;
        const subscribeMessage = {
            'id': requestId,
            'method': 'ticker.subscribe',
            'params': Object.keys (subscriptions),
        };
        const subscription = {
            'id': requestId,
        };
        const messageHash = 'ticker.update' + ':' + marketId;
        return await this.watch (url, messageHash, subscribeMessage, messageHash, subscription);
    }

    handleTicker (client, message) {
        //
        //     {
        //         'method': 'ticker.update',
        //         'params': [
        //             'BTC_USDT',
        //             {
        //                 'period': 86400, // 24 hours = 86400 seconds
        //                 'open': '9027.96',
        //                 'close': '9282.93',
        //                 'high': '9428.57',
        //                 'low': '8900',
        //                 'last': '9282.93',
        //                 'change': '2.8',
        //                 'quoteVolume': '1838.9950613035',
        //                 'baseVolume': '17032535.24172142379566994715'
        //             }
        //         ],
        //         'id': null
        //     }
        //
        const params = this.safeValue (message, 'params', []);
        const marketId = this.safeString (params, 0);
        const market = this.safeMarket (marketId, undefined, '_');
        const symbol = market['symbol'];
        const ticker = this.safeValue (params, 1, {});
        const result = this.parseTicker (ticker, market);
        const methodType = message['method'];
        const messageHash = methodType + ':' + marketId;
        this.tickers[symbol] = result;
        client.resolve (result, messageHash);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const uppercaseId = marketId.toUpperCase ();
        const requestId = this.nonce ();
        const url = this.urls['api']['ws'];
        const options = this.safeValue (this.options, 'watchTrades', {});
        const subscriptions = this.safeValue (options, 'subscriptions', {});
        subscriptions[uppercaseId] = true;
        options['subscriptions'] = subscriptions;
        this.options['watchTrades'] = options;
        const subscribeMessage = {
            'id': requestId,
            'method': 'trades.subscribe',
            'params': Object.keys (subscriptions),
        };
        const subscription = {
            'id': requestId,
        };
        const messageHash = 'trades.update' + ':' + marketId;
        const trades = await this.watch (url, messageHash, subscribeMessage, messageHash, subscription);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        //     [
        //         'BTC_USDT',
        //         [
        //             {
        //                 id: 221994511,
        //                 time: 1580311438.618647,
        //                 price: '9309',
        //                 amount: '0.0019',
        //                 type: 'sell'
        //             },
        //             {
        //                 id: 221994501,
        //                 time: 1580311433.842509,
        //                 price: '9311.31',
        //                 amount: '0.01',
        //                 type: 'buy'
        //             },
        //         ]
        //     ]
        //
        const params = this.safeValue (message, 'params', []);
        const marketId = this.safeString (params, 0);
        const market = this.safeMarket (marketId, undefined, '_');
        const symbol = market['symbol'];
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const trades = this.safeValue (params, 1, []);
        const parsed = this.parseTrades (trades, market);
        for (let i = 0; i < parsed.length; i++) {
            stored.append (parsed[i]);
        }
        const methodType = message['method'];
        const messageHash = methodType + ':' + marketId;
        client.resolve (stored, messageHash);
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const uppercaseId = marketId.toUpperCase ();
        const requestId = this.nonce ();
        const url = this.urls['api']['ws'];
        const interval = this.parseTimeframe (timeframe);
        const subscribeMessage = {
            'id': requestId,
            'method': 'kline.subscribe',
            'params': [ uppercaseId, interval ],
        };
        const subscription = {
            'id': requestId,
        };
        // gateio sends candles without a timeframe identifier
        // making it impossible to differentiate candles from
        // two or more different timeframes within the same symbol
        // thus the exchange API is limited to one timeframe per symbol
        const messageHash = 'kline.update' + ':' + marketId;
        const ohlcv = await this.watch (url, messageHash, subscribeMessage, messageHash, subscription);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        //
        //     {
        //         method: 'kline.update',
        //         params: [
        //             [
        //                 1580661060,
        //                 '9432.37',
        //                 '9435.77',
        //                 '9435.77',
        //                 '9429.93',
        //                 '0.0879',
        //                 '829.1875889352',
        //                 'BTC_USDT'
        //             ]
        //         ],
        //         id: null
        //     }
        //
        const params = this.safeValue (message, 'params', []);
        const ohlcv = this.safeValue (params, 0, []);
        const marketId = this.safeString (ohlcv, 7);
        const parsed = [
            this.safeTimestamp (ohlcv, 0), // t
            this.safeNumber (ohlcv, 1), // o
            this.safeNumber (ohlcv, 3), // h
            this.safeNumber (ohlcv, 4), // l
            this.safeNumber (ohlcv, 2), // c
            this.safeNumber (ohlcv, 5), // v
        ];
        const symbol = this.safeSymbol (marketId, undefined, '_');
        // gateio sends candles without a timeframe identifier
        // making it impossible to differentiate candles from
        // two or more different timeframes within the same symbol
        // thus the exchange API is limited to one timeframe per symbol
        // --------------------------------------------------------------------
        // this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        // const stored = this.safeValue (this.ohlcvs[symbol], timeframe, []);
        // --------------------------------------------------------------------
        let stored = this.safeValue (this.ohlcvs, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol] = stored;
        }
        stored.append (parsed);
        // --------------------------------------------------------------------
        // this.ohlcvs[symbol][timeframe] = stored;
        // --------------------------------------------------------------------
        const methodType = message['method'];
        const messageHash = methodType + ':' + marketId;
        client.resolve (stored, messageHash);
    }

    async authenticate (params = {}) {
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const future = client.future ('authenticated');
        const method = 'server.sign';
        const authenticate = this.safeValue (client.subscriptions, method);
        if (authenticate === undefined) {
            const requestId = this.milliseconds ();
            const requestIdString = requestId.toString ();
            const signature = this.hmac (this.encode (requestIdString), this.encode (this.secret), 'sha512', 'hex');
            const authenticateMessage = {
                'id': requestId,
                'method': method,
                'params': [ this.apiKey, signature, requestId ],
            };
            const subscribe = {
                'id': requestId,
                'method': this.handleAuthenticationMessage,
            };
            this.spawn (this.watch, url, requestId, authenticateMessage, method, subscribe);
        }
        return await future;
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        this.checkRequiredCredentials ();
        let type = 'spot';
        let marketId = undefined;
        let marketSymbol = undefined;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            type = market['type'];
            marketId = market['id'];
            marketSymbol = market['symbol'];
        }
        if (type !== 'spot') {
            throw new BadRequest (this.id + ' watchMyTrades symbol supports spot markets only');
        }
        const url = this.getUrlByMarketType (type);
        const channel = 'spot.usertrades';
        let messageHash = channel;
        let payload = [];
        if (marketId !== undefined) {
            payload = [marketId];
            messageHash += ':' + marketSymbol;
        }
        return await this.subscribePrivate (url, channel, messageHash, payload, undefined);
    }

    handleMyTrades (client, message) {
        //
        // {
        //     "time": 1605176741,
        //     "channel": "spot.usertrades",
        //     "event": "update",
        //     "result": [
        //       {
        //         "id": 5736713,
        //         "user_id": 1000001,
        //         "order_id": "30784428",
        //         "currency_pair": "BTC_USDT",
        //         "create_time": 1605176741,
        //         "create_time_ms": "1605176741123.456",
        //         "side": "sell",
        //         "amount": "1.00000000",
        //         "role": "taker",
        //         "price": "10000.00000000",
        //         "fee": "0.00200000000000",
        //         "point_fee": "0",
        //         "gt_fee": "0",
        //         "text": "apiv4"
        //       }
        //     ]
        //   }
        //
        const channel = this.safeString (message, 'channel');
        const trades = this.safeValue (message, 'result', []);
        if (trades.length > 0) {
            if (this.myTrades === undefined) {
                const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
                this.myTrades = new ArrayCache (limit);
            }
            const stored = this.myTrades;
            const parsedTrades = this.parseTrades (trades);
            for (let i = 0; i < parsedTrades.length; i++) {
                stored.append (parsedTrades[i]);
            }
            client.resolve (this.myTrades, channel);
            for (let i = 0; i < parsedTrades.length; i++) {
                const messageHash = channel + ':' + parsedTrades[i]['symbol'];
                client.resolve (this.myTrades, messageHash);
            }
        }
    }

    async watchBalance (params = {}) {
        await this.loadMarkets ();
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws'];
        await this.authenticate ();
        const requestId = this.nonce ();
        const method = 'balance.update';
        const subscribeMessage = {
            'id': requestId,
            'method': 'balance.subscribe',
            'params': [],
        };
        const subscription = {
            'id': requestId,
            'method': this.handleBalanceSubscription,
        };
        return await this.watch (url, method, subscribeMessage, method, subscription);
    }

    async fetchBalanceSnapshot () {
        await this.loadMarkets ();
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws'];
        await this.authenticate ();
        const requestId = this.nonce ();
        const method = 'balance.query';
        const subscribeMessage = {
            'id': requestId,
            'method': method,
            'params': [],
        };
        const subscription = {
            'id': requestId,
            'method': this.handleBalanceSnapshot,
        };
        return await this.watch (url, requestId, subscribeMessage, method, subscription);
    }

    handleBalanceSnapshot (client, message) {
        const messageHash = this.safeString (message, 'id');
        const result = this.safeValue (message, 'result');
        this.handleBalanceMessage (client, messageHash, result);
        client.resolve (this.balance, 'balance.update');
        if ('balance.query' in client.subscriptions) {
            delete client.subscriptions['balance.query'];
        }
    }

    handleBalance (client, message) {
        const messageHash = message['method'];
        const result = message['params'][0];
        this.handleBalanceMessage (client, messageHash, result);
    }

    handleBalanceMessage (client, messageHash, result) {
        const keys = Object.keys (result);
        for (let i = 0; i < keys.length; i++) {
            const account = this.account ();
            const key = keys[i];
            const code = this.safeCurrencyCode (key);
            const balance = result[key];
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'freeze');
            this.balance[code] = account;
        }
        this.balance = this.safeBalance (this.balance);
        client.resolve (this.balance, messageHash);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' watchOrders requires a symbol argument');
        }
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        let type = 'spot';
        if (market['future']) {
            type = 'futures';
        } else if (market['option']) {
            type = 'options';
        }
        const method = type + '.orders';
        let messageHash = method;
        messageHash = method + ':' + market['id'];
        const isBtcContract = ((type !== 'spot') && (market['settleId'] === 'btc')) ? true : false;
        const url = this.getUrlByMarketType (market['type'], isBtcContract);
        const payload = [market['id']];
        const orders = await this.subscribePrivate (url, method, messageHash, payload, undefined);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (orders, since, limit, 'timestamp', true);
    }

    handleOrder (client, message) {
        const method = this.safeString (message, 'method');
        const params = this.safeValue (message, 'params');
        const event = this.safeInteger (params, 0);
        const order = this.safeValue (params, 1);
        const marketId = this.safeString (order, 'market');
        const market = this.safeMarket (marketId, undefined, '_');
        const parsed = this.parseOrder (order, market);
        if (event === 1) {
            // put
            parsed['status'] = 'open';
        } else if (event === 2) {
            // update
            parsed['status'] = 'open';
        } else if (event === 3) {
            // finish
            const filled = this.safeFloat (parsed, 'filled');
            const amount = this.safeFloat (parsed, 'amount');
            if ((filled !== undefined) && (amount !== undefined)) {
                parsed['status'] = (filled >= amount) ? 'closed' : 'canceled';
            } else {
                parsed['status'] = 'closed';
            }
        }
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (parsed);
        const symbolSpecificMessageHash = method + ':' + marketId;
        client.resolve (orders, method);
        client.resolve (orders, symbolSpecificMessageHash);
    }

    handleAuthenticationMessage (client, message, subscription) {
        const result = this.safeValue (message, 'result');
        const status = this.safeString (result, 'status');
        if (status === 'success') {
            // client.resolve (true, 'authenticated') will delete the future
            // we want to remember that we are authenticated in subsequent call to private methods
            const future = this.safeValue (client.futures, 'authenticated');
            if (future !== undefined) {
                future.resolve (true);
            }
        } else {
            // delete authenticate subscribeHash to release the "subscribe lock"
            // allows subsequent calls to subscribe to reauthenticate
            // avoids sending two authentication messages before receiving a reply
            const error = new AuthenticationError (this.id + ' handleAuthenticationMessage() error');
            client.reject (error, 'authenticated');
            if ('server.sign' in client.subscriptions) {
                delete client.subscriptions['server.sign'];
            }
        }
    }

    handleErrorMessage (client, message) {
        // todo use error map here
        const error = this.safeValue (message, 'error', {});
        const code = this.safeInteger (error, 'code');
        if (code === 11 || code === 6) {
            const error = new AuthenticationError ('invalid credentials');
            client.reject (error, message['id']);
            client.reject (error, 'authenticated');
        }
    }

    handleBalanceSubscription (client, message, subscription) {
        this.spawn (this.fetchBalanceSnapshot);
    }

    handleSubscriptionStatus (client, message) {
        const messageId = this.safeInteger (message, 'id');
        if (messageId !== undefined) {
            const subscriptionsById = this.indexBy (client.subscriptions, 'id');
            const subscription = this.safeValue (subscriptionsById, messageId, {});
            const method = this.safeValue (subscription, 'method');
            if (method !== undefined) {
                method.call (this, client, message, subscription);
            }
            client.resolve (message, messageId);
        }
    }

    handleMessage (client, message) {
        this.handleErrorMessage (client, message);
        const methods = {
            'depth.update': this.handleOrderBook,
            'ticker.update': this.handleTicker,
            'trades.update': this.handleTrades,
            'kline.update': this.handleOHLCV,
            'balance.update': this.handleBalance,
            'order.update': this.handleOrder,
        };
        const methodType = this.safeString (message, 'method');
        const method = this.safeValue (methods, methodType);
        if (method === undefined) {
            const messageId = this.safeInteger (message, 'id');
            if (messageId !== undefined) {
                this.handleSubscriptionStatus (client, message);
                return;
            }
            const event = this.safeString (message, 'event');
            if (event === 'subscribe') {
                this.handleSubscriptionStatus (client, message);
                return;
            }
            const channel = this.safeString (message, 'channel');
            if (channel === 'spot.usertrades') {
                this.handleMyTrades (client, message);
            }
        } else {
            method.call (this, client, message);
        }
    }

    getUrlByMarketType (type, isBtcContract = false) {
        if (type === 'spot') {
            return this.urls['api']['spot'];
        }
        if (type === 'swap') {
            const baseUrl = this.urls['api']['swap'];
            return isBtcContract ? baseUrl['btc'] : baseUrl['usdt'];
        }
        if (type === 'future') {
            const baseUrl = this.urls['api']['future'];
            return isBtcContract ? baseUrl['btc'] : baseUrl['usdt'];
        }
        if (type === 'option') {
            return this.urls['api']['option'];
        }
    }

    async subscribePrivate (url, channel, messageHash, payload, subscription) {
        const time = this.seconds ();
        const event = 'subscribe';
        const signaturePayload = 'channel=' + channel + '&event=' + event + '&time=' + time.toString ();
        const signature = this.hmac (this.encode (signaturePayload), this.encode (this.secret), 'sha512', 'hex');
        const auth = {
            'method': 'api_key',
            'KEY': this.apiKey,
            'SIGN': signature,
        };
        const request = {
            'time': time,
            'channel': channel,
            'event': 'subscribe',
            'payload': payload,
            'auth': auth,
        };
        return await this.watch (url, messageHash, request, messageHash, subscription);
    }
};
