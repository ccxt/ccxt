'use strict';

//  ---------------------------------------------------------------------------

const aaxRest = require ('../aax.js');
const { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById, NotSupported, AuthenticationError } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class aax extends aaxRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchTicker': true,
                'watchTrades': true,
                'watchBalance': true,
                'watchOrders': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://realtime.aax.com/marketdata/v2/',
                        'private': 'wss://stream.aax.com/notification/v2/',
                    },
                },
            },
            'options': {
                'OHLCVLimit': 1000,
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'myTradesLimit': 1000,
            },
        });
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const name = 'candles';
        const market = this.market (symbol);
        const interval = this.timeframes[timeframe];
        const messageHash = market['id'] + '@' + interval + '_' + name;
        const url = this.urls['api']['ws']['public'];
        const subscribe = {
            'e': 'subscribe',
            'stream': messageHash,
        };
        const request = this.deepExtend (subscribe, params);
        const ohlcv = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        //
        //     {
        //         c: '53876.69000000',
        //         e: 'BTCUSDT@1m_candles',
        //         h: '53876.69000000',
        //         l: '53832.47000000',
        //         o: '53832.47000000',
        //         s: 1619707320, // start
        //         t: 1619707346, // end
        //         v: '301.70946400'
        //     }
        //
        const messageHash = this.safeString (message, 'e');
        const parts = messageHash.split ('@');
        const marketId = this.safeString (parts, 0);
        const timeframeName = this.safeString (parts, 1);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const parsed = [
            this.safeTimestamp (message, 's'),
            this.safeNumber (message, 'o'),
            this.safeNumber (message, 'h'),
            this.safeNumber (message, 'l'),
            this.safeNumber (message, 'c'),
            this.safeNumber (message, 'v'),
        ];
        const subParts = timeframeName.split ('_');
        const interval = this.safeString (subParts, 0);
        const timeframe = this.findTimeframe (interval);
        // TODO: move to base class
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

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name aax#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the aax api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        const name = 'tickers';
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = market['id'] + '@' + name;
        const url = this.urls['api']['ws']['public'];
        const subscribe = {
            'e': 'subscribe',
            'stream': name,
        };
        const request = this.extend (subscribe, params);
        return await this.watch (url, messageHash, request, name);
    }

    handleTickers (client, message) {
        //
        //     {
        //         e: 'tickers',
        //         t: 1619663715213,
        //         tickers: [
        //             {
        //                 a: '0.00000000',
        //                 c: '47655.65000000',
        //                 d: '-3.48578544',
        //                 h: '50451.37000000',
        //                 l: '47002.45000000',
        //                 o: '49376.82000000',
        //                 s: 'YFIUSDT',
        //                 v: '18140.31675687'
        //             },
        //             {
        //                 a: '0.00000000',
        //                 c: '1.39127000',
        //                 d: '-3.09668252',
        //                 h: '1.43603000',
        //                 l: '1.28451000',
        //                 o: '1.43573000',
        //                 s: 'XRPUSDT',
        //                 v: '451952.36683000'
        //             },
        //         ]
        //     }
        //
        const name = this.safeString (message, 'e');
        const timestamp = this.safeInteger (message, 't');
        const extension = {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const tickers = this.parseTickers (this.safeValue (message, 'tickers', []), undefined, extension);
        const symbols = Object.keys (tickers);
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            if (symbol in this.markets) {
                const market = this.market (symbol);
                const ticker = tickers[symbol];
                this.tickers[symbol] = ticker;
                const messageHash = market['id'] + '@' + name;
                client.resolve (ticker, messageHash);
            }
        }
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name aax#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the aax api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        const name = 'trade';
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = market['id'] + '@' + name;
        const url = this.urls['api']['ws']['public'];
        const subscribe = {
            'e': 'subscribe',
            'stream': messageHash,
        };
        const request = this.extend (subscribe, params);
        const trades = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        //     {
        //         e: 'BTCUSDT@trade',
        //         p: '-54408.21000000',
        //         q: '0.007700',
        //         t: 1619644477710
        //     }
        //
        const messageHash = this.safeString (message, 'e');
        const parts = messageHash.split ('@');
        const marketId = this.safeString (parts, 0);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        // const timestamp = this.safeInteger (message, 't');
        // const amount = this.safeNumber (message, 'q');
        // const price = this.safeNumber (message, 'p');
        const trade = this.parseTrade (message, market);
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        stored.append (trade);
        client.resolve (stored, messageHash);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name aax#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the aax api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        const name = 'book';
        await this.loadMarkets ();
        const market = this.market (symbol);
        limit = (limit === undefined) ? 20 : limit;
        if ((limit !== 20) && (limit !== 50)) {
            throw new NotSupported (this.id + ' watchOrderBook() accepts limit values of 20 or 50 only');
        }
        const messageHash = market['id'] + '@' + name + '_' + limit.toString ();
        const url = this.urls['api']['ws']['public'];
        const subscribe = {
            'e': 'subscribe',
            'stream': messageHash,
        };
        const request = this.extend (subscribe, params);
        const orderbook = await this.watch (url, messageHash, request, messageHash);
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
        //         asks: [
        //             [ '54397.48000000', '0.002300' ],
        //             [ '54407.86000000', '1.880000' ],
        //             [ '54409.34000000', '0.046900' ],
        //         ],
        //         bids: [
        //             [ '54383.17000000', '1.380000' ],
        //             [ '54374.43000000', '1.880000' ],
        //             [ '54354.07000000', '0.013400' ],
        //         ],
        //         e: 'BTCUSDT@book_20',
        //         t: 1619626148086
        //     }
        //
        const messageHash = this.safeString (message, 'e');
        const [ marketId, nameLimit ] = messageHash.split ('@');
        const parts = nameLimit.split ('_');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const limitString = this.safeString (parts, 1);
        const limit = parseInt (limitString);
        const timestamp = this.safeInteger (message, 't');
        const snapshot = this.parseOrderBook (message, symbol, timestamp);
        let orderbook = undefined;
        if (!(symbol in this.orderbooks)) {
            orderbook = this.orderBook (snapshot, limit);
            this.orderbooks[symbol] = orderbook;
        } else {
            orderbook = this.orderbooks[symbol];
            orderbook.reset (snapshot);
        }
        client.resolve (orderbook, messageHash);
    }

    requestId () {
        // their support said that reqid must be an int32, not documented
        const reqid = this.sum (this.safeInteger (this.options, 'reqid', 0), 1);
        this.options['reqid'] = reqid;
        return reqid;
    }

    async handshake (params = {}) {
        const url = this.urls['api']['ws']['private'];
        const client = this.client (url);
        const event = 'handshake';
        const future = client.future (event);
        const authenticated = this.safeValue (client.subscriptions, event);
        if (authenticated === undefined) {
            const requestId = this.requestId ();
            const query = {
                'event': '#' + event,
                'data': {},
                'cid': requestId,
            };
            const request = this.extend (query, params);
            const messageHash = requestId.toString ();
            const response = await this.watch (url, messageHash, request, event);
            future.resolve (response);
        }
        return await future;
    }

    async authenticate (params = {}) {
        const url = this.urls['api']['ws']['private'];
        const client = this.client (url);
        const event = 'login';
        const future = client.future (event);
        const authenticated = this.safeValue (client.subscriptions, event);
        if (authenticated === undefined) {
            const nonce = this.milliseconds ();
            const payload = nonce.toString () + ':' + this.apiKey;
            const signature = this.hmac (this.encode (payload), this.encode (this.secret));
            const requestId = this.requestId ();
            const query = {
                'event': event,
                'data': {
                    'apiKey': this.apiKey,
                    'nonce': nonce,
                    'signature': signature,
                },
                'cid': requestId,
            };
            const request = this.extend (query, params);
            const messageHash = requestId.toString ();
            const response = await this.watch (url, messageHash, request, event);
            //
            //     {
            //         data: {
            //             isAuthenticated: true,
            //             uid: '1362494'
            //         },
            //         rid: 2
            //     }
            //
            //     {
            //         data: {
            //             authError: { name: 'AuthLoginError', message: 'login failed' },
            //             isAuthenticated: false
            //         },
            //         rid: 2
            //     }
            //
            const data = this.safeValue (response, 'data', {});
            const isAuthenticated = this.safeValue (data, 'isAuthenticated', false);
            if (isAuthenticated) {
                future.resolve (response);
            } else {
                throw new AuthenticationError (this.id + ' ' + this.json (response));
            }
        }
        return await future;
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name aax#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the aax api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        await this.handshake (params);
        const authentication = await this.authenticate (params);
        //
        //     {
        //         data: {
        //             isAuthenticated: true,
        //             uid: '1362494'
        //         },
        //         rid: 2
        //     }
        //
        const data = this.safeValue (authentication, 'data', {});
        const uid = this.safeString (data, 'uid');
        const url = this.urls['api']['ws']['private'];
        const defaultUserId = this.safeString2 (this.options, 'userId', 'userID', uid);
        const userId = this.safeString2 (params, 'userId', 'userID', defaultUserId);
        const defaultType = this.safeString2 (this.options, 'watchBalance', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, [ 'userId', 'userID', 'type' ]);
        const channel = 'user/' + userId;
        const messageHash = type + ':balance';
        const requestId = this.requestId ();
        const subscribe = {
            'event': '#subscribe',
            'data': {
                'channel': channel,
            },
            'cid': requestId,
        };
        const request = this.deepExtend (subscribe, query);
        return await this.watch (url, messageHash, request, channel);
    }

    handleBalance (client, message) {
        //
        //     {
        //         data: {
        //             unavailable: '40.00000000',
        //             available: '66.00400000',
        //             location: 'AAXGL',
        //             currency: 'USDT',
        //             purseType: 'SPTP',
        //             userID: '1362494'
        //         },
        //         event: 'USER_BALANCE'
        //     }
        //
        const data = this.safeValue (message, 'data', {});
        const purseType = this.safeString (data, 'purseType');
        const accounts = this.safeValue (this.options, 'accountsById', {});
        const accountType = this.safeString (accounts, purseType);
        const messageHash = accountType + ':balance';
        const currencyId = this.safeString (data, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const account = this.account ();
        account['free'] = this.safeString (data, 'available');
        account['used'] = this.safeString (data, 'unavailable');
        if (!(accountType in this.balance)) {
            this.balance[accountType] = {};
        }
        this.balance[accountType][code] = account;
        this.balance[accountType] = this.safeBalance (this.balance[accountType]);
        client.resolve (this.balance[accountType], messageHash);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name aax#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the aax api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        await this.handshake (params);
        const authentication = await this.authenticate (params);
        //
        //     {
        //         data: {
        //             isAuthenticated: true,
        //             uid: '1362494'
        //         },
        //         rid: 2
        //     }
        //
        const data = this.safeValue (authentication, 'data', {});
        const uid = this.safeString (data, 'uid');
        const url = this.urls['api']['ws']['private'];
        const defaultUserId = this.safeString2 (this.options, 'userId', 'userID', uid);
        const userId = this.safeString2 (params, 'userId', 'userID', defaultUserId);
        const query = this.omit (params, [ 'userId', 'userID' ]);
        const channel = 'user/' + userId;
        let messageHash = 'orders';
        if (symbol !== undefined) {
            messageHash += ':' + symbol;
        }
        const requestId = this.requestId ();
        const subscribe = {
            'event': '#subscribe',
            'data': {
                'channel': channel,
            },
            'cid': requestId,
        };
        const request = this.deepExtend (subscribe, query);
        const orders = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrder (client, message) {
        //
        // spot
        //
        //     {
        //         data: {
        //             symbol: 'ETHUSDT',
        //             orderType: 2,
        //             avgPrice: '0',
        //             orderStatus: 5,
        //             userID: '1362494',
        //             quote: 'USDT',
        //             rejectCode: 0,
        //             price: '2000',
        //             orderQty: '0.02',
        //             commission: '0',
        //             id: '309458413831172096',
        //             timeInForce: 1,
        //             isTriggered: false,
        //             side: 1,
        //             orderID: '1qA7O2CnOo',
        //             leavesQty: '0',
        //             cumQty: '0',
        //             updateTime: '2021-05-03T14:37:26.498Z',
        //             lastQty: '0',
        //             stopPrice: '0',
        //             createTime: '2021-05-03T14:37:15.316Z',
        //             transactTime: '2021-05-03T14:37:26.492Z',
        //             base: 'ETH',
        //             lastPrice: '0'
        //         },
        //         event: 'SPOT'
        //     }
        //
        // futures
        //
        //     {
        //         data: {
        //             opens: { symbol: 'ETHUSDTFP', buy: 1, sell: 0 },
        //             order: {
        //                 liqType: 0,
        //                 symbol: 'ETHUSDTFP',
        //                 orderType: 2,
        //                 leverage: '10',
        //                 marketPrice: '3283.4550000000',
        //                 code: 'FP',
        //                 avgPrice: '0',
        //                 orderStatus: 1,
        //                 userID: '1362494',
        //                 quote: 'USDT',
        //                 rejectCode: 0,
        //                 price: '2000',
        //                 orderQty: '1.0',
        //                 commission: '0',
        //                 id: '309633415658450944',
        //                 timeInForce: 1,
        //                 isTriggered: false,
        //                 side: 1,
        //                 orderID: '1qDemW8W1W',
        //                 leavesQty: '1.0',
        //                 cumQty: '0',
        //                 updateTime: '2021-05-04T02:12:39.024Z',
        //                 lastQty: '0',
        //                 stopPrice: '0',
        //                 createTime: '2021-05-04T02:12:39.007Z',
        //                 transactTime: '2021-05-04T02:12:39.018Z',
        //                 settleType: 'VANILLA',
        //                 base: 'ETH',
        //                 lastPrice: '0'
        //             }
        //         },
        //         event: 'FUTURES'
        //     }
        const messageHash = 'orders';
        const data = this.safeValue (message, 'data');
        const order = this.safeValue (data, 'order');
        const parsed = (order === undefined) ? this.parseOrder (data) : this.parseOrder (order);
        const symbol = this.safeString (parsed, 'symbol');
        const orderId = this.safeString (parsed, 'id');
        if (symbol !== undefined) {
            if (this.orders === undefined) {
                const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
                this.orders = new ArrayCacheBySymbolById (limit);
            }
            const cachedOrders = this.orders;
            const orders = this.safeValue (cachedOrders.hashmap, symbol, {});
            const order = this.safeValue (orders, orderId);
            if (order !== undefined) {
                const fee = this.safeValue (order, 'fee');
                if (fee !== undefined) {
                    parsed['fee'] = fee;
                }
                const fees = this.safeValue (order, 'fees');
                if (fees !== undefined) {
                    parsed['fees'] = fees;
                }
                parsed['trades'] = this.safeValue (order, 'trades');
                parsed['timestamp'] = this.safeInteger (order, 'timestamp');
                parsed['datetime'] = this.safeString (order, 'datetime');
            }
            cachedOrders.append (parsed);
            client.resolve (this.orders, messageHash);
            const messageHashSymbol = messageHash + ':' + symbol;
            client.resolve (this.orders, messageHashSymbol);
        }
    }

    handleSystemStatus (client, message) {
        // { e: 'system', status: [ { all: 'active' } ] }
        return message;
    }

    handleSubscriptionStatus (client, message) {
        //
        // public
        //
        //     { e: 'reply', status: 'ok' }
        //
        // private handshake response
        //
        //     {
        //         data: {
        //             id: 'SID-fqC6a7VTFG6X',
        //             info: "Invalid sid 'null', assigned a new one",
        //             isAuthenticated: false,
        //             pingTimeout: 68000
        //         },
        //         rid: 1
        //     }
        //
        const rid = this.safeString (message, 'rid');
        client.resolve (message, rid);
        return message;
    }

    async pong (client, message) {
        //
        //     "#1"
        //
        const response = '#' + '2';
        await client.send (response);
    }

    handlePing (client, message) {
        this.spawn (this.pong, client, message);
    }

    handleNotification (client, message) {
        //
        //     {
        //         "data": {
        //             "userID": "213409",
        //             "purseType": "coin",
        //             "currency": "BTC",
        //             "available": "0.12127194",
        //             "unavailable": "0.01458122"
        //         },
        //         "event": "USER_BALANCE"
        //     }
        //
        const event = this.safeValue (message, 'event');
        const methods = {
            'USER_FUNDS': this.handleBalance,
            'USER_BALANCE': this.handleBalance,
            'SPOT': this.handleOrder,
            'FUTURES': this.handleOrder,
        };
        const method = this.safeValue (methods, event);
        if (method !== undefined) {
            return method.call (this, client, message);
        }
    }

    handleMessage (client, message) {
        //
        //     {
        //         e: 'system',
        //         status: [
        //             { all: 'active' }
        //         ]
        //     }
        //
        //
        //     {
        //         asks: [
        //             [ '54397.48000000', '0.002300' ],
        //             [ '54407.86000000', '1.880000' ],
        //             [ '54409.34000000', '0.046900' ],
        //         ],
        //         bids: [
        //             [ '54383.17000000', '1.380000' ],
        //             [ '54374.43000000', '1.880000' ],
        //             [ '54354.07000000', '0.013400' ],
        //         ],
        //         e: 'BTCUSDT@book_20',
        //         t: 1619626148086
        //     }
        //
        // server may publish empty events if there is nothing to send right after a new connection is established
        //
        //     {"e":"empty"}
        //
        // private handshake response
        //
        //     {
        //         data: {
        //             id: 'SID-fqC6a7VTFG6X',
        //             info: "Invalid sid 'null', assigned a new one",
        //             isAuthenticated: false,
        //             pingTimeout: 68000
        //         },
        //         rid: 1
        //     }
        //
        // private balance update
        //
        //     {
        //         data: {
        //             channel: 'user/1362494',
        //             data: {
        //                 data: {
        //                     unavailable: '40.00000000',
        //                     available: '66.00400000',
        //                     location: 'AAXGL',
        //                     currency: 'USDT',
        //                     purseType: 'SPTP',
        //                     userID: '1362494'
        //                 },
        //                 event: 'USER_BALANCE'
        //             }
        //         },
        //         event: '#publish'
        //     }
        //
        // keepalive
        //
        //     #1
        //     #2
        //
        // private spot order update
        //
        //     {
        //         data: {
        //             channel: 'user/1362494',
        //             data: {
        //                 data: {
        //                     symbol: 'ETHUSDT',
        //                     orderType: 2,
        //                     avgPrice: '0',
        //                     orderStatus: 5,
        //                     userID: '1362494',
        //                     quote: 'USDT',
        //                     rejectCode: 0,
        //                     price: '2000',
        //                     orderQty: '0.02',
        //                     commission: '0',
        //                     id: '309458413831172096',
        //                     timeInForce: 1,
        //                     isTriggered: false,
        //                     side: 1,
        //                     orderID: '1qA7O2CnOo',
        //                     leavesQty: '0',
        //                     cumQty: '0',
        //                     updateTime: '2021-05-03T14:37:26.498Z',
        //                     lastQty: '0',
        //                     stopPrice: '0',
        //                     createTime: '2021-05-03T14:37:15.316Z',
        //                     transactTime: '2021-05-03T14:37:26.492Z',
        //                     base: 'ETH',
        //                     lastPrice: '0'
        //                 },
        //                 event: 'SPOT'
        //             }
        //         },
        //         event: '#publish'
        //     }
        //
        // private futures order update
        //
        //     {
        //         data: {
        //             channel: 'user/1362494',
        //             data: {
        //                 data: {
        //                     opens: { symbol: 'ETHUSDTFP', buy: 1, sell: 0 },
        //                     order: {
        //                         liqType: 0,
        //                         symbol: 'ETHUSDTFP',
        //                         orderType: 2,
        //                         leverage: '10',
        //                         marketPrice: '3283.4550000000',
        //                         code: 'FP',
        //                         avgPrice: '0',
        //                         orderStatus: 1,
        //                         userID: '1362494',
        //                         quote: 'USDT',
        //                         rejectCode: 0,
        //                         price: '2000',
        //                         orderQty: '1.0',
        //                         commission: '0',
        //                         id: '309633415658450944',
        //                         timeInForce: 1,
        //                         isTriggered: false,
        //                         side: 1,
        //                         orderID: '1qDemW8W1W',
        //                         leavesQty: '1.0',
        //                         cumQty: '0',
        //                         updateTime: '2021-05-04T02:12:39.024Z',
        //                         lastQty: '0',
        //                         stopPrice: '0',
        //                         createTime: '2021-05-04T02:12:39.007Z',
        //                         transactTime: '2021-05-04T02:12:39.018Z',
        //                         settleType: 'VANILLA',
        //                         base: 'ETH',
        //                         lastPrice: '0'
        //                     }
        //                 },
        //                 event: 'FUTURES'
        //             }
        //         },
        //         event: '#publish'
        //     }
        //
        if (typeof message === 'string') {
            if (message === '#1') {
                this.handlePing (client, message);
            }
        } else {
            const event = this.safeString (message, 'event');
            const e = this.safeString (message, 'e');
            if (event === '#publish') {
                // private
                const contents = this.safeValue (message, 'data', {});
                const data = this.safeValue (contents, 'data', {});
                this.handleNotification (client, data);
            } else if (e === undefined) {
                // private
                const rid = this.safeString (message, 'rid');
                if (rid !== undefined) {
                    this.handleSubscriptionStatus (client, message);
                }
            } else {
                // public
                const parts = e.split ('@');
                const numParts = parts.length;
                const methods = {
                    'reply': this.handleSubscriptionStatus,
                    'system': this.handleSystemStatus,
                    'book': this.handleOrderBook,
                    'trade': this.handleTrades,
                    'empty': undefined, // server may publish empty events if there is nothing to send right after a new connection is established
                    'tickers': this.handleTickers,
                    'candles': this.handleOHLCV,
                    'done': this.handleOrder,
                };
                let method = undefined;
                if (numParts > 1) {
                    const nameLimit = this.safeString (parts, 1);
                    const subParts = nameLimit.split ('_');
                    const first = this.safeString (subParts, 0);
                    const second = this.safeString (subParts, 1);
                    method = this.safeValue2 (methods, first, second);
                } else {
                    const name = this.safeString (parts, 0);
                    method = this.safeValue (methods, name);
                }
                if (method !== undefined) {
                    return method.call (this, client, message);
                }
            }
        }
    }
};
