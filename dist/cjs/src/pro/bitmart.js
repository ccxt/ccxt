'use strict';

var bitmart$1 = require('../bitmart.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');
var sha256 = require('../static_dependencies/noble-hashes/sha256.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class bitmart extends bitmart$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTrades': true,
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://ws-manager-compress.{hostname}/api?protocol=1.1',
                        'private': 'wss://ws-manager-compress.{hostname}/user?protocol=1.1',
                    },
                },
            },
            'options': {
                'defaultType': 'spot',
                'watchOrderBook': {
                    'depth': 'depth5', // depth5, depth20, depth50
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
    async subscribe(channel, symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const url = this.implodeHostname(this.urls['api']['ws']['public']);
        const messageHash = market['type'] + '/' + channel + ':' + market['id'];
        const request = {
            'op': 'subscribe',
            'args': [messageHash],
        };
        return await this.watch(url, messageHash, this.deepExtend(request, params), messageHash);
    }
    async subscribePrivate(channel, symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const url = this.implodeHostname(this.urls['api']['ws']['private']);
        const messageHash = channel + ':' + market['id'];
        await this.authenticate();
        const request = {
            'op': 'subscribe',
            'args': [messageHash],
        };
        return await this.watch(url, messageHash, this.deepExtend(request, params), messageHash);
    }
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitmart#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bitmart api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets();
        symbol = this.symbol(symbol);
        const trades = await this.subscribe('trade', symbol, params);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    async watchTicker(symbol, params = {}) {
        /**
         * @method
         * @name bitmart#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bitmart api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        return await this.subscribe('ticker', symbol, params);
    }
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitmart#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bitmart api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' watchOrders requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        if (market['type'] !== 'spot') {
            throw new errors.ArgumentsRequired(this.id + ' watchOrders supports spot markets only');
        }
        const channel = 'spot/user/order';
        const orders = await this.subscribePrivate(channel, symbol, params);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit);
    }
    handleOrders(client, message) {
        //
        // {
        //     "data":[
        //         {
        //             symbol: 'LTC_USDT',
        //             notional: '',
        //             side: 'buy',
        //             last_fill_time: '0',
        //             ms_t: '1646216634000',
        //             type: 'limit',
        //             filled_notional: '0.000000000000000000000000000000',
        //             last_fill_price: '0',
        //             size: '0.500000000000000000000000000000',
        //             price: '50.000000000000000000000000000000',
        //             last_fill_count: '0',
        //             filled_size: '0.000000000000000000000000000000',
        //             margin_trading: '0',
        //             state: '8',
        //             order_id: '24807076628',
        //             order_type: '0'
        //           }
        //     ],
        //     "table":"spot/user/order"
        // }
        //
        const channel = this.safeString(message, 'table');
        const orders = this.safeValue(message, 'data', []);
        const ordersLength = orders.length;
        if (ordersLength > 0) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            if (this.orders === undefined) {
                this.orders = new Cache.ArrayCacheBySymbolById(limit);
            }
            const stored = this.orders;
            const marketIds = [];
            for (let i = 0; i < orders.length; i++) {
                const order = this.parseWsOrder(orders[i]);
                stored.append(order);
                const symbol = order['symbol'];
                const market = this.market(symbol);
                marketIds.push(market['id']);
            }
            for (let i = 0; i < marketIds.length; i++) {
                const messageHash = channel + ':' + marketIds[i];
                client.resolve(this.orders, messageHash);
            }
        }
    }
    parseWsOrder(order, market = undefined) {
        //
        // {
        //     symbol: 'LTC_USDT',
        //     notional: '',
        //     side: 'buy',
        //     last_fill_time: '0',
        //     ms_t: '1646216634000',
        //     type: 'limit',
        //     filled_notional: '0.000000000000000000000000000000',
        //     last_fill_price: '0',
        //     size: '0.500000000000000000000000000000',
        //     price: '50.000000000000000000000000000000',
        //     last_fill_count: '0',
        //     filled_size: '0.000000000000000000000000000000',
        //     margin_trading: '0',
        //     state: '8',
        //     order_id: '24807076628',
        //     order_type: '0'
        //   }
        //
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market);
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
    handleTrade(client, message) {
        //
        //     {
        //         table: 'spot/trade',
        //         data: [
        //             {
        //                 price: '52700.50',
        //                 s_t: 1630982050,
        //                 side: 'buy',
        //                 size: '0.00112',
        //                 symbol: 'BTC_USDT'
        //             },
        //         ]
        //     }
        //
        const table = this.safeString(message, 'table');
        const data = this.safeValue(message, 'data', []);
        const tradesLimit = this.safeInteger(this.options, 'tradesLimit', 1000);
        for (let i = 0; i < data.length; i++) {
            const trade = this.parseTrade(data[i]);
            const symbol = trade['symbol'];
            const marketId = this.safeString(trade['info'], 'symbol');
            const messageHash = table + ':' + marketId;
            let stored = this.safeValue(this.trades, symbol);
            if (stored === undefined) {
                stored = new Cache.ArrayCache(tradesLimit);
                this.trades[symbol] = stored;
            }
            stored.append(trade);
            client.resolve(stored, messageHash);
        }
        return message;
    }
    handleTicker(client, message) {
        //
        //     {
        //         data: [
        //             {
        //                 base_volume_24h: '78615593.81',
        //                 high_24h: '52756.97',
        //                 last_price: '52638.31',
        //                 low_24h: '50991.35',
        //                 open_24h: '51692.03',
        //                 s_t: 1630981727,
        //                 symbol: 'BTC_USDT'
        //             }
        //         ],
        //         table: 'spot/ticker'
        //     }
        //
        const table = this.safeString(message, 'table');
        const data = this.safeValue(message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const ticker = this.parseTicker(data[i]);
            const symbol = ticker['symbol'];
            const marketId = this.safeString(ticker['info'], 'symbol');
            const messageHash = table + ':' + marketId;
            this.tickers[symbol] = ticker;
            client.resolve(ticker, messageHash);
        }
        return message;
    }
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitmart#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bitmart api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        symbol = this.symbol(symbol);
        const timeframes = this.safeValue(this.options, 'timeframes', {});
        const interval = this.safeString(timeframes, timeframe);
        const name = 'kline' + interval;
        const ohlcv = await this.subscribe(name, symbol, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    handleOHLCV(client, message) {
        //
        //     {
        //         data: [
        //             {
        //                 candle: [
        //                     1631056350,
        //                     '46532.83',
        //                     '46555.71',
        //                     '46511.41',
        //                     '46555.71',
        //                     '0.25'
        //                 ],
        //                 symbol: 'BTC_USDT'
        //             }
        //         ],
        //         table: 'spot/kline1m'
        //     }
        //
        const table = this.safeString(message, 'table');
        const data = this.safeValue(message, 'data', []);
        const parts = table.split('/');
        const part1 = this.safeString(parts, 1);
        const interval = part1.replace('kline', '');
        // use a reverse lookup in a static map instead
        const timeframes = this.safeValue(this.options, 'timeframes', {});
        const timeframe = this.findTimeframe(interval, timeframes);
        const duration = this.parseTimeframe(timeframe);
        const durationInMs = duration * 1000;
        for (let i = 0; i < data.length; i++) {
            const marketId = this.safeString(data[i], 'symbol');
            const candle = this.safeValue(data[i], 'candle');
            const market = this.safeMarket(marketId);
            const symbol = market['symbol'];
            const parsed = this.parseOHLCV(candle, market);
            parsed[0] = this.parseToInt(parsed[0] / durationInMs) * durationInMs;
            this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
            let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
                stored = new Cache.ArrayCacheByTimestamp(limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            stored.append(parsed);
            const messageHash = table + ':' + marketId;
            client.resolve(stored, messageHash);
        }
    }
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitmart#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bitmart api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        const options = this.safeValue(this.options, 'watchOrderBook', {});
        const depth = this.safeString(options, 'depth', 'depth50');
        const orderbook = await this.subscribe(depth, symbol, params);
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
        //         asks: [
        //             [ '46828.38', '0.21847' ],
        //             [ '46830.68', '0.08232' ],
        //             [ '46832.08', '0.09285' ],
        //             [ '46837.82', '0.02028' ],
        //             [ '46839.43', '0.15068' ]
        //         ],
        //         bids: [
        //             [ '46820.78', '0.00444' ],
        //             [ '46814.33', '0.00234' ],
        //             [ '46813.50', '0.05021' ],
        //             [ '46808.14', '0.00217' ],
        //             [ '46808.04', '0.00013' ]
        //         ],
        //         ms_t: 1631044962431,
        //         symbol: 'BTC_USDT'
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
        //     {
        //         data: [
        //             {
        //                 asks: [
        //                     [ '46828.38', '0.21847' ],
        //                     [ '46830.68', '0.08232' ],
        //                     [ '46832.08', '0.09285' ],
        //                     [ '46837.82', '0.02028' ],
        //                     [ '46839.43', '0.15068' ]
        //                 ],
        //                 bids: [
        //                     [ '46820.78', '0.00444' ],
        //                     [ '46814.33', '0.00234' ],
        //                     [ '46813.50', '0.05021' ],
        //                     [ '46808.14', '0.00217' ],
        //                     [ '46808.04', '0.00013' ]
        //                 ],
        //                 ms_t: 1631044962431,
        //                 symbol: 'BTC_USDT'
        //             }
        //         ],
        //         table: 'spot/depth5'
        //     }
        //
        const data = this.safeValue(message, 'data', []);
        const table = this.safeString(message, 'table');
        const parts = table.split('/');
        const lastPart = this.safeString(parts, 1);
        const limitString = lastPart.replace('depth', '');
        const limit = parseInt(limitString);
        for (let i = 0; i < data.length; i++) {
            const update = data[i];
            const marketId = this.safeString(update, 'symbol');
            const symbol = this.safeSymbol(marketId);
            let orderbook = this.safeValue(this.orderbooks, symbol);
            if (orderbook === undefined) {
                orderbook = this.orderBook({}, limit);
                this.orderbooks[symbol] = orderbook;
            }
            orderbook.reset({});
            this.handleOrderBookMessage(client, update, orderbook);
            const messageHash = table + ':' + marketId;
            client.resolve(orderbook, messageHash);
        }
        return message;
    }
    authenticate(params = {}) {
        this.checkRequiredCredentials();
        const url = this.implodeHostname(this.urls['api']['ws']['private']);
        const messageHash = 'authenticated';
        const client = this.client(url);
        let future = this.safeValue(client.subscriptions, messageHash);
        if (future === undefined) {
            const timestamp = this.milliseconds().toString();
            const memo = this.uid;
            const path = 'bitmart.WebSocket';
            const auth = timestamp + '#' + memo + '#' + path;
            const signature = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256);
            const operation = 'login';
            const request = {
                'op': operation,
                'args': [
                    this.apiKey,
                    timestamp,
                    signature,
                ],
            };
            const message = this.extend(request, params);
            future = this.watch(url, messageHash, message);
            client.subscriptions[messageHash] = future;
        }
        return future;
    }
    handleSubscriptionStatus(client, message) {
        //
        //     {"event":"subscribe","channel":"spot/depth:BTC-USDT"}
        //
        return message;
    }
    handleAuthenticate(client, message) {
        //
        //     { event: 'login' }
        //
        const messageHash = 'authenticated';
        client.resolve(message, messageHash);
    }
    handleErrorMessage(client, message) {
        //
        //     { event: 'error', message: 'Invalid sign', errorCode: 30013 }
        //     {"event":"error","message":"Unrecognized request: {\"event\":\"subscribe\",\"channel\":\"spot/depth:BTC-USDT\"}","errorCode":30039}
        //
        const errorCode = this.safeString(message, 'errorCode');
        try {
            if (errorCode !== undefined) {
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
        //         table: "spot/depth",
        //         action: "partial",
        //         data: [
        //             {
        //                 instrument_id:   "BTC-USDT",
        //                 asks: [
        //                     ["5301.8", "0.03763319", "1"],
        //                     ["5302.4", "0.00305", "2"],
        //                 ],
        //                 bids: [
        //                     ["5301.7", "0.58911427", "6"],
        //                     ["5301.6", "0.01222922", "4"],
        //                 ],
        //                 timestamp: "2020-03-16T03:25:00.440Z",
        //                 checksum: -2088736623
        //             }
        //         ]
        //     }
        //
        //     { data: '', table: 'spot/user/order' }
        //
        const table = this.safeString(message, 'table');
        if (table === undefined) {
            const event = this.safeString(message, 'event');
            if (event !== undefined) {
                const methods = {
                    // 'info': this.handleSystemStatus,
                    // 'book': 'handleOrderBook',
                    'login': this.handleAuthenticate,
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
            const parts = table.split('/');
            const name = this.safeString(parts, 1);
            const methods = {
                'depth': this.handleOrderBook,
                'depth5': this.handleOrderBook,
                'depth20': this.handleOrderBook,
                'depth50': this.handleOrderBook,
                'ticker': this.handleTicker,
                'trade': this.handleTrade,
                // ...
            };
            let method = this.safeValue(methods, name);
            if (name.indexOf('kline') >= 0) {
                method = this.handleOHLCV;
            }
            const privateName = this.safeString(parts, 2);
            if (privateName === 'order') {
                method = this.handleOrders;
            }
            if (method === undefined) {
                return message;
            }
            else {
                return method.call(this, client, message);
            }
        }
    }
}

module.exports = bitmart;
