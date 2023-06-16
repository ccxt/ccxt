'use strict';

var hollaex$1 = require('../hollaex.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');
var sha256 = require('../static_dependencies/noble-hashes/sha256.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class hollaex extends hollaex$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': false,
                'watchOHLCV': false,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': false,
                'watchTickers': false,
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://api.hollaex.com/stream',
                },
                'test': {
                    'ws': 'wss://api.sandbox.hollaex.com/stream',
                },
            },
            'options': {
                'watchBalance': {
                // 'api-expires': undefined,
                },
                'watchOrders': {
                // 'api-expires': undefined,
                },
            },
            'streaming': {
                'ping': this.ping,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        'Bearer or HMAC authentication required': errors.BadSymbol,
                        'Error: wrong input': errors.BadRequest, // { error: 'Error: wrong input' }
                    },
                },
            },
        });
    }
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name hollaex#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the hollaex api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const messageHash = 'orderbook' + ':' + market['id'];
        const orderbook = await this.watchPublic(messageHash, params);
        return orderbook.limit();
    }
    handleOrderBook(client, message) {
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
        const marketId = this.safeString(message, 'symbol');
        const channel = this.safeString(message, 'topic');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const data = this.safeValue(message, 'data');
        const timestamp = this.safeString(data, 'timestamp');
        const timestampMs = this.parse8601(timestamp);
        const snapshot = this.parseOrderBook(data, symbol, timestampMs);
        let orderbook = undefined;
        if (!(symbol in this.orderbooks)) {
            orderbook = this.orderBook(snapshot);
            this.orderbooks[symbol] = orderbook;
        }
        else {
            orderbook = this.orderbooks[symbol];
            orderbook.reset(snapshot);
        }
        const messageHash = channel + ':' + marketId;
        client.resolve(orderbook, messageHash);
    }
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hollaex#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the hollaex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const messageHash = 'trade' + ':' + market['id'];
        const trades = await this.watchPublic(messageHash, params);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleTrades(client, message) {
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
        const channel = this.safeString(message, 'topic');
        const marketId = this.safeString(message, 'symbol');
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
        const messageHash = channel + ':' + marketId;
        client.resolve(stored, messageHash);
        client.resolve(stored, channel);
    }
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hollaex#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the hollaex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure
         */
        await this.loadMarkets();
        let messageHash = 'usertrade';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
            messageHash += ':' + market['id'];
        }
        const trades = await this.watchPrivate(messageHash, params);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit, true);
    }
    handleMyTrades(client, message, subscription = undefined) {
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
        const channel = this.safeString(message, 'topic');
        const rawTrades = this.safeValue(message, 'data');
        // usually the first message is an empty array
        // when the user does not have any trades yet
        const dataLength = rawTrades.length;
        if (dataLength === 0) {
            return 0;
        }
        if (this.myTrades === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            this.myTrades = new Cache.ArrayCache(limit);
        }
        const stored = this.myTrades;
        const marketIds = {};
        for (let i = 0; i < rawTrades.length; i++) {
            const trade = rawTrades[i];
            const parsed = this.parseTrade(trade);
            stored.append(parsed);
            const symbol = trade['symbol'];
            const market = this.market(symbol);
            const marketId = market['id'];
            marketIds[marketId] = true;
        }
        // non-symbol specific
        client.resolve(this.myTrades, channel);
        const keys = Object.keys(marketIds);
        for (let i = 0; i < keys.length; i++) {
            const marketId = keys[i];
            const messageHash = channel + ':' + marketId;
            client.resolve(this.myTrades, messageHash);
        }
    }
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hollaex#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the hollaex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let messageHash = 'order';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
            messageHash += ':' + market['id'];
        }
        const orders = await this.watchPrivate(messageHash, params);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit);
    }
    handleOrder(client, message, subscription = undefined) {
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
        const channel = this.safeString(message, 'topic');
        const data = this.safeValue(message, 'data', {});
        // usually the first message is an empty array
        const dataLength = data.length;
        if (dataLength === 0) {
            return 0;
        }
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new Cache.ArrayCacheBySymbolById(limit);
        }
        const stored = this.orders;
        let rawOrders = undefined;
        if (!Array.isArray(data)) {
            rawOrders = [data];
        }
        else {
            rawOrders = data;
        }
        const marketIds = {};
        for (let i = 0; i < rawOrders.length; i++) {
            const order = rawOrders[i];
            const parsed = this.parseOrder(order);
            stored.append(parsed);
            const symbol = order['symbol'];
            const market = this.market(symbol);
            const marketId = market['id'];
            marketIds[marketId] = true;
        }
        // non-symbol specific
        client.resolve(this.orders, channel);
        const keys = Object.keys(marketIds);
        for (let i = 0; i < keys.length; i++) {
            const marketId = keys[i];
            const messageHash = channel + ':' + marketId;
            client.resolve(this.orders, messageHash);
        }
    }
    async watchBalance(params = {}) {
        /**
         * @method
         * @name hollaex#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the hollaex api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        const messageHash = 'wallet';
        return await this.watchPrivate(messageHash, params);
    }
    handleBalance(client, message) {
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
        const messageHash = this.safeString(message, 'topic');
        const data = this.safeValue(message, 'data');
        const keys = Object.keys(data);
        const timestamp = this.safeIntegerProduct(message, 'time', 1000);
        this.balance['info'] = data;
        this.balance['timestamp'] = timestamp;
        this.balance['datetime'] = this.iso8601(timestamp);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const parts = key.split('_');
            const currencyId = this.safeString(parts, 0);
            const code = this.safeCurrencyCode(currencyId);
            const account = (code in this.balance) ? this.balance[code] : this.account();
            const second = this.safeString(parts, 1);
            const freeOrTotal = (second === 'available') ? 'free' : 'total';
            account[freeOrTotal] = this.safeString(data, key);
            this.balance[code] = account;
        }
        this.balance = this.safeBalance(this.balance);
        client.resolve(this.balance, messageHash);
    }
    async watchPublic(messageHash, params = {}) {
        const url = this.urls['api']['ws'];
        const request = {
            'op': 'subscribe',
            'args': [messageHash],
        };
        const message = this.extend(request, params);
        return await this.watch(url, messageHash, message, messageHash);
    }
    async watchPrivate(messageHash, params = {}) {
        this.checkRequiredCredentials();
        let expires = this.safeString(this.options, 'ws-expires');
        if (expires === undefined) {
            const timeout = parseInt((this.timeout / 1000).toString());
            expires = this.sum(this.seconds(), timeout);
            expires = expires.toString();
            // we need to memoize these values to avoid generating a new url on each method execution
            // that would trigger a new connection on each received message
            this.options['ws-expires'] = expires;
        }
        const url = this.urls['api']['ws'];
        const auth = 'CONNECT' + '/stream' + expires;
        const signature = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256);
        const authParams = {
            'api-key': this.apiKey,
            'api-signature': signature,
            'api-expires': expires,
        };
        const signedUrl = url + '?' + this.urlencode(authParams);
        const request = {
            'op': 'subscribe',
            'args': [messageHash],
        };
        const message = this.extend(request, params);
        return await this.watch(signedUrl, messageHash, message, messageHash);
    }
    handleErrorMessage(client, message) {
        //
        //     { error: 'Bearer or HMAC authentication required' }
        //     { error: 'Error: wrong input' }
        //
        const error = this.safeInteger(message, 'error');
        try {
            if (error !== undefined) {
                const feedback = this.id + ' ' + this.json(message);
                this.throwExactlyMatchedException(this.exceptions['ws']['exact'], error, feedback);
            }
        }
        catch (e) {
            if (e instanceof errors.AuthenticationError) {
                return false;
            }
        }
        return message;
    }
    handleMessage(client, message) {
        //
        // pong
        //
        //     { message: 'pong' }
        //
        // trade
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
        // orderbook
        //
        //     {
        //         topic: 'orderbook',
        //         action: 'partial',
        //         symbol: 'ltc-usdt',
        //         data: {
        //             bids: [
        //                 [104.29, 5.2264],
        //                 [103.86,1.3629],
        //                 [101.82,0.5942]
        //             ],
        //             asks: [
        //                 [104.81,9.5531],
        //                 [105.54,0.6416],
        //                 [106.18,1.4141],
        //             ],
        //             timestamp: '2022-04-11T10:37:01.227Z'
        //         },
        //         time: 1649673421
        //     }
        //
        // order
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
        // balance
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
        //         }
        //     }
        //
        if (!this.handleErrorMessage(client, message)) {
            return;
        }
        const content = this.safeString(message, 'message');
        if (content === 'pong') {
            this.handlePong(client, message);
            return;
        }
        const methods = {
            'trade': this.handleTrades,
            'orderbook': this.handleOrderBook,
            'order': this.handleOrder,
            'wallet': this.handleBalance,
            'usertrade': this.handleMyTrades,
        };
        const topic = this.safeValue(message, 'topic');
        const method = this.safeValue(methods, topic);
        if (method !== undefined) {
            method.call(this, client, message);
        }
    }
    ping(client) {
        // hollaex does not support built-in ws protocol-level ping-pong
        return { 'op': 'ping' };
    }
    handlePong(client, message) {
        client.lastPong = this.milliseconds();
        return message;
    }
    onError(client, error) {
        this.options['ws-expires'] = undefined;
        this.onError(client, error);
    }
    onClose(client, error) {
        this.options['ws-expires'] = undefined;
        this.onClose(client, error);
    }
}

module.exports = hollaex;
