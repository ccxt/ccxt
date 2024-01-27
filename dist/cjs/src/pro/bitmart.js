'use strict';

var bitmart$1 = require('../bitmart.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');
var sha256 = require('../static_dependencies/noble-hashes/sha256.js');
var OrderBookSide = require('../base/ws/OrderBookSide.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class bitmart extends bitmart$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'createOrderWs': false,
                'editOrderWs': false,
                'fetchOpenOrdersWs': false,
                'fetchOrderWs': false,
                'cancelOrderWs': false,
                'cancelOrdersWs': false,
                'cancelAllOrdersWs': false,
                'ws': true,
                'watchBalance': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTrades': true,
                'watchOHLCV': true,
                'watchPosition': 'emulated',
                'watchPositions': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': {
                            'public': 'wss://ws-manager-compress.{hostname}/api?protocol=1.1',
                            'private': 'wss://ws-manager-compress.{hostname}/user?protocol=1.1',
                        },
                        'swap': {
                            'public': 'wss://openapi-ws.{hostname}/api?protocol=1.1',
                            'private': 'wss://openapi-ws.{hostname}/user?protocol=1.1',
                        },
                    },
                },
            },
            'options': {
                'defaultType': 'spot',
                'watchBalance': {
                    'fetchBalanceSnapshot': true,
                    'awaitBalanceSnapshot': false, // whether to wait for the balance snapshot before providing updates
                },
                'watchOrderBook': {
                    'depth': 'depth/increase100', // depth/increase100, depth5, depth20, depth50
                },
                'ws': {
                    'inflate': true,
                },
                'timeframes': {
                    '1m': '1m',
                    '3m': '3m',
                    '5m': '5m',
                    '15m': '15m',
                    '30m': '30m',
                    '45m': '45m',
                    '1h': '1H',
                    '2h': '2H',
                    '3h': '3H',
                    '4h': '4H',
                    '1d': '1D',
                    '1w': '1W',
                    '1M': '1M',
                },
            },
            'streaming': {
                'keepAlive': 15000,
            },
        });
    }
    async subscribe(channel, symbol, type, params = {}) {
        const market = this.market(symbol);
        const url = this.implodeHostname(this.urls['api']['ws'][type]['public']);
        let request = {};
        let messageHash = undefined;
        if (type === 'spot') {
            messageHash = 'spot/' + channel + ':' + market['id'];
            request = {
                'op': 'subscribe',
                'args': [messageHash],
            };
        }
        else {
            messageHash = 'futures/' + channel + ':' + market['id'];
            request = {
                'action': 'subscribe',
                'args': [messageHash],
            };
        }
        return await this.watch(url, messageHash, this.deepExtend(request, params), messageHash);
    }
    async watchBalance(params = {}) {
        /**
         * @method
         * @name bitmart#watchBalance
         * @see https://developer-pro.bitmart.com/en/spot/#private-balance-change
         * @see https://developer-pro.bitmart.com/en/futures/#private-assets-channel
         * @description watch balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets();
        let type = 'spot';
        [type, params] = this.handleMarketTypeAndParams('watchBalance', undefined, params);
        await this.authenticate(type, params);
        let request = {};
        if (type === 'spot') {
            request = {
                'op': 'subscribe',
                'args': ['spot/user/balance:BALANCE_UPDATE'],
            };
        }
        else {
            request = {
                'action': 'subscribe',
                'args': ['futures/asset:USDT', 'futures/asset:BTC', 'futures/asset:ETH'],
            };
        }
        const messageHash = 'balance:' + type;
        const url = this.implodeHostname(this.urls['api']['ws'][type]['private']);
        const client = this.client(url);
        this.setBalanceCache(client, type, messageHash);
        let fetchBalanceSnapshot = undefined;
        let awaitBalanceSnapshot = undefined;
        [fetchBalanceSnapshot, params] = this.handleOptionAndParams(this.options, 'watchBalance', 'fetchBalanceSnapshot', true);
        [awaitBalanceSnapshot, params] = this.handleOptionAndParams(this.options, 'watchBalance', 'awaitBalanceSnapshot', false);
        if (fetchBalanceSnapshot && awaitBalanceSnapshot) {
            await client.future(type + ':fetchBalanceSnapshot');
        }
        return await this.watch(url, messageHash, this.deepExtend(request, params), messageHash);
    }
    setBalanceCache(client, type, subscribeHash) {
        if (subscribeHash in client.subscriptions) {
            return;
        }
        const options = this.safeValue(this.options, 'watchBalance');
        const snapshot = this.safeValue(options, 'fetchBalanceSnapshot', true);
        if (snapshot) {
            const messageHash = type + ':' + 'fetchBalanceSnapshot';
            if (!(messageHash in client.futures)) {
                client.future(messageHash);
                this.spawn(this.loadBalanceSnapshot, client, messageHash, type);
            }
        }
        this.balance[type] = {};
        // without this comment, transpilation breaks for some reason...
    }
    async loadBalanceSnapshot(client, messageHash, type) {
        const response = await this.fetchBalance({ 'type': type });
        this.balance[type] = this.extend(response, this.safeValue(this.balance, type, {}));
        // don't remove the future from the .futures cache
        const future = client.futures[messageHash];
        future.resolve();
        client.resolve(this.balance[type], 'balance:' + type);
    }
    handleBalance(client, message) {
        //
        // spot
        //    {
        //        "data":[
        //           {
        //              "balance_details":[
        //                 {
        //                    "av_bal":"0.206000000000000000000000000000",
        //                    "ccy":"LTC",
        //                    "fz_bal":"0.100000000000000000000000000000"
        //                 }
        //              ],
        //              "event_time":"1701632345415",
        //              "event_type":"TRANSACTION_COMPLETED"
        //           }
        //        ],
        //        "table":"spot/user/balance"
        //    }
        // swap
        //    {
        //        group: 'futures/asset:USDT',
        //        data: {
        //            currency: 'USDT',
        //            available_balance: '37.19688649135',
        //            position_deposit: '0.788687546',
        //            frozen_balance: '0'
        //        }
        //    }
        //
        const channel = this.safeString2(message, 'table', 'group');
        const data = this.safeValue(message, 'data');
        if (data === undefined) {
            return;
        }
        const isSpot = (channel.indexOf('spot') >= 0);
        const type = isSpot ? 'spot' : 'swap';
        this.balance[type]['info'] = message;
        if (isSpot) {
            if (!Array.isArray(data)) {
                return;
            }
            for (let i = 0; i < data.length; i++) {
                const timestamp = this.safeInteger(message, 'event_time');
                this.balance[type]['timestamp'] = timestamp;
                this.balance[type]['datetime'] = this.iso8601(timestamp);
                const balanceDetails = this.safeValue(data[i], 'balance_details', []);
                for (let ii = 0; ii < balanceDetails.length; ii++) {
                    const rawBalance = balanceDetails[i];
                    const account = this.account();
                    const currencyId = this.safeString(rawBalance, 'ccy');
                    const code = this.safeCurrencyCode(currencyId);
                    account['free'] = this.safeString(rawBalance, 'av_bal');
                    account['used'] = this.safeString(rawBalance, 'fz_bal');
                    this.balance[type][code] = account;
                }
            }
        }
        else {
            const currencyId = this.safeString(data, 'currency');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString(data, 'available_balance');
            account['used'] = this.safeString(data, 'frozen_balance');
            this.balance[type][code] = account;
        }
        this.balance[type] = this.safeBalance(this.balance[type]);
        const messageHash = 'balance:' + type;
        client.resolve(this.balance[type], messageHash);
    }
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitmart#watchTrades
         * @see https://developer-pro.bitmart.com/en/spot/#public-trade-channel
         * @see https://developer-pro.bitmart.com/en/futures/#public-trade-channel
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets();
        symbol = this.symbol(symbol);
        const market = this.market(symbol);
        let type = 'spot';
        [type, params] = this.handleMarketTypeAndParams('watchTrades', market, params);
        const trades = await this.subscribe('trade', symbol, type, params);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    async watchTicker(symbol, params = {}) {
        /**
         * @method
         * @name bitmart#watchTicker
         * @see https://developer-pro.bitmart.com/en/spot/#public-ticker-channel
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        symbol = this.symbol(symbol);
        const market = this.market(symbol);
        let type = 'spot';
        [type, params] = this.handleMarketTypeAndParams('watchTicker', market, params);
        if (type === 'swap') {
            throw new errors.NotSupported(this.id + ' watchTicker() does not support ' + type + ' markets. Use watchTickers() instead');
        }
        return await this.subscribe('ticker', symbol, type, params);
    }
    async watchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name bitmart#watchTickers
         * @see https://developer-pro.bitmart.com/en/futures/#overview
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
         * @param {string[]} symbols unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.getMarketFromSymbols(symbols);
        let type = 'spot';
        [type, params] = this.handleMarketTypeAndParams('watchTickers', market, params);
        const url = this.implodeHostname(this.urls['api']['ws'][type]['public']);
        symbols = this.marketSymbols(symbols);
        let messageHash = 'tickers::' + type;
        if (symbols !== undefined) {
            messageHash += '::' + symbols.join(',');
        }
        let request = undefined;
        let tickers = undefined;
        const isSpot = (type === 'spot');
        if (isSpot) {
            if (symbols === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' watchTickers() for ' + type + ' market type requires symbols argument to be provided');
            }
            const marketIds = this.marketIds(symbols);
            const finalArray = [];
            for (let i = 0; i < marketIds.length; i++) {
                finalArray.push('spot/ticker:' + marketIds[i]);
            }
            request = {
                'op': 'subscribe',
                'args': finalArray,
            };
            tickers = await this.watch(url, messageHash, this.deepExtend(request, params), messageHash);
        }
        else {
            request = {
                'action': 'subscribe',
                'args': ['futures/ticker'],
            };
            tickers = await this.watch(url, messageHash, this.deepExtend(request, params), messageHash);
        }
        if (this.newUpdates) {
            return tickers;
        }
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitmart#watchOrders
         * @see https://developer-pro.bitmart.com/en/spot/#private-order-channel
         * @see https://developer-pro.bitmart.com/en/futures/#private-order-channel
         * @description watches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        let messageHash = 'orders';
        if (symbol !== undefined) {
            symbol = this.symbol(symbol);
            market = this.market(symbol);
            messageHash = 'orders::' + symbol;
        }
        let type = 'spot';
        [type, params] = this.handleMarketTypeAndParams('watchOrders', market, params);
        await this.authenticate(type, params);
        let request = undefined;
        if (type === 'spot') {
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' watchOrders() requires a symbol argument for spot markets');
            }
            request = {
                'op': 'subscribe',
                'args': ['spot/user/order:' + market['id']],
            };
        }
        else {
            request = {
                'action': 'subscribe',
                'args': ['futures/order'],
            };
        }
        const url = this.implodeHostname(this.urls['api']['ws'][type]['private']);
        const newOrders = await this.watch(url, messageHash, this.deepExtend(request, params), messageHash);
        if (this.newUpdates) {
            return newOrders;
        }
        return this.filterBySymbolSinceLimit(this.orders, symbol, since, limit, true);
    }
    handleOrders(client, message) {
        //
        // spot
        //    {
        //        "data":[
        //            {
        //                "symbol": "LTC_USDT",
        //                "notional": '',
        //                "side": "buy",
        //                "last_fill_time": "0",
        //                "ms_t": "1646216634000",
        //                "type": "limit",
        //                "filled_notional": "0.000000000000000000000000000000",
        //                "last_fill_price": "0",
        //                "size": "0.500000000000000000000000000000",
        //                "price": "50.000000000000000000000000000000",
        //                "last_fill_count": "0",
        //                "filled_size": "0.000000000000000000000000000000",
        //                "margin_trading": "0",
        //                "state": "8",
        //                "order_id": "24807076628",
        //                "order_type": "0"
        //              }
        //        ],
        //        "table":"spot/user/order"
        //    }
        // swap
        //    {
        //        "group":"futures/order",
        //        "data":[
        //           {
        //              "action":2,
        //              "order":{
        //                 "order_id":"2312045036986775",
        //                 "client_order_id":"",
        //                 "price":"71.61707928",
        //                 "size":"1",
        //                 "symbol":"LTCUSDT",
        //                 "state":1,
        //                 "side":4,
        //                 "type":"market",
        //                 "leverage":"1",
        //                 "open_type":"cross",
        //                 "deal_avg_price":"0",
        //                 "deal_size":"0",
        //                 "create_time":1701625324646,
        //                 "update_time":1701625324640,
        //                 "plan_order_id":"",
        //                 "last_trade":null
        //              }
        //           }
        //        ]
        //    }
        //
        const orders = this.safeValue(message, 'data');
        if (orders === undefined) {
            return;
        }
        const ordersLength = orders.length;
        const newOrders = [];
        const symbols = {};
        if (ordersLength > 0) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            if (this.orders === undefined) {
                this.orders = new Cache.ArrayCacheBySymbolById(limit);
            }
            const stored = this.orders;
            for (let i = 0; i < orders.length; i++) {
                const order = this.parseWsOrder(orders[i]);
                stored.append(order);
                newOrders.push(order);
                const symbol = order['symbol'];
                symbols[symbol] = true;
            }
        }
        const messageHash = 'orders';
        const symbolKeys = Object.keys(symbols);
        for (let i = 0; i < symbolKeys.length; i++) {
            const symbol = symbolKeys[i];
            const symbolSpecificMessageHash = messageHash + '::' + symbol;
            client.resolve(newOrders, symbolSpecificMessageHash);
        }
        client.resolve(newOrders, messageHash);
    }
    parseWsOrder(order, market = undefined) {
        //
        // spot
        //    {
        //        "symbol": "LTC_USDT",
        //        "notional": '',
        //        "side": "buy",
        //        "last_fill_time": "0",
        //        "ms_t": "1646216634000",
        //        "type": "limit",
        //        "filled_notional": "0.000000000000000000000000000000",
        //        "last_fill_price": "0",
        //        "size": "0.500000000000000000000000000000",
        //        "price": "50.000000000000000000000000000000",
        //        "last_fill_count": "0",
        //        "filled_size": "0.000000000000000000000000000000",
        //        "margin_trading": "0",
        //        "state": "8",
        //        "order_id": "24807076628",
        //        "order_type": "0"
        //    }
        // swap
        //    {
        //       "action":2,
        //       "order":{
        //          "order_id":"2312045036986775",
        //          "client_order_id":"",
        //          "price":"71.61707928",
        //          "size":"1",
        //          "symbol":"LTCUSDT",
        //          "state":1,
        //          "side":4,
        //          "type":"market",
        //          "leverage":"1",
        //          "open_type":"cross",
        //          "deal_avg_price":"0",
        //          "deal_size":"0",
        //          "create_time":1701625324646,
        //          "update_time":1701625324640,
        //          "plan_order_id":"",
        //          "last_trade":null
        //       }
        //    }
        //
        const action = this.safeNumber(order, 'action');
        const isSpot = (action === undefined);
        if (isSpot) {
            const marketId = this.safeString(order, 'symbol');
            market = this.safeMarket(marketId, market, '_', 'spot');
            const id = this.safeString(order, 'order_id');
            const clientOrderId = this.safeString(order, 'clientOid');
            const price = this.safeString(order, 'price');
            const filled = this.safeString(order, 'filled_size');
            const amount = this.safeString(order, 'size');
            const type = this.safeString(order, 'type');
            const rawState = this.safeString(order, 'state');
            const status = this.parseOrderStatusByType(market['type'], rawState);
            const timestamp = this.safeInteger(order, 'ms_t');
            const symbol = market['symbol'];
            const side = this.safeStringLower(order, 'side');
            return this.safeOrder({
                'info': order,
                'symbol': symbol,
                'id': id,
                'clientOrderId': clientOrderId,
                'timestamp': undefined,
                'datetime': undefined,
                'lastTradeTimestamp': timestamp,
                'type': type,
                'timeInForce': undefined,
                'postOnly': undefined,
                'side': side,
                'price': price,
                'stopPrice': undefined,
                'triggerPrice': undefined,
                'amount': amount,
                'cost': undefined,
                'average': undefined,
                'filled': filled,
                'remaining': undefined,
                'status': status,
                'fee': undefined,
                'trades': undefined,
            }, market);
        }
        else {
            const orderInfo = this.safeValue(order, 'order');
            const marketId = this.safeString(orderInfo, 'symbol');
            const symbol = this.safeSymbol(marketId, market, '', 'swap');
            const orderId = this.safeString(orderInfo, 'order_id');
            const timestamp = this.safeInteger(orderInfo, 'create_time');
            const updatedTimestamp = this.safeInteger(orderInfo, 'update_time');
            const lastTrade = this.safeValue(orderInfo, 'last_trade');
            const cachedOrders = this.orders;
            const orders = this.safeValue(cachedOrders.hashmap, symbol, {});
            const cachedOrder = this.safeValue(orders, orderId);
            let trades = undefined;
            if (cachedOrder !== undefined) {
                trades = this.safeValue(order, 'trades');
            }
            if (lastTrade !== undefined) {
                if (trades === undefined) {
                    trades = [];
                }
                trades.push(lastTrade);
            }
            return this.safeOrder({
                'info': order,
                'symbol': symbol,
                'id': orderId,
                'clientOrderId': this.safeString(orderInfo, 'client_order_id'),
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
                'lastTradeTimestamp': updatedTimestamp,
                'type': this.safeString(orderInfo, 'type'),
                'timeInForce': undefined,
                'postOnly': undefined,
                'side': this.parseWsOrderSide(this.safeString(orderInfo, 'side')),
                'price': this.safeString(orderInfo, 'price'),
                'stopPrice': undefined,
                'triggerPrice': undefined,
                'amount': this.safeString(orderInfo, 'size'),
                'cost': undefined,
                'average': this.safeString(orderInfo, 'deal_avg_price'),
                'filled': this.safeString(orderInfo, 'deal_size'),
                'remaining': undefined,
                'status': this.parseWsOrderStatus(this.safeString(order, 'action')),
                'fee': undefined,
                'trades': trades,
            }, market);
        }
    }
    parseWsOrderStatus(statusId) {
        const statuses = {
            '1': 'closed',
            '2': 'open',
            '3': 'canceled',
            '4': 'closed',
            '5': 'canceled',
            '6': 'open',
            '7': 'open',
            '8': 'closed',
            '9': 'closed', // active adl match deal
        };
        return this.safeString(statuses, statusId, statusId);
    }
    parseWsOrderSide(sideId) {
        const sides = {
            '1': 'buy',
            '2': 'buy',
            '3': 'sell',
            '4': 'sell', // sell_open_short
        };
        return this.safeString(sides, sideId, sideId);
    }
    async watchPositions(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitmart#watchPositions
         * @see https://developer-pro.bitmart.com/en/futures/#private-position-channel
         * @description watch all open positions
         * @param {string[]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        await this.loadMarkets();
        const type = 'swap';
        await this.authenticate(type, params);
        symbols = this.marketSymbols(symbols, 'swap', true, true, false);
        let messageHash = 'positions';
        if (symbols !== undefined) {
            messageHash += '::' + symbols.join(',');
        }
        const subscriptionHash = 'futures/position';
        const request = {
            'action': 'subscribe',
            'args': ['futures/position'],
        };
        const url = this.implodeHostname(this.urls['api']['ws'][type]['private']);
        const newPositions = await this.watch(url, messageHash, this.deepExtend(request, params), subscriptionHash);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit(this.positions, symbols, since, limit);
    }
    handlePositions(client, message) {
        //
        //    {
        //        "group":"futures/position",
        //        "data":[
        //           {
        //              "symbol":"LTCUSDT",
        //              "hold_volume":"5",
        //              "position_type":2,
        //              "open_type":2,
        //              "frozen_volume":"0",
        //              "close_volume":"0",
        //              "hold_avg_price":"71.582",
        //              "close_avg_price":"0",
        //              "open_avg_price":"71.582",
        //              "liquidate_price":"0",
        //              "create_time":1701623327513,
        //              "update_time":1701627620439
        //           },
        //           {
        //              "symbol":"LTCUSDT",
        //              "hold_volume":"6",
        //              "position_type":1,
        //              "open_type":2,
        //              "frozen_volume":"0",
        //              "close_volume":"0",
        //              "hold_avg_price":"71.681666666666666667",
        //              "close_avg_price":"0",
        //              "open_avg_price":"71.681666666666666667",
        //              "liquidate_price":"0",
        //              "create_time":1701621167225,
        //              "update_time":1701628152614
        //           }
        //        ]
        //    }
        //
        const data = this.safeValue(message, 'data', []);
        const cache = this.positions;
        if (this.positions === undefined) {
            this.positions = new Cache.ArrayCacheBySymbolBySide();
        }
        const newPositions = [];
        for (let i = 0; i < data.length; i++) {
            const rawPosition = data[i];
            const position = this.parseWsPosition(rawPosition);
            newPositions.push(position);
            cache.append(position);
        }
        const messageHashes = this.findMessageHashes(client, 'positions::');
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const parts = messageHash.split('::');
            const symbolsString = parts[1];
            const symbols = symbolsString.split(',');
            const positions = this.filterByArray(newPositions, 'symbol', symbols, false);
            if (!this.isEmpty(positions)) {
                client.resolve(positions, messageHash);
            }
        }
        client.resolve(newPositions, 'positions');
    }
    parseWsPosition(position, market = undefined) {
        //
        //    {
        //       "symbol":"LTCUSDT",
        //       "hold_volume":"6",
        //       "position_type":1,
        //       "open_type":2,
        //       "frozen_volume":"0",
        //       "close_volume":"0",
        //       "hold_avg_price":"71.681666666666666667",
        //       "close_avg_price":"0",
        //       "open_avg_price":"71.681666666666666667",
        //       "liquidate_price":"0",
        //       "create_time":1701621167225,
        //       "update_time":1701628152614
        //    }
        //
        const marketId = this.safeString(position, 'symbol');
        market = this.safeMarket(marketId, market, undefined, 'swap');
        const symbol = market['symbol'];
        const openTimestamp = this.safeInteger(position, 'create_time');
        const timestamp = this.safeInteger(position, 'update_time');
        const side = this.safeNumber(position, 'position_type');
        const marginModeId = this.safeNumber(position, 'open_type');
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'timestamp': openTimestamp,
            'datetime': this.iso8601(openTimestamp),
            'lastUpdateTimestamp': timestamp,
            'hedged': undefined,
            'side': (side === 1) ? 'long' : 'short',
            'contracts': this.safeNumber(position, 'hold_volume'),
            'contractSize': this.safeNumber(market, 'contractSize'),
            'entryPrice': this.safeNumber(position, 'open_avg_price'),
            'markPrice': this.safeNumber(position, 'hold_avg_price'),
            'lastPrice': undefined,
            'notional': undefined,
            'leverage': undefined,
            'collateral': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'unrealizedPnl': undefined,
            'realizedPnl': undefined,
            'liquidationPrice': this.safeNumber(position, 'liquidate_price'),
            'marginMode': (marginModeId === 1) ? 'isolated' : 'cross',
            'percentage': undefined,
            'marginRatio': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }
    handleTrade(client, message) {
        //
        // spot
        //    {
        //        "table": "spot/trade",
        //        "data": [
        //            {
        //                "price": "52700.50",
        //                "s_t": 1630982050,
        //                "side": "buy",
        //                "size": "0.00112",
        //                "symbol": "BTC_USDT"
        //            },
        //        ]
        //    }
        //
        // swap
        //    {
        //        "group":"futures/trade:BTCUSDT",
        //        "data":[
        //           {
        //              "trade_id":6798697637,
        //              "contract_id":1,
        //              "symbol":"BTCUSDT",
        //              "deal_price":"39735.8",
        //              "deal_vol":"2",
        //              "type":0,
        //              "way":1,
        //              "create_time":1701618503,
        //              "create_time_mill":1701618503517,
        //              "created_at":"2023-12-03T15:48:23.517518538Z"
        //           }
        //        ]
        //    }
        //
        const channel = this.safeString2(message, 'table', 'group');
        const isSpot = (channel.indexOf('spot') >= 0);
        const data = this.safeValue(message, 'data');
        if (data === undefined) {
            return;
        }
        let stored = undefined;
        for (let i = 0; i < data.length; i++) {
            const trade = this.parseWsTrade(data[i]);
            const symbol = trade['symbol'];
            const tradesLimit = this.safeInteger(this.options, 'tradesLimit', 1000);
            stored = this.safeValue(this.trades, symbol);
            if (stored === undefined) {
                stored = new Cache.ArrayCache(tradesLimit);
                this.trades[symbol] = stored;
            }
            stored.append(trade);
        }
        let messageHash = channel;
        if (isSpot) {
            messageHash += ':' + this.safeString(data[0], 'symbol');
        }
        client.resolve(stored, messageHash);
        return message;
    }
    parseWsTrade(trade, market = undefined) {
        // spot
        //    {
        //        "price": "52700.50",
        //        "s_t": 1630982050,
        //        "side": "buy",
        //        "size": "0.00112",
        //        "symbol": "BTC_USDT"
        //    }
        // swap
        //    {
        //       "trade_id":6798697637,
        //       "contract_id":1,
        //       "symbol":"BTCUSDT",
        //       "deal_price":"39735.8",
        //       "deal_vol":"2",
        //       "type":0,
        //       "way":1,
        //       "create_time":1701618503,
        //       "create_time_mill":1701618503517,
        //       "created_at":"2023-12-03T15:48:23.517518538Z"
        //    }
        //
        const contractId = this.safeString(trade, 'contract_id');
        const marketType = (contractId === undefined) ? 'spot' : 'swap';
        const marketDelimiter = (marketType === 'spot') ? '_' : '';
        const timestamp = this.safeInteger(trade, 'create_time_mill', this.safeTimestamp(trade, 's_t'));
        const marketId = this.safeString(trade, 'symbol');
        return this.safeTrade({
            'info': trade,
            'id': this.safeString(trade, 'trade_id'),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': this.safeSymbol(marketId, market, marketDelimiter, marketType),
            'type': undefined,
            'side': this.safeString(trade, 'side'),
            'price': this.safeString2(trade, 'price', 'deal_price'),
            'amount': this.safeString2(trade, 'size', 'deal_vol'),
            'cost': undefined,
            'takerOrMaker': undefined,
            'fee': undefined,
        }, market);
    }
    handleTicker(client, message) {
        //
        //    {
        //        "data": [
        //            {
        //                "base_volume_24h": "78615593.81",
        //                "high_24h": "52756.97",
        //                "last_price": "52638.31",
        //                "low_24h": "50991.35",
        //                "open_24h": "51692.03",
        //                "s_t": 1630981727,
        //                "symbol": "BTC_USDT"
        //            }
        //        ],
        //        "table": "spot/ticker"
        //    }
        //    {
        //        "group":"futures/ticker",
        //        "data":{
        //              "symbol":"BTCUSDT",
        //              "volume_24":"117387.58",
        //              "fair_price":"146.24",
        //              "last_price":"146.24",
        //              "range":"147.17",
        //              "ask_price": "147.11",
        //              "ask_vol": "1",
        //              "bid_price": "142.11",
        //              "bid_vol": "1"
        //            }
        //    }
        //
        const table = this.safeString(message, 'table');
        const isSpot = (table !== undefined);
        const data = this.safeValue(message, 'data');
        if (data === undefined) {
            return;
        }
        if (isSpot) {
            for (let i = 0; i < data.length; i++) {
                const ticker = this.parseTicker(data[i]);
                const symbol = ticker['symbol'];
                const marketId = this.safeString(ticker['info'], 'symbol');
                const messageHash = table + ':' + marketId;
                this.tickers[symbol] = ticker;
                client.resolve(ticker, messageHash);
                this.resolveMessageHashesForSymbol(client, symbol, ticker, 'tickers::');
            }
        }
        else {
            // on each update for contract markets, single ticker is provided
            const ticker = this.parseWsSwapTicker(data);
            const symbol = this.safeString(ticker, 'symbol');
            this.tickers[symbol] = ticker;
            client.resolve(ticker, 'tickers::swap');
            this.resolveMessageHashesForSymbol(client, symbol, ticker, 'tickers::');
        }
        return message;
    }
    resolveMessageHashesForSymbol(client, symbol, result, prexif) {
        const prefixSeparator = '::';
        const symbolsSeparator = ',';
        const messageHashes = this.findMessageHashes(client, prexif);
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const parts = messageHash.split(prefixSeparator);
            const length = parts.length;
            const symbolsString = parts[length - 1];
            const symbols = symbolsString.split(symbolsSeparator);
            if (this.inArray(symbol, symbols)) {
                const response = {};
                response[symbol] = result;
                client.resolve(response, messageHash);
            }
        }
    }
    parseWsSwapTicker(ticker, market = undefined) {
        //
        //    {
        //        "symbol":"BTCUSDT",
        //        "volume_24":"117387.58",
        //        "fair_price":"146.24",
        //        "last_price":"146.24",
        //        "range":"147.17",
        //        "ask_price": "147.11",
        //        "ask_vol": "1",
        //        "bid_price": "142.11",
        //        "bid_vol": "1"
        //    }
        const marketId = this.safeString(ticker, 'symbol');
        return this.safeTicker({
            'symbol': this.safeSymbol(marketId, market, '', 'swap'),
            'timestamp': undefined,
            'datetime': undefined,
            'high': undefined,
            'low': undefined,
            'bid': this.safeString(ticker, 'bid_price'),
            'bidVolume': this.safeString(ticker, 'bid_vol'),
            'ask': this.safeString(ticker, 'ask_price'),
            'askVolume': this.safeString(ticker, 'ask_vol'),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': this.safeString(ticker, 'last_price'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': this.safeString(ticker, 'fair_price'),
            'baseVolume': undefined,
            'quoteVolume': this.safeString(ticker, 'volume_24'),
            'info': ticker,
        }, market);
    }
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitmart#watchOHLCV
         * @see https://developer-pro.bitmart.com/en/spot/#public-kline-channel
         * @see https://developer-pro.bitmart.com/en/futures/#public-klinebin-channel
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        symbol = this.symbol(symbol);
        const market = this.market(symbol);
        let type = 'spot';
        [type, params] = this.handleMarketTypeAndParams('watchOrderBook', market, params);
        const timeframes = this.safeValue(this.options, 'timeframes', {});
        const interval = this.safeString(timeframes, timeframe);
        let name = undefined;
        if (type === 'spot') {
            name = 'kline' + interval;
        }
        else {
            name = 'klineBin' + interval;
        }
        const ohlcv = await this.subscribe(name, symbol, type, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    handleOHLCV(client, message) {
        //
        //    {
        //        "data": [
        //            {
        //                "candle": [
        //                    1631056350,
        //                    "46532.83",
        //                    "46555.71",
        //                    "46511.41",
        //                    "46555.71",
        //                    "0.25"
        //                ],
        //                "symbol": "BTC_USDT"
        //            }
        //        ],
        //        "table": "spot/kline1m"
        //    }
        // swap
        //    {
        //        "group":"futures/klineBin1m:BTCUSDT",
        //        "data":{
        //           "symbol":"BTCUSDT",
        //           "items":[
        //              {
        //                 "o":"39635.8",
        //                 "h":"39636",
        //                 "l":"39614.4",
        //                 "c":"39629.7",
        //                 "v":"31852",
        //                 "ts":1701617761
        //              }
        //           ]
        //        }
        //    }
        //
        const channel = this.safeString2(message, 'table', 'group');
        const isSpot = (channel.indexOf('spot') >= 0);
        const data = this.safeValue(message, 'data');
        if (data === undefined) {
            return;
        }
        const parts = channel.split('/');
        const part1 = this.safeString(parts, 1, '');
        let interval = part1.replace('kline', '');
        interval = interval.replace('Bin', '');
        const intervalParts = interval.split(':');
        interval = this.safeString(intervalParts, 0);
        // use a reverse lookup in a static map instead
        const timeframes = this.safeValue(this.options, 'timeframes', {});
        const timeframe = this.findTimeframe(interval, timeframes);
        const duration = this.parseTimeframe(timeframe);
        const durationInMs = duration * 1000;
        if (isSpot) {
            for (let i = 0; i < data.length; i++) {
                const marketId = this.safeString(data[i], 'symbol');
                const market = this.safeMarket(marketId);
                const symbol = market['symbol'];
                const rawOHLCV = this.safeValue(data[i], 'candle');
                const parsed = this.parseOHLCV(rawOHLCV, market);
                parsed[0] = this.parseToInt(parsed[0] / durationInMs) * durationInMs;
                this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
                let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
                if (stored === undefined) {
                    const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
                    stored = new Cache.ArrayCacheByTimestamp(limit);
                    this.ohlcvs[symbol][timeframe] = stored;
                }
                stored.append(parsed);
                const messageHash = channel + ':' + marketId;
                client.resolve(stored, messageHash);
            }
        }
        else {
            const marketId = this.safeString(data, 'symbol');
            const market = this.safeMarket(marketId, undefined, undefined, 'swap');
            const symbol = market['symbol'];
            const items = this.safeValue(data, 'items', []);
            this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
            let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
                stored = new Cache.ArrayCacheByTimestamp(limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            for (let i = 0; i < items.length; i++) {
                const candle = items[i];
                const parsed = this.parseOHLCV(candle, market);
                stored.append(parsed);
            }
            client.resolve(stored, channel);
        }
    }
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitmart#watchOrderBook
         * @see https://developer-pro.bitmart.com/en/spot/#public-depth-all-channel
         * @see https://developer-pro.bitmart.com/en/spot/#public-depth-increase-channel
         * @see https://developer-pro.bitmart.com/en/futures/#public-depth-channel
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const options = this.safeValue(this.options, 'watchOrderBook', {});
        let depth = this.safeString(options, 'depth', 'depth/increase100');
        symbol = this.symbol(symbol);
        const market = this.market(symbol);
        let type = 'spot';
        [type, params] = this.handleMarketTypeAndParams('watchOrderBook', market, params);
        if (type === 'swap' && depth === 'depth/increase100') {
            depth = 'depth50';
        }
        const orderbook = await this.subscribe(depth, symbol, type, params);
        return orderbook.limit();
    }
    handleDelta(bookside, delta) {
        const price = this.safeFloat(delta, 0);
        const amount = this.safeFloat(delta, 1);
        bookside.store(price, amount);
    }
    handleDeltas(bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta(bookside, deltas[i]);
        }
    }
    handleOrderBookMessage(client, message, orderbook) {
        //
        //     {
        //         "asks": [
        //             [ '46828.38', "0.21847" ],
        //             [ '46830.68', "0.08232" ],
        //             [ '46832.08', "0.09285" ],
        //             [ '46837.82', "0.02028" ],
        //             [ '46839.43', "0.15068" ]
        //         ],
        //         "bids": [
        //             [ '46820.78', "0.00444" ],
        //             [ '46814.33', "0.00234" ],
        //             [ '46813.50', "0.05021" ],
        //             [ '46808.14', "0.00217" ],
        //             [ '46808.04', "0.00013" ]
        //         ],
        //         "ms_t": 1631044962431,
        //         "symbol": "BTC_USDT"
        //     }
        //
        const asks = this.safeValue(message, 'asks', []);
        const bids = this.safeValue(message, 'bids', []);
        this.handleDeltas(orderbook['asks'], asks);
        this.handleDeltas(orderbook['bids'], bids);
        const timestamp = this.safeInteger(message, 'ms_t');
        const marketId = this.safeString(message, 'symbol');
        const symbol = this.safeSymbol(marketId);
        orderbook['symbol'] = symbol;
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601(timestamp);
        return orderbook;
    }
    handleOrderBook(client, message) {
        //
        // spot depth-all
        //    {
        //        "data": [
        //            {
        //                "asks": [
        //                    [ '46828.38', "0.21847" ],
        //                    [ '46830.68', "0.08232" ],
        //                    ...
        //                ],
        //                "bids": [
        //                    [ '46820.78', "0.00444" ],
        //                    [ '46814.33', "0.00234" ],
        //                    ...
        //                ],
        //                "ms_t": 1631044962431,
        //                "symbol": "BTC_USDT"
        //            }
        //        ],
        //        "table": "spot/depth5"
        //    }
        // spot increse depth snapshot
        //    {
        //        "data":[
        //           {
        //              "asks":[
        //                 [
        //                    "43652.52",
        //                    "0.02039"
        //                 ],
        //                 ...
        //              ],
        //              "bids":[
        //                [
        //                   "43652.51",
        //                   "0.00500"
        //                ],
        //                ...
        //              ],
        //              "ms_t":1703376836487,
        //              "symbol":"BTC_USDT",
        //              "type":"snapshot", // or update
        //              "version":2141731
        //           }
        //        ],
        //        "table":"spot/depth/increase100"
        //    }
        // swap
        //    {
        //        "group":"futures/depth50:BTCUSDT",
        //        "data":{
        //           "symbol":"BTCUSDT",
        //           "way":1,
        //           "depths":[
        //              {
        //                 "price":"39509.8",
        //                 "vol":"2379"
        //              },
        //              {
        //                 "price":"39509.6",
        //                 "vol":"6815"
        //              },
        //              ...
        //           ],
        //           "ms_t":1701566021194
        //        }
        //    }
        //
        const data = this.safeValue(message, 'data');
        if (data === undefined) {
            return;
        }
        const depths = this.safeValue(data, 'depths');
        const isSpot = (depths === undefined);
        const table = this.safeString2(message, 'table', 'group');
        // find limit subscribed to
        const limitsToCheck = ['100', '50', '20', '10', '5'];
        let limit = 0;
        for (let i = 0; i < limitsToCheck.length; i++) {
            const limitString = limitsToCheck[i];
            if (table.indexOf(limitString) >= 0) {
                limit = this.parseToInt(limitString);
                break;
            }
        }
        if (isSpot) {
            for (let i = 0; i < data.length; i++) {
                const update = data[i];
                const marketId = this.safeString(update, 'symbol');
                const symbol = this.safeSymbol(marketId);
                let orderbook = this.safeValue(this.orderbooks, symbol);
                if (orderbook === undefined) {
                    orderbook = this.orderBook({}, limit);
                    orderbook['symbol'] = symbol;
                    this.orderbooks[symbol] = orderbook;
                }
                const type = this.safeValue(update, 'type');
                if ((type === 'snapshot') || (!(table.indexOf('increase') >= 0))) {
                    orderbook.reset({});
                }
                this.handleOrderBookMessage(client, update, orderbook);
                const timestamp = this.safeInteger(update, 'ms_t');
                orderbook['timestamp'] = timestamp;
                orderbook['datetime'] = this.iso8601(timestamp);
                const messageHash = table + ':' + marketId;
                client.resolve(orderbook, messageHash);
            }
        }
        else {
            const marketId = this.safeString(data, 'symbol');
            const symbol = this.safeSymbol(marketId);
            let orderbook = this.safeValue(this.orderbooks, symbol);
            if (orderbook === undefined) {
                orderbook = this.orderBook({}, limit);
                orderbook['symbol'] = symbol;
                this.orderbooks[symbol] = orderbook;
            }
            const way = this.safeNumber(data, 'way');
            const side = (way === 1) ? 'bids' : 'asks';
            if (way === 1) {
                orderbook[side] = new OrderBookSide.Bids([], limit);
            }
            else {
                orderbook[side] = new OrderBookSide.Asks([], limit);
            }
            for (let i = 0; i < depths.length; i++) {
                const depth = depths[i];
                const price = this.safeNumber(depth, 'price');
                const amount = this.safeNumber(depth, 'vol');
                const orderbookSide = this.safeValue(orderbook, side);
                orderbookSide.store(price, amount);
            }
            const bidsLength = orderbook['bids'].length;
            const asksLength = orderbook['asks'].length;
            if ((bidsLength === 0) || (asksLength === 0)) {
                return;
            }
            const timestamp = this.safeInteger(data, 'ms_t');
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601(timestamp);
            const messageHash = table;
            client.resolve(orderbook, messageHash);
        }
    }
    async authenticate(type, params = {}) {
        this.checkRequiredCredentials();
        const url = this.implodeHostname(this.urls['api']['ws'][type]['private']);
        const messageHash = 'authenticated';
        const client = this.client(url);
        const future = client.future(messageHash);
        const authenticated = this.safeValue(client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const timestamp = this.milliseconds().toString();
            const memo = this.uid;
            const path = 'bitmart.WebSocket';
            const auth = timestamp + '#' + memo + '#' + path;
            const signature = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256);
            let request = undefined;
            if (type === 'spot') {
                request = {
                    'op': 'login',
                    'args': [
                        this.apiKey,
                        timestamp,
                        signature,
                    ],
                };
            }
            else {
                request = {
                    'action': 'access',
                    'args': [
                        this.apiKey,
                        timestamp,
                        signature,
                        'web',
                    ],
                };
            }
            const message = this.extend(request, params);
            this.watch(url, messageHash, message, messageHash);
        }
        return future;
    }
    handleSubscriptionStatus(client, message) {
        //
        //    {"event":"subscribe","channel":"spot/depth:BTC-USDT"}
        //
        return message;
    }
    handleAuthenticate(client, message) {
        //
        // spot
        //    { event: "login" }
        // swap
        //    { action: 'access', success: true }
        //
        const messageHash = 'authenticated';
        const future = this.safeValue(client.futures, messageHash);
        future.resolve(true);
    }
    handleErrorMessage(client, message) {
        //
        //    { event: "error", message: "Invalid sign", errorCode: 30013 }
        //    {"event":"error","message":"Unrecognized request: {\"event\":\"subscribe\",\"channel\":\"spot/depth:BTC-USDT\"}","errorCode":30039}
        //    {
        //        action: '',
        //        group: 'futures/trade:BTCUSDT',
        //        success: false,
        //        request: { action: '', args: [ 'futures/trade:BTCUSDT' ] },
        //        error: 'Invalid action [] for group [futures/trade:BTCUSDT]'
        //    }
        //
        const errorCode = this.safeString(message, 'errorCode');
        const error = this.safeString(message, 'error');
        try {
            if (errorCode !== undefined || error !== undefined) {
                const feedback = this.id + ' ' + this.json(message);
                this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
                const messageString = this.safeValue(message, 'message', error);
                this.throwBroadlyMatchedException(this.exceptions['broad'], messageString, feedback);
                const action = this.safeString(message, 'action');
                if (action === 'access') {
                    throw new errors.AuthenticationError(feedback);
                }
                throw new errors.ExchangeError(feedback);
            }
            return false;
        }
        catch (e) {
            if ((e instanceof errors.AuthenticationError)) {
                const messageHash = 'authenticated';
                client.reject(e, messageHash);
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
            }
            client.reject(e);
            return true;
        }
    }
    handleMessage(client, message) {
        if (this.handleErrorMessage(client, message)) {
            return;
        }
        //
        //     {"event":"error","message":"Unrecognized request: {\"event\":\"subscribe\",\"channel\":\"spot/depth:BTC-USDT\"}","errorCode":30039}
        //     {"event":"subscribe","channel":"spot/depth:BTC-USDT"}
        //     {
        //         "table": "spot/depth",
        //         "action": "partial",
        //         "data": [
        //             {
        //                 "instrument_id":   "BTC-USDT",
        //                 "asks": [
        //                     ["5301.8", "0.03763319", "1"],
        //                     ["5302.4", "0.00305", "2"],
        //                 ],
        //                 "bids": [
        //                     ["5301.7", "0.58911427", "6"],
        //                     ["5301.6", "0.01222922", "4"],
        //                 ],
        //                 "timestamp": "2020-03-16T03:25:00.440Z",
        //                 "checksum": -2088736623
        //             }
        //         ]
        //     }
        //
        //     { data: '', table: "spot/user/order" }
        //
        const channel = this.safeString2(message, 'table', 'group');
        if (channel === undefined) {
            const event = this.safeString2(message, 'event', 'action');
            if (event !== undefined) {
                const methods = {
                    // 'info': this.handleSystemStatus,
                    'login': this.handleAuthenticate,
                    'access': this.handleAuthenticate,
                    'subscribe': this.handleSubscriptionStatus,
                };
                const method = this.safeValue(methods, event);
                if (method === undefined) {
                    return message;
                }
                else {
                    return method.call(this, client, message);
                }
            }
        }
        else {
            const methods = {
                'depth': this.handleOrderBook,
                'ticker': this.handleTicker,
                'trade': this.handleTrade,
                'kline': this.handleOHLCV,
                'order': this.handleOrders,
                'position': this.handlePositions,
                'balance': this.handleBalance,
                'asset': this.handleBalance,
            };
            const keys = Object.keys(methods);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (channel.indexOf(key) >= 0) {
                    const method = this.safeValue(methods, key);
                    return method.call(this, client, message);
                }
            }
        }
    }
}

module.exports = bitmart;
