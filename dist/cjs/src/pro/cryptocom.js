'use strict';

var cryptocom$1 = require('../cryptocom.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');
var sha256 = require('../static_dependencies/noble-hashes/sha256.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class cryptocom extends cryptocom$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchMyTrades': true,
                'watchTrades': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://stream.crypto.com/v2/market',
                        'private': 'wss://stream.crypto.com/v2/user',
                    },
                },
                'test': {
                    'public': 'wss://uat-stream.3ona.co/v2/market',
                    'private': 'wss://uat-stream.3ona.co/v2/user',
                },
            },
            'options': {},
            'streaming': {},
        });
    }
    async pong(client, message) {
        // {
        //     "id": 1587523073344,
        //     "method": "public/heartbeat",
        //     "code": 0
        // }
        await client.send({ 'id': this.safeInteger(message, 'id'), 'method': 'public/respond-heartbeat' });
    }
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://exchange-docs.crypto.com/spot/index.html#book-instrument_name-depth
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' watchOrderBook() supports spot markets only');
        }
        const messageHash = 'book' + '.' + market['id'];
        const orderbook = await this.watchPublic(messageHash, params);
        return orderbook.limit();
    }
    handleOrderBookSnapshot(client, message) {
        // full snapshot
        //
        // {
        //     "instrument_name":"LTC_USDT",
        //     "subscription":"book.LTC_USDT.150",
        //     "channel":"book",
        //     "depth":150,
        //     "data": [
        //          {
        //              'bids': [
        //                  [122.21, 0.74041, 4]
        //              ],
        //              'asks': [
        //                  [122.29, 0.00002, 1]
        //              ]
        //              't': 1648123943803,
        //              's':754560122
        //          }
        //      ]
        // }
        //
        const messageHash = this.safeString(message, 'subscription');
        const marketId = this.safeString(message, 'instrument_name');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        let data = this.safeValue(message, 'data');
        data = this.safeValue(data, 0);
        const timestamp = this.safeInteger(data, 't');
        const snapshot = this.parseOrderBook(data, symbol, timestamp);
        snapshot['nonce'] = this.safeInteger(data, 's');
        let orderbook = this.safeValue(this.orderbooks, symbol);
        if (orderbook === undefined) {
            const limit = this.safeInteger(message, 'depth');
            orderbook = this.orderBook({}, limit);
        }
        orderbook.reset(snapshot);
        this.orderbooks[symbol] = orderbook;
        client.resolve(orderbook, messageHash);
    }
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' watchTrades() supports spot markets only');
        }
        const messageHash = 'trade' + '.' + market['id'];
        const trades = await this.watchPublic(messageHash, params);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleTrades(client, message) {
        //
        // {
        //     code: 0,
        //     method: 'subscribe',
        //     result: {
        //       instrument_name: 'BTC_USDT',
        //       subscription: 'trade.BTC_USDT',
        //       channel: 'trade',
        //       data: [
        //             {
        //                 "dataTime":1648122434405,
        //                 "d":"2358394540212355488",
        //                 "s":"SELL",
        //                 "p":42980.85,
        //                 "q":0.002325,
        //                 "t":1648122434404,
        //                 "i":"BTC_USDT"
        //              }
        //              (...)
        //       ]
        // }
        //
        const channel = this.safeString(message, 'channel');
        const marketId = this.safeString(message, 'instrument_name');
        const symbolSpecificMessageHash = this.safeString(message, 'subscription');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        let stored = this.safeValue(this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            stored = new Cache.ArrayCache(limit);
            this.trades[symbol] = stored;
        }
        const data = this.safeValue(message, 'data', []);
        const parsedTrades = this.parseTrades(data, market);
        for (let j = 0; j < parsedTrades.length; j++) {
            stored.append(parsedTrades[j]);
        }
        client.resolve(stored, symbolSpecificMessageHash);
        client.resolve(stored, channel);
    }
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure
         */
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
        }
        const defaultType = this.safeString(this.options, 'defaultType', 'spot');
        let messageHash = (defaultType === 'margin') ? 'user.margin.trade' : 'user.trade';
        messageHash = (market !== undefined) ? (messageHash + '.' + market['id']) : messageHash;
        const trades = await this.watchPrivate(messageHash, params);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit, true);
    }
    async watchTicker(symbol, params = {}) {
        /**
         * @method
         * @name cryptocom#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' watchTicker() supports spot markets only');
        }
        const messageHash = 'ticker' + '.' + market['id'];
        return await this.watchPublic(messageHash, params);
    }
    handleTicker(client, message) {
        //
        // {
        //     "info":{
        //        "instrument_name":"BTC_USDT",
        //        "subscription":"ticker.BTC_USDT",
        //        "channel":"ticker",
        //        "data":[
        //           {
        //              "i":"BTC_USDT",
        //              "b":43063.19,
        //              "k":43063.2,
        //              "a":43063.19,
        //              "t":1648121165658,
        //              "v":43573.912409,
        //              "h":43498.51,
        //              "l":41876.58,
        //              "c":1087.43
        //           }
        //        ]
        //     }
        //  }
        //
        const messageHash = this.safeString(message, 'subscription');
        const marketId = this.safeString(message, 'instrument_name');
        const market = this.safeMarket(marketId);
        const data = this.safeValue(message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const ticker = data[i];
            const parsed = this.parseTicker(ticker, market);
            const symbol = parsed['symbol'];
            this.tickers[symbol] = parsed;
            client.resolve(parsed, messageHash);
        }
    }
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' watchOHLCV() supports spot markets only');
        }
        const interval = this.safeString(this.timeframes, timeframe, timeframe);
        const messageHash = 'candlestick' + '.' + interval + '.' + market['id'];
        const ohlcv = await this.watchPublic(messageHash, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    handleOHLCV(client, message) {
        //
        //  {
        //       instrument_name: 'BTC_USDT',
        //       subscription: 'candlestick.1m.BTC_USDT',
        //       channel: 'candlestick',
        //       depth: 300,
        //       interval: '1m',
        //       data: [ [Object] ]
        //   }
        //
        const messageHash = this.safeString(message, 'subscription');
        const marketId = this.safeString(message, 'instrument_name');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const interval = this.safeString(message, 'interval');
        const timeframe = this.findTimeframe(interval);
        this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
        let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            stored = new Cache.ArrayCacheByTimestamp(limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const data = this.safeValue(message, 'data');
        for (let i = 0; i < data.length; i++) {
            const tick = data[i];
            const parsed = this.parseOHLCV(tick, market);
            stored.append(parsed);
        }
        client.resolve(stored, messageHash);
    }
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name cryptocom#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
        }
        const defaultType = this.safeString(this.options, 'defaultType', 'spot');
        let messageHash = (defaultType === 'margin') ? 'user.margin.order' : 'user.order';
        messageHash = (market !== undefined) ? (messageHash + '.' + market['id']) : messageHash;
        const orders = await this.watchPrivate(messageHash, params);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit);
    }
    handleOrders(client, message, subscription = undefined) {
        //
        // {
        //     "method": "subscribe",
        //     "result": {
        //       "instrument_name": "ETH_CRO",
        //       "subscription": "user.order.ETH_CRO",
        //       "channel": "user.order",
        //       "data": [
        //         {
        //           "status": "ACTIVE",
        //           "side": "BUY",
        //           "price": 1,
        //           "quantity": 1,
        //           "order_id": "366455245775097673",
        //           "client_oid": "my_order_0002",
        //           "create_time": 1588758017375,
        //           "update_time": 1588758017411,
        //           "type": "LIMIT",
        //           "instrument_name": "ETH_CRO",
        //           "cumulative_quantity": 0,
        //           "cumulative_value": 0,
        //           "avg_price": 0,
        //           "fee_currency": "CRO",
        //           "time_in_force":"GOOD_TILL_CANCEL"
        //         }
        //       ],
        //       "channel": "user.order.ETH_CRO"
        //     }
        //
        const channel = this.safeString(message, 'channel');
        const symbolSpecificMessageHash = this.safeString(message, 'subscription');
        const orders = this.safeValue(message, 'data', []);
        const ordersLength = orders.length;
        if (ordersLength > 0) {
            if (this.orders === undefined) {
                const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
                this.orders = new Cache.ArrayCacheBySymbolById(limit);
            }
            const stored = this.orders;
            const parsed = this.parseOrders(orders);
            for (let i = 0; i < parsed.length; i++) {
                stored.append(parsed[i]);
            }
            client.resolve(stored, symbolSpecificMessageHash);
            // non-symbol specific
            client.resolve(stored, channel);
        }
    }
    async watchBalance(params = {}) {
        /**
         * @method
         * @name cryptocom#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the cryptocom api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        const defaultType = this.safeString(this.options, 'defaultType', 'spot');
        const messageHash = (defaultType === 'margin') ? 'user.margin.balance' : 'user.balance';
        return await this.watchPrivate(messageHash, params);
    }
    handleBalance(client, message) {
        //
        // {
        //     "method": "subscribe",
        //     "result": {
        //       "subscription": "user.balance",
        //       "channel": "user.balance",
        //       "data": [
        //         {
        //           "currency": "CRO",
        //           "balance": 99999999947.99626,
        //           "available": 99999988201.50826,
        //           "order": 11746.488,
        //           "stake": 0
        //         }
        //       ],
        //       "channel": "user.balance"
        //     }
        // }
        //
        const messageHash = this.safeString(message, 'subscription');
        const data = this.safeValue(message, 'data');
        this.balance['info'] = data;
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const currencyId = this.safeString(balance, 'currency');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString(balance, 'available');
            account['total'] = this.safeString(balance, 'balance');
            this.balance[code] = account;
            this.balance = this.safeBalance(this.balance);
        }
        client.resolve(this.balance, messageHash);
    }
    async watchPublic(messageHash, params = {}) {
        const url = this.urls['api']['ws']['public'];
        const id = this.nonce();
        const request = {
            'method': 'subscribe',
            'params': {
                'channels': [messageHash],
            },
            'nonce': id,
        };
        const message = this.extend(request, params);
        return await this.watch(url, messageHash, message, messageHash);
    }
    async watchPrivate(messageHash, params = {}) {
        await this.authenticate();
        const url = this.urls['api']['ws']['private'];
        const id = this.nonce();
        const request = {
            'method': 'subscribe',
            'params': {
                'channels': [messageHash],
            },
            'nonce': id,
        };
        const message = this.extend(request, params);
        return await this.watch(url, messageHash, message, messageHash);
    }
    handleErrorMessage(client, message) {
        // {
        //     id: 0,
        //     code: 10004,
        //     method: 'subscribe',
        //     message: 'invalid channel {"channels":["trade.BTCUSD-PERP"]}'
        // }
        const errorCode = this.safeInteger(message, 'code');
        try {
            if (errorCode) {
                const feedback = this.id + ' ' + this.json(message);
                this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
                const messageString = this.safeValue(message, 'message');
                if (messageString !== undefined) {
                    this.throwBroadlyMatchedException(this.exceptions['broad'], messageString, feedback);
                }
            }
            return false;
        }
        catch (e) {
            if (e instanceof errors.AuthenticationError) {
                const messageHash = 'authenticated';
                client.reject(e, messageHash);
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
            }
            else {
                client.reject(e);
            }
            return true;
        }
    }
    handleMessage(client, message) {
        // ping
        // {
        //     "id": 1587523073344,
        //     "method": "public/heartbeat",
        //     "code": 0
        // }
        // auth
        //  { id: 1648132625434, method: 'public/auth', code: 0 }
        // ohlcv
        // {
        //     code: 0,
        //     method: 'subscribe',
        //     result: {
        //       instrument_name: 'BTC_USDT',
        //       subscription: 'candlestick.1m.BTC_USDT',
        //       channel: 'candlestick',
        //       depth: 300,
        //       interval: '1m',
        //       data: [ [Object] ]
        //     }
        //   }
        // ticker
        // {
        //     "info":{
        //        "instrument_name":"BTC_USDT",
        //        "subscription":"ticker.BTC_USDT",
        //        "channel":"ticker",
        //        "data":[ { } ]
        //
        if (this.handleErrorMessage(client, message)) {
            return;
        }
        const subject = this.safeString(message, 'method');
        if (subject === 'public/heartbeat') {
            this.handlePing(client, message);
            return;
        }
        if (subject === 'public/auth') {
            this.handleAuthenticate(client, message);
            return;
        }
        const methods = {
            'candlestick': this.handleOHLCV,
            'ticker': this.handleTicker,
            'trade': this.handleTrades,
            'book': this.handleOrderBookSnapshot,
            'user.order': this.handleOrders,
            'user.margin.order': this.handleOrders,
            'user.trade': this.handleTrades,
            'user.margin.trade': this.handleTrades,
            'user.balance': this.handleBalance,
            'user.margin.balance': this.handleBalance,
        };
        const result = this.safeValue2(message, 'result', 'info');
        const channel = this.safeString(result, 'channel');
        const method = this.safeValue(methods, channel);
        if (method !== undefined) {
            method.call(this, client, result);
        }
    }
    authenticate(params = {}) {
        this.checkRequiredCredentials();
        const url = this.urls['api']['ws']['private'];
        const client = this.client(url);
        const messageHash = 'authenticated';
        let future = this.safeValue(client.subscriptions, messageHash);
        if (future === undefined) {
            const method = 'public/auth';
            const nonce = this.nonce().toString();
            const auth = method + nonce + this.apiKey + nonce;
            const signature = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256);
            const request = {
                'id': nonce,
                'nonce': nonce,
                'method': method,
                'api_key': this.apiKey,
                'sig': signature,
            };
            const message = this.extend(request, params);
            future = this.watch(url, messageHash, message);
            client.subscriptions[messageHash] = future;
        }
        return future;
    }
    handlePing(client, message) {
        this.spawn(this.pong, client, message);
    }
    handleAuthenticate(client, message) {
        //
        //  { id: 1648132625434, method: 'public/auth', code: 0 }
        //
        client.resolve(message, 'authenticated');
    }
}

module.exports = cryptocom;
