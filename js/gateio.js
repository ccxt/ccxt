'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { AuthenticationError, BadRequest, ArgumentsRequired, NotSupported, InvalidNonce } = require ('ccxt/js/base/errors');
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
                'test': {
                    'swap': {
                        'usdt': 'wss://fx-ws-testnet.gateio.ws/v4/ws/usdt',
                        'btc': 'wss://fx-ws-testnet.gateio.ws/v4/ws/btc',
                    },
                    'future': {
                        'usdt': 'wss://fx-ws-testnet.gateio.ws/v4/ws/usdt',
                        'btc': 'wss://fx-ws-testnet.gateio.ws/v4/ws/btc',
                    },
                    'option': 'wss://op-ws-testnet.gateio.live/v4/ws',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
                'watchTradesSubscriptions': {},
                'watchTickerSubscriptions': {},
                'watchOrderBookSubscriptions': {},
                'watchOrderBook': {
                    'interval': '100ms',
                },
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        '2': BadRequest,
                        '4': AuthenticationError,
                        '6': AuthenticationError,
                        '11': AuthenticationError,
                    },
                },
            },
        });
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const marketId = market['id'];
        const options = this.safeValue (this.options, 'watchOrderBook', {});
        const defaultLimit = this.safeInteger (options, 'limit', 20);
        if (!limit) {
            limit = defaultLimit;
        }
        const defaultInterval = this.safeString (options, 'interval', '100ms');
        const interval = this.safeString (params, 'interval', defaultInterval);
        const type = market['type'];
        const messageType = this.getUniformType (type);
        const method = messageType + '.' + 'order_book_update';
        const messageHash = method + ':' + market['symbol'];
        const url = this.getUrlByMarketType (type, market['inverse']);
        const payload = [ marketId, interval ];
        if (type !== 'spot') {
            // contract pairs require limit in the payload
            const stringLimit = limit.toString ();
            payload.push (stringLimit);
        }
        const subscriptionParams = {
            'method': this.handleOrderBookSubscription,
            'symbol': symbol,
            'limit': limit,
        };
        const orderbook = await this.subscribePublic (url, method, messageHash, payload, subscriptionParams);
        return orderbook.limit (limit);
    }

    handleOrderBookSubscription (client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit');
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        this.orderbooks[symbol] = this.orderBook ({}, limit);
        this.spawn (this.fetchOrderBookSnapshot, client, message, subscription);
    }

    async fetchOrderBookSnapshot (client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit');
        const messageHash = this.safeString (subscription, 'messageHash');
        try {
            const snapshot = await this.fetchOrderBook (symbol, limit);
            const orderbook = this.orderbooks[symbol];
            const messages = orderbook.cache;
            const firstMessage = this.safeValue (messages, 0, {});
            const result = this.safeValue (firstMessage, 'result');
            const seqNum = this.safeInteger (result, 'U');
            const nonce = this.safeInteger (snapshot, 'nonce');
            // if the received snapshot is earlier than the first cached delta
            // then we cannot align it with the cached deltas and we need to
            // retry synchronizing in maxAttempts
            if ((seqNum === undefined) || (nonce < seqNum)) {
                const maxAttempts = this.safeInteger (this.options, 'maxOrderBookSyncAttempts', 3);
                let numAttempts = this.safeInteger (subscription, 'numAttempts', 0);
                // retry to syncrhonize if we haven't reached maxAttempts yet
                if (numAttempts < maxAttempts) {
                    // safety guard
                    if (messageHash in client.subscriptions) {
                        numAttempts = this.sum (numAttempts, 1);
                        subscription['numAttempts'] = numAttempts;
                        client.subscriptions[messageHash] = subscription;
                        this.spawn (this.fetchOrderBookSnapshot, client, message, subscription);
                    }
                } else {
                    // throw upon failing to synchronize in maxAttempts
                    throw new InvalidNonce (this.id + ' failed to synchronize WebSocket feed with the snapshot for symbol ' + symbol + ' in ' + maxAttempts.toString () + ' attempts');
                }
            } else {
                orderbook.reset (snapshot);
                // unroll the accumulated deltas
                for (let i = 0; i < messages.length; i++) {
                    const message = messages[i];
                    this.handleOrderBookMessage (client, message, orderbook);
                }
                this.orderbooks[symbol] = orderbook;
                client.resolve (orderbook, messageHash);
            }
        } catch (e) {
            client.reject (e, messageHash);
        }
    }

    handleOrderBook (client, message) {
        //
        //  {
        //      "time":1649770575,
        //      "channel":"spot.order_book_update",
        //      "event":"update",
        //      "result":{
        //         "t":1649770575537,
        //         "e":"depthUpdate",
        //         "E":1649770575,
        //         "s":"LTC_USDT",
        //         "U":2622528153,
        //         "u":2622528265,
        //         "b":[
        //            ["104.18","3.9398"],
        //            ["104.56","19.0603"],
        //            ["104.94","0"],
        //            ["103.72","0"],
        //            ["105.01","52.6186"],
        //            ["104.76","0"],
        //            ["104.97","0"],
        //            ["104.71","0"],
        //            ["104.84","25.8604"],
        //            ["104.51","47.6508"],
        //         ],
        //         "a":[
        //            ["105.26","40.5519"],
        //            ["106.08","35.4396"],
        //            ["105.2","0"],
        //            ["105.45","8.5834"],
        //            ["105.5","20.17"],
        //            ["105.11","54.8359"],
        //            ["105.52","28.5605"],
        //            ["105.27","6.6325"],
        //            ["105.3","4.291446"],
        //            ["106.03","9.712"],
        //         ]
        //      }
        //   }
        //
        const channel = this.safeString (message, 'channel');
        const result = this.safeValue (message, 'result');
        const marketId = this.safeString (result, 's');
        const symbol = this.safeSymbol (marketId);
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ({});
            this.orderbooks[symbol] = orderbook;
        }
        if (orderbook['nonce'] === undefined) {
            orderbook.cache.push (message);
        } else {
            const messageHash = channel + ':' + symbol;
            this.handleOrderBookMessage (client, message, orderbook, messageHash);
        }
    }

    handleOrderBookMessage (client, message, orderbook, messageHash = undefined) {
        //
        // spot
        //
        //     {
        //         time: 1650189272,
        //         channel: 'spot.order_book_update',
        //         event: 'update',
        //         result: {
        //             t: 1650189272515,
        //             e: 'depthUpdate',
        //             E: 1650189272,
        //             s: 'GMT_USDT',
        //             U: 140595902,
        //             u: 140595902,
        //             b: [
        //                 [ '2.51518', '228.119' ],
        //                 [ '2.50587', '1510.11' ],
        //                 [ '2.49944', '67.6' ],
        //             ],
        //             a: [
        //                 [ '2.5182', '4.199' ],
        //                 [ '2.51926', '1874' ],
        //                 [ '2.53528', '96.529' ],
        //             ]
        //         }
        //     }
        //
        // swap
        //
        //     {
        //         id: null,
        //         time: 1650188898,
        //         channel: 'futures.order_book_update',
        //         event: 'update',
        //         error: null,
        //         result: {
        //             t: 1650188898938,
        //             s: 'GMT_USDT',
        //             U: 1577718307,
        //             u: 1577719254,
        //             b: [
        //                 { p: '2.5178', s: 0 },
        //                 { p: '2.5179', s: 0 },
        //                 { p: '2.518', s: 0 },
        //             ],
        //             a: [
        //                 { p: '2.52', s: 0 },
        //                 { p: '2.5201', s: 0 },
        //                 { p: '2.5203', s: 0 },
        //             ]
        //         }
        //     }
        //
        const result = this.safeValue (message, 'result');
        const prevSeqNum = this.safeInteger (result, 'U');
        const seqNum = this.safeInteger (result, 'u');
        const nonce = orderbook['nonce'];
        // we have to add +1 because if the current seqNumber on iteration X is 5
        // on the iteration X+1, prevSeqNum will be (5+1)
        const nextNonce = this.sum (nonce, 1);
        if ((prevSeqNum <= nextNonce) && (seqNum >= nextNonce)) {
            const asks = this.safeValue (result, 'a', []);
            const bids = this.safeValue (result, 'b', []);
            this.handleDeltas (orderbook['asks'], asks);
            this.handleDeltas (orderbook['bids'], bids);
            orderbook['nonce'] = seqNum;
            const timestamp = this.safeInteger (result, 't');
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
            if (messageHash !== undefined) {
                client.resolve (orderbook, messageHash);
            }
        }
        return orderbook;
    }

    handleDelta (bookside, delta) {
        let price = undefined;
        let amount = undefined;
        if (Array.isArray (delta)) {
            // spot
            price = this.safeFloat (delta, 0);
            amount = this.safeFloat (delta, 1);
        } else {
            // swap
            price = this.safeFloat (delta, 'p');
            amount = this.safeFloat (delta, 's');
        }
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    async watchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const type = market['type'];
        const messageType = this.getUniformType (type);
        const channel = messageType + '.' + 'tickers';
        const messageHash = channel + '.' + market['symbol'];
        const payload = [ marketId ];
        const url = this.getUrlByMarketType (type, market['inverse']);
        return await this.subscribePublic (url, channel, messageHash, payload);
    }

    handleTicker (client, message) {
        //
        //    {
        //        time: 1649326221,
        //        channel: 'spot.tickers',
        //        event: 'update',
        //        result: {
        //          currency_pair: 'BTC_USDT',
        //          last: '43444.82',
        //          lowest_ask: '43444.82',
        //          highest_bid: '43444.81',
        //          change_percentage: '-4.0036',
        //          base_volume: '5182.5412425462',
        //          quote_volume: '227267634.93123952',
        //          high_24h: '47698',
        //          low_24h: '42721.03'
        //        }
        //    }
        //
        const channel = this.safeString (message, 'channel');
        let result = this.safeValue (message, 'result');
        if (!Array.isArray (result)) {
            result = [ result ];
        }
        for (let i = 0; i < result.length; i++) {
            const ticker = result[i];
            const parsed = this.parseTicker (ticker);
            const symbol = parsed['symbol'];
            this.tickers[symbol] = parsed;
            const messageHash = channel + '.' + symbol;
            client.resolve (this.tickers[symbol], messageHash);
        }
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
        const type = market['type'];
        const interval = this.timeframes[timeframe];
        const messageType = this.getUniformType (type);
        const method = messageType + '.candlesticks';
        const messageHash = method + ':' + interval + ':' + market['symbol'];
        const url = this.getUrlByMarketType (type, market['inverse']);
        const payload = [interval, marketId];
        const ohlcv = await this.subscribePublic (url, method, messageHash, payload);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        //
        // {
        //     "time": 1606292600,
        //     "channel": "spot.candlesticks",
        //     "event": "update",
        //     "result": {
        //       "t": "1606292580", // total volume
        //       "v": "2362.32035", // volume
        //       "c": "19128.1", // close
        //       "h": "19128.1", // high
        //       "l": "19128.1", // low
        //       "o": "19128.1", // open
        //       "n": "1m_BTC_USDT" // sub
        //     }
        //   }
        //
        const channel = this.safeString (message, 'channel');
        let result = this.safeValue (message, 'result');
        const isArray = Array.isArray (result);
        if (!isArray) {
            result = [result];
        }
        const marketIds = {};
        for (let i = 0; i < result.length; i++) {
            const ohlcv = result[i];
            const subscription = this.safeString (ohlcv, 'n', '');
            const parts = subscription.split ('_');
            const timeframe = this.safeString (parts, 0);
            const prefix = timeframe + '_';
            const marketId = subscription.replace (prefix, '');
            const symbol = this.safeSymbol (marketId, undefined, '_');
            const parsed = this.parseOHLCV (ohlcv);
            let stored = this.safeValue (this.ohlcvs, symbol);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                stored = new ArrayCacheByTimestamp (limit);
                this.ohlcvs[symbol] = stored;
            }
            stored.append (parsed);
            marketIds[symbol] = timeframe;
        }
        const keys = Object.keys (marketIds);
        for (let i = 0; i < keys.length; i++) {
            const symbol = keys[i];
            const timeframe = marketIds[symbol];
            const interval = this.timeframes[timeframe];
            const hash = channel + ':' + interval + ':' + symbol;
            const stored = this.safeValue (this.ohlcvs, symbol);
            client.resolve (stored, hash);
        }
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
        let subType = undefined;
        let type = undefined;
        let marketId = '!all';
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            type = market['type'];
            marketId = market['id'];
        } else {
            [ type, params ] = this.handleMarketTypeAndParams ('watchMyTrades', undefined, params);
            if (type !== 'spot') {
                const options = this.safeValue (this.options, 'watchMyTrades', {});
                subType = this.safeValue (options, 'subType', 'linear');
                subType = this.safeValue (params, 'subType', subType);
                params = this.omit (params, 'subType');
            }
        }
        const messageType = this.getUniformType (type);
        const method = messageType + '.usertrades';
        let messageHash = method;
        if (symbol !== undefined) {
            messageHash += ':' + symbol;
        }
        const isInverse = (subType === 'inverse');
        const url = this.getUrlByMarketType (type, isInverse);
        const payload = [ marketId ];
        // uid required for non spot markets
        const requiresUid = (type !== 'spot');
        const trades = await this.subscribePrivate (url, method, messageHash, payload, requiresUid);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleMyTrades (client, message) {
        //
        // {
        //     "time": 1543205083,
        //     "channel": "futures.usertrades",
        //     "event": "update",
        //     "error": null,
        //     "result": [
        //       {
        //         "id": "3335259",
        //         "create_time": 1628736848,
        //         "create_time_ms": 1628736848321,
        //         "contract": "BTC_USD",
        //         "order_id": "4872460",
        //         "size": 1,
        //         "price": "40000.4",
        //         "role": "maker"
        //       }
        //     ]
        // }
        //
        const result = this.safeValue (message, 'result', []);
        const channel = this.safeString (message, 'channel');
        const tradesLength = result.length;
        if (tradesLength === 0) {
            return;
        }
        let cachedTrades = this.myTrades;
        if (cachedTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            cachedTrades = new ArrayCacheBySymbolById (limit);
        }
        const parsed = this.parseTrades (result);
        const marketIds = {};
        for (let i = 0; i < parsed.length; i++) {
            const trade = parsed[i];
            cachedTrades.append (trade);
            const symbol = trade['symbol'];
            marketIds[symbol] = true;
        }
        const keys = Object.keys (marketIds);
        for (let i = 0; i < keys.length; i++) {
            const market = keys[i];
            const hash = channel + ':' + market;
            client.resolve (cachedTrades, hash);
        }
        client.resolve (cachedTrades, channel);
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
        await this.loadMarkets ();
        const market = this.market (symbol);
        let type = 'spot';
        if (market['future'] || market['swap']) {
            type = 'futures';
        } else if (market['option']) {
            type = 'options';
        }
        const method = type + '.orders';
        let messageHash = method;
        messageHash = method + ':' + market['id'];
        const url = this.getUrlByMarketType (market['type'], market['inverse']);
        const payload = [market['id']];
        // uid required for non spot markets
        const requiresUid = (type !== 'spot');
        const orders = await this.subscribePrivate (url, method, messageHash, payload, requiresUid);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (orders, since, limit, 'timestamp', true);
    }

    handleOrder (client, message) {
        //
        // {
        //     "time": 1605175506,
        //     "channel": "spot.orders",
        //     "event": "update",
        //     "result": [
        //       {
        //         "id": "30784435",
        //         "user": 123456,
        //         "text": "t-abc",
        //         "create_time": "1605175506",
        //         "create_time_ms": "1605175506123",
        //         "update_time": "1605175506",
        //         "update_time_ms": "1605175506123",
        //         "event": "put",
        //         "currency_pair": "BTC_USDT",
        //         "type": "limit",
        //         "account": "spot",
        //         "side": "sell",
        //         "amount": "1",
        //         "price": "10001",
        //         "time_in_force": "gtc",
        //         "left": "1",
        //         "filled_total": "0",
        //         "fee": "0",
        //         "fee_currency": "USDT",
        //         "point_fee": "0",
        //         "gt_fee": "0",
        //         "gt_discount": true,
        //         "rebated_fee": "0",
        //         "rebated_fee_currency": "USDT"
        //       }
        //     ]
        // }
        //
        const orders = this.safeValue (message, 'result', []);
        const channel = this.safeString (message, 'channel');
        const ordersLength = orders.length;
        if (ordersLength > 0) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            if (this.orders === undefined) {
                this.orders = new ArrayCacheBySymbolById (limit);
            }
            const stored = this.orders;
            const marketIds = {};
            const parsedOrders = this.parseOrders (orders);
            for (let i = 0; i < parsedOrders.length; i++) {
                const parsed = parsedOrders[i];
                // inject order status
                const info = this.safeValue (parsed, 'info');
                const event = this.safeString (info, 'event');
                if (event === 'put') {
                    parsed['status'] = 'open';
                } else if (event === 'finish') {
                    parsed['status'] = 'closed';
                }
                stored.append (parsed);
                const symbol = parsed['symbol'];
                const market = this.market (symbol);
                marketIds[market['id']] = true;
            }
            const keys = Object.keys (marketIds);
            for (let i = 0; i < keys.length; i++) {
                const messageHash = channel + ':' + keys[i];
                client.resolve (this.orders, messageHash);
            }
        }
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
        // {
        //     time: 1647274664,
        //     channel: 'futures.orders',
        //     event: 'subscribe',
        //     error: { code: 2, message: 'unknown contract BTC_USDT_20220318' },
        // }
        // {
        //     time: 1647276473,
        //     channel: 'futures.orders',
        //     event: 'subscribe',
        //     error: {
        //       code: 4,
        //       message: '{"label":"INVALID_KEY","message":"Invalid key provided"}\n'
        //     },
        //     result: null
        //   }
        const error = this.safeValue (message, 'error', {});
        const code = this.safeInteger (error, 'code');
        if (code !== undefined) {
            const id = this.safeString (message, 'id');
            const subscriptionsById = this.indexBy (client.subscriptions, 'id');
            const subscription = this.safeValue (subscriptionsById, id);
            if (subscription !== undefined) {
                try {
                    this.throwExactlyMatchedException (this.exceptions['ws']['exact'], code, this.json (message));
                } catch (e) {
                    const messageHash = this.safeString (subscription, 'messageHash');
                    client.reject (e, messageHash);
                    client.reject (e, id);
                    if (id in client.subscriptions) {
                        delete client.subscriptions[id];
                    }
                }
            }
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
        //
        // subscribe
        // {
        //     time: 1649062304,
        //     id: 1649062303,
        //     channel: 'spot.candlesticks',
        //     event: 'subscribe',
        //     result: { status: 'success' }
        // }
        // candlestick
        // {
        //     time: 1649063328,
        //     channel: 'spot.candlesticks',
        //     event: 'update',
        //     result: {
        //       t: '1649063280',
        //       v: '58932.23174896',
        //       c: '45966.47',
        //       h: '45997.24',
        //       l: '45966.47',
        //       o: '45975.18',
        //       n: '1m_BTC_USDT',
        //       a: '1.281699'
        //     }
        //  }
        // orders
        // {
        //     "time": 1630654851,
        //     "channel": "options.orders", or futures.orders or spot.orders
        //     "event": "update",
        //     "result": [
        //        {
        //           "contract": "BTC_USDT-20211130-65000-C",
        //           "create_time": 1637897000,
        //             (...)
        //     ]
        // }
        // orderbook
        // {
        //     time: 1649770525,
        //     channel: 'spot.order_book_update',
        //     event: 'update',
        //     result: {
        //       t: 1649770525653,
        //       e: 'depthUpdate',
        //       E: 1649770525,
        //       s: 'LTC_USDT',
        //       U: 2622525645,
        //       u: 2622525665,
        //       b: [
        //         [Array], [Array],
        //         [Array], [Array],
        //         [Array], [Array],
        //         [Array], [Array],
        //         [Array], [Array],
        //         [Array]
        //       ],
        //       a: [
        //         [Array], [Array],
        //         [Array], [Array],
        //         [Array], [Array],
        //         [Array], [Array],
        //         [Array], [Array],
        //         [Array]
        //       ]
        //     }
        //   }
        this.handleErrorMessage (client, message);
        const methods = {
            // missing migration to v4
            'balance.update': this.handleBalance,
        };
        const methodType = this.safeString (message, 'method');
        let method = this.safeValue (methods, methodType);
        if (method === undefined) {
            const event = this.safeString (message, 'event');
            if (event === 'subscribe') {
                this.handleSubscriptionStatus (client, message);
                return;
            }
            const channel = this.safeString (message, 'channel', '');
            const channelParts = channel.split ('.');
            const channelType = this.safeValue (channelParts, 1);
            const v4Methods = {
                'usertrades': this.handleMyTrades,
                'candlesticks': this.handleOHLCV,
                'orders': this.handleOrder,
                'tickers': this.handleTicker,
                'order_book_update': this.handleOrderBook,
            };
            method = this.safeValue (v4Methods, channelType);
        }
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }

    getUniformType (type) {
        let uniformType = 'spot';
        if (type === 'future' || type === 'swap') {
            uniformType = 'futures';
        } else if (type === 'option') {
            uniformType = 'options';
        }
        return uniformType;
    }

    getUrlByMarketType (type, isInverse = false) {
        if (type === 'spot') {
            const spotUrl = this.urls['api']['spot'];
            if (spotUrl === undefined) {
                throw new NotSupported (this.id + ' does not have a testnet for the ' + type + ' market type.');
            }
            return spotUrl;
        }
        if (type === 'swap') {
            const baseUrl = this.urls['api']['swap'];
            return isInverse ? baseUrl['btc'] : baseUrl['usdt'];
        }
        if (type === 'future') {
            const baseUrl = this.urls['api']['future'];
            return isInverse ? baseUrl['btc'] : baseUrl['usdt'];
        }
        if (type === 'option') {
            return this.urls['api']['option'];
        }
    }

    requestId () {
        // their support said that reqid must be an int32, not documented
        const reqid = this.sum (this.safeInteger (this.options, 'reqid', 0), 1);
        this.options['reqid'] = reqid;
        return reqid;
    }

    async subscribePublic (url, channel, messageHash, payload, subscriptionParams = {}) {
        const requestId = this.requestId ();
        const time = this.seconds ();
        const request = {
            'id': requestId,
            'time': time,
            'channel': channel,
            'event': 'subscribe',
            'payload': payload,
        };
        let subscription = {
            'id': requestId,
            'messageHash': messageHash,
        };
        subscription = this.extend (subscription, subscriptionParams);
        return await this.watch (url, messageHash, request, messageHash, subscription);
    }

    async subscribePrivate (url, channel, messageHash, payload, requiresUid = false) {
        this.checkRequiredCredentials ();
        // uid is required for some subscriptions only so it's not a part of required credentials
        if (requiresUid) {
            if (this.uid === undefined || this.uid.length === 0) {
                throw new ArgumentsRequired (this.id + ' requires uid to subscribe');
            }
            const idArray = [this.uid];
            payload = this.arrayConcat (idArray, payload);
        }
        const time = this.seconds ();
        const event = 'subscribe';
        const signaturePayload = 'channel=' + channel + '&' + 'event=' + event + '&' + 'time=' + time.toString ();
        const signature = this.hmac (this.encode (signaturePayload), this.encode (this.secret), 'sha512', 'hex');
        const auth = {
            'method': 'api_key',
            'KEY': this.apiKey,
            'SIGN': signature,
        };
        const requestId = this.requestId ();
        const request = {
            'id': requestId,
            'time': time,
            'channel': channel,
            'event': 'subscribe',
            'payload': payload,
            'auth': auth,
        };
        const subscription = {
            'id': requestId,
            'messageHash': messageHash,
        };
        return await this.watch (url, messageHash, request, messageHash, subscription);
    }
};
