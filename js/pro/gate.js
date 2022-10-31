'use strict';

//  ---------------------------------------------------------------------------

const gateRest = require ('../gate.js');
const { AuthenticationError, BadRequest, ArgumentsRequired, NotSupported, InvalidNonce } = require ('../base/errors');
const { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class gate extends gateRest {
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
                'watchBalance': {
                    'settle': 'usdt', // or btc
                    'spot': 'spot.balances', // spot.margin_balances, spot.funding_balances or spot.cross_balances
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
        /**
         * @method
         * @name gate#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the gate api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
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
        const options = this.safeValue (this.options, 'handleOrderBookSubscription', {});
        const fetchOrderBookSnapshot = this.safeValue (options, 'fetchOrderBookSnapshot', false);
        if (fetchOrderBookSnapshot) {
            const fetchingOrderBookSnapshot = 'fetchingOrderBookSnapshot';
            subscription[fetchingOrderBookSnapshot] = true;
            const messageHash = subscription['messageHash'];
            client.subscriptions[messageHash] = subscription;
            this.spawn (this.fetchOrderBookSnapshot, client, message, subscription);
        }
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
                // retry to synchronize if we haven't reached maxAttempts yet
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
                    delete client.subscriptions[messageHash];
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
        //     {
        //         "time":1649770575,
        //         "channel":"spot.order_book_update",
        //         "event":"update",
        //         "result":{
        //             "t":1649770575537,
        //             "e":"depthUpdate",
        //             "E":1649770575,
        //             "s":"LTC_USDT",
        //             "U":2622528153,
        //             "u":2622528265,
        //             "b":[
        //                 ["104.18","3.9398"],
        //                 ["104.56","19.0603"],
        //                 ["104.94","0"],
        //                 ["103.72","0"],
        //                 ["105.01","52.6186"],
        //                 ["104.76","0"],
        //                 ["104.97","0"],
        //                 ["104.71","0"],
        //                 ["104.84","25.8604"],
        //                 ["104.51","47.6508"],
        //             ],
        //             "a":[
        //                 ["105.26","40.5519"],
        //                 ["106.08","35.4396"],
        //                 ["105.2","0"],
        //                 ["105.45","8.5834"],
        //                 ["105.5","20.17"],
        //                 ["105.11","54.8359"],
        //                 ["105.52","28.5605"],
        //                 ["105.27","6.6325"],
        //                 ["105.3","4.291446"],
        //                 ["106.03","9.712"],
        //             ]
        //         }
        //     }
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
        const messageHash = channel + ':' + symbol;
        const subscription = this.safeValue (client.subscriptions, messageHash, {});
        const fetchingOrderBookSnapshot = 'fetchingOrderBookSnapshot';
        const isFetchingOrderBookSnapshot = this.safeValue (subscription, fetchingOrderBookSnapshot, false);
        if (!isFetchingOrderBookSnapshot) {
            subscription[fetchingOrderBookSnapshot] = true;
            client.subscriptions[messageHash] = subscription;
            this.spawn (this.fetchOrderBookSnapshot, client, message, subscription);
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
        const seqNum = this.safeInteger (result, 'u');
        const nonce = orderbook['nonce'];
        // we can't use the prevSeqNum (U) here because it is not consistent
        // with the previous message sometimes so if the current seqNum
        // is 2 in the next message might be 3 or 4... so it is not safe to use
        if (seqNum >= nonce) {
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
        /**
         * @method
         * @name gate#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the gate api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
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
        /**
         * @method
         * @name gate#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the gate api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const marketId = market['id'];
        const type = market['type'];
        const messageType = this.getUniformType (type);
        const method = messageType + '.trades';
        let messageHash = method;
        if (symbol !== undefined) {
            messageHash += ':' + market['symbol'];
        }
        const url = this.getUrlByMarketType (type, market['inverse']);
        const payload = [ marketId ];
        const trades = await this.subscribePublic (url, method, messageHash, payload);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        // {
        //     time: 1648725035,
        //     channel: 'spot.trades',
        //     event: 'update',
        //     result: [{
        //       id: 3130257995,
        //       create_time: 1648725035,
        //       create_time_ms: '1648725035923.0',
        //       side: 'sell',
        //       currency_pair: 'LTC_USDT',
        //       amount: '0.0116',
        //       price: '130.11'
        //     }]
        // }
        //
        const channel = this.safeString (message, 'channel');
        let result = this.safeValue (message, 'result');
        if (!Array.isArray (result)) {
            result = [ result ];
        }
        const parsedTrades = this.parseTrades (result);
        const marketIds = {};
        for (let i = 0; i < parsedTrades.length; i++) {
            const trade = parsedTrades[i];
            const symbol = trade['symbol'];
            let cachedTrades = this.safeValue (this.trades, symbol);
            if (cachedTrades === undefined) {
                const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
                cachedTrades = new ArrayCache (limit);
                this.trades[symbol] = cachedTrades;
            }
            cachedTrades.append (trade);
            marketIds[symbol] = true;
        }
        const keys = Object.keys (marketIds);
        for (let i = 0; i < keys.length; i++) {
            const symbol = keys[i];
            const hash = channel + ':' + symbol;
            const stored = this.safeValue (this.trades, symbol);
            client.resolve (stored, hash);
        }
        client.resolve (this.trades, channel);
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const marketId = market['id'];
        const type = market['type'];
        const interval = this.timeframes[timeframe];
        const messageType = this.getUniformType (type);
        const method = messageType + '.candlesticks';
        const messageHash = method + ':' + interval + ':' + market['symbol'];
        const url = this.getUrlByMarketType (type, market['inverse']);
        const payload = [ interval, marketId ];
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
            result = [ result ];
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
        /**
         * @method
         * @name gate#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the gate api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure
         */
        await this.loadMarkets ();
        let subType = undefined;
        let type = undefined;
        let marketId = '!' + 'all';
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
            this.myTrades = cachedTrades;
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
        /**
         * @method
         * @name gate#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the gate api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchBalance', undefined, params);
        const options = this.safeValue (this.options, 'watchBalance', {});
        let subType = this.safeValue (options, 'subType', 'linear');
        subType = this.safeValue (params, 'subType', subType);
        params = this.omit (params, 'subType');
        const isInverse = (subType === 'inverse');
        const url = this.getUrlByMarketType (type, isInverse);
        const requiresUid = (type !== 'spot');
        let channelType = 'spot';
        if (type === 'future' || type === 'swap') {
            channelType = 'futures';
        } else if (type === 'option') {
            channelType = 'options';
        }
        let channel = undefined;
        if (type === 'spot') {
            const options = this.safeValue (this.options, 'watchTicker', {});
            channel = this.safeString (options, 'spot', 'spot.balances');
        } else {
            channel = channelType + '.balances';
        }
        return await this.subscribePrivate (url, channel, channel, undefined, requiresUid);
    }

    handleBalance (client, message) {
        const messageHash = message['method'];
        const result = message['params'][0];
        this.handleBalanceMessage (client, messageHash, result);
    }

    handleBalanceMessage (client, message) {
        //
        // spot order fill
        //   {
        //       time: 1653664351,
        //       channel: 'spot.balances',
        //       event: 'update',
        //       result: [
        //         {
        //           timestamp: '1653664351',
        //           timestamp_ms: '1653664351017',
        //           user: '10406147',
        //           currency: 'LTC',
        //           change: '-0.0002000000000000',
        //           total: '0.09986000000000000000',
        //           available: '0.09986000000000000000'
        //         }
        //       ]
        //   }
        //
        // account transfer
        //
        //    {
        //        id: null,
        //        time: 1653665088,
        //        channel: 'futures.balances',
        //        event: 'update',
        //        error: null,
        //        result: [
        //          {
        //            balance: 25.035008537,
        //            change: 25,
        //            text: '-',
        //            time: 1653665088,
        //            time_ms: 1653665088286,
        //            type: 'dnw',
        //            user: '10406147'
        //          }
        //        ]
        //   }
        //
        // swap order fill
        //   {
        //       id: null,
        //       time: 1653665311,
        //       channel: 'futures.balances',
        //       event: 'update',
        //       error: null,
        //       result: [
        //         {
        //           balance: 20.031873037,
        //           change: -0.0031355,
        //           text: 'LTC_USDT:165551103273',
        //           time: 1653665311,
        //           time_ms: 1653665311437,
        //           type: 'fee',
        //           user: '10406147'
        //         }
        //       ]
        //   }
        //
        const channel = this.safeString (message, 'channel');
        const result = this.safeValue (message, 'result', []);
        for (let i = 0; i < result.length; i++) {
            const rawBalance = result[i];
            const account = this.account ();
            const currencyId = this.safeString (rawBalance, 'currency', 'USDT'); // when not present it is USDT
            const code = this.safeCurrencyCode (currencyId);
            account['free'] = this.safeString (rawBalance, 'available');
            account['total'] = this.safeString2 (rawBalance, 'total', 'balance');
            this.balance[code] = account;
        }
        this.balance = this.safeBalance (this.balance);
        client.resolve (this.balance, channel);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name gate#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the gate api endpoint
         * @param {string} params.type spot, margin, swap, future, or option. Required if listening to all symbols.
         * @param {boolean} params.isInverse if future, listen to inverse or linear contracts
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
        }
        let type = undefined;
        let query = undefined;
        [ type, query ] = this.handleMarketTypeAndParams ('watchOrders', market, params);
        const typeId = this.getSupportedMapping (type, {
            'spot': 'spot',
            'margin': 'spot',
            'future': 'futures',
            'swap': 'futures',
            'option': 'options',
        });
        const method = typeId + '.orders';
        let messageHash = method;
        let payload = [ '!' + 'all' ];
        if (symbol !== undefined) {
            messageHash = method + ':' + market['id'];
            payload = [ market['id'] ];
        }
        let subType = undefined;
        [ subType, query ] = this.handleSubTypeAndParams ('watchOrders', market, query);
        const isInverse = (subType === 'inverse');
        const url = this.getUrlByMarketType (type, isInverse);
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
            client.resolve (this.orders, channel);
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

    handleBalanceSubscription (client, message) {
        this.spawn (this.fetchBalanceSnapshot, client, message);
    }

    async fetchBalanceSnapshot (client, message) {
        //
        //  {
        //     id: 1,
        //     time: 1653665810,
        //     channel: 'futures.balances',
        //     event: 'subscribe',
        //     auth: {
        //     },
        //     payload: [ '10406147' ]
        //   }
        //
        await this.loadMarkets ();
        const channel = this.safeString (message, 'channel', '');
        const parts = channel.split ('.');
        const exchangeType = this.safeString (parts, 0);
        let type = exchangeType;
        if (exchangeType === 'futures') {
            type = 'future';
        } else if (type === 'options') {
            type = 'option';
        }
        const params = {
            'type': type,
        };
        if (type === 'future' || type === 'swap') {
            const options = this.safeValue (this.options, 'watchTicker', {});
            const settle = this.safeString (options, 'settle', 'usdt');
            params['settle'] = settle;
        }
        const snapshot = await this.fetchBalance (params);
        this.balance = snapshot;
        client.resolve (this.balance, channel);
    }

    handleSubscriptionStatus (client, message) {
        const channel = this.safeString (message, 'channel', '');
        if (channel.indexOf ('balance') >= 0) {
            this.handleBalanceSubscription (client, message);
        }
    }

    handleMessage (client, message) {
        //
        // subscribe
        //    {
        //        time: 1649062304,
        //        id: 1649062303,
        //        channel: 'spot.candlesticks',
        //        event: 'subscribe',
        //        result: { status: 'success' }
        //    }
        //
        // candlestick
        //    {
        //        time: 1649063328,
        //        channel: 'spot.candlesticks',
        //        event: 'update',
        //        result: {
        //          t: '1649063280',
        //          v: '58932.23174896',
        //          c: '45966.47',
        //          h: '45997.24',
        //          l: '45966.47',
        //          o: '45975.18',
        //          n: '1m_BTC_USDT',
        //          a: '1.281699'
        //        }
        //     }
        //
        //  orders
        //   {
        //       "time": 1630654851,
        //       "channel": "options.orders", or futures.orders or spot.orders
        //       "event": "update",
        //       "result": [
        //          {
        //             "contract": "BTC_USDT-20211130-65000-C",
        //             "create_time": 1637897000,
        //               (...)
        //       ]
        //   }
        // orderbook
        //   {
        //       time: 1649770525,
        //       channel: 'spot.order_book_update',
        //       event: 'update',
        //       result: {
        //         t: 1649770525653,
        //         e: 'depthUpdate',
        //         E: 1649770525,
        //         s: 'LTC_USDT',
        //         U: 2622525645,
        //         u: 2622525665,
        //         b: [
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array]
        //         ],
        //         a: [
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array]
        //         ]
        //       }
        //     }
        //
        // balance update
        //
        //    {
        //        time: 1653664351,
        //        channel: 'spot.balances',
        //        event: 'update',
        //        result: [
        //          {
        //            timestamp: '1653664351',
        //            timestamp_ms: '1653664351017',
        //            user: '10406147',
        //            currency: 'LTC',
        //            change: '-0.0002000000000000',
        //            total: '0.09986000000000000000',
        //            available: '0.09986000000000000000'
        //          }
        //        ]
        //    }
        //
        this.handleErrorMessage (client, message);
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
            'trades': this.handleTrades,
            'order_book_update': this.handleOrderBook,
            'balances': this.handleBalanceMessage,
        };
        const method = this.safeValue (v4Methods, channelType);
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

    async subscribePrivate (url, channel, messageHash, payload = undefined, requiresUid = false) {
        this.checkRequiredCredentials ();
        // uid is required for some subscriptions only so it's not a part of required credentials
        if (requiresUid) {
            if (this.uid === undefined || this.uid.length === 0) {
                throw new ArgumentsRequired (this.id + ' requires uid to subscribe');
            }
            const idArray = [ this.uid ];
            if (payload === undefined) {
                payload = idArray;
            } else {
                payload = this.arrayConcat (idArray, payload);
            }
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
            'auth': auth,
        };
        if (payload !== undefined) {
            request['payload'] = payload;
        }
        const subscription = {
            'id': requestId,
            'messageHash': messageHash,
        };
        return await this.watch (url, messageHash, request, messageHash, subscription);
    }
};
