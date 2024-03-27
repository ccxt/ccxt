'use strict';

var p2b$1 = require('../p2b.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class p2b extends p2b$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'cancelAllOrdersWs': false,
                'cancelOrdersWs': false,
                'cancelOrderWs': false,
                'createOrderWs': false,
                'editOrderWs': false,
                'fetchBalanceWs': false,
                'fetchOpenOrdersWs': false,
                'fetchOrderWs': false,
                'fetchTradesWs': false,
                'watchBalance': false,
                'watchMyTrades': false,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': false,
                // 'watchStatus': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://apiws.p2pb2b.com/',
                },
            },
            'options': {
                'OHLCVLimit': 1000,
                'tradesLimit': 1000,
                'timeframes': {
                    '15m': 900,
                    '30m': 1800,
                    '1h': 3600,
                    '1d': 86400,
                },
                'watchTicker': {
                    'name': 'state', // or 'price'
                },
                'watchTickers': {
                    'name': 'state', // or 'price'
                },
                'tickerSubs': this.createSafeDictionary(),
            },
            'streaming': {
                'ping': this.ping,
            },
        });
    }
    async subscribe(name, messageHash, request, params = {}) {
        /**
         * @ignore
         * @method
         * @description Connects to a websocket channel
         * @param {string} name name of the channel
         * @param {string} messageHash string to look up in handler
         * @param {string[]|float[]} request endpoint parameters
         * @param {object} [params] extra parameters specific to the p2b api
         * @returns {object} data from the websocket stream
         */
        const url = this.urls['api']['ws'];
        const subscribe = {
            'method': name,
            'params': request,
            'id': this.milliseconds(),
        };
        const query = this.extend(subscribe, params);
        return await this.watch(url, messageHash, query, messageHash);
    }
    async watchOHLCV(symbol, timeframe = '15m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name p2b#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market. Can only subscribe to one timeframe at a time for each symbol
         * @see https://github.com/P2B-team/P2B-WSS-Public/blob/main/wss_documentation.md#kline-candlestick
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe 15m, 30m, 1h or 1d
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const timeframes = this.safeValue(this.options, 'timeframes', {});
        const channel = this.safeInteger(timeframes, timeframe);
        if (channel === undefined) {
            throw new errors.BadRequest(this.id + ' watchOHLCV cannot take a timeframe of ' + timeframe);
        }
        const market = this.market(symbol);
        const request = [
            market['id'],
            channel,
        ];
        const messageHash = 'kline::' + market['symbol'];
        const ohlcv = await this.subscribe('kline.subscribe', messageHash, request, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    async watchTicker(symbol, params = {}) {
        /**
         * @method
         * @name p2b#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://github.com/P2B-team/P2B-WSS-Public/blob/main/wss_documentation.md#last-price
         * @see https://github.com/P2B-team/P2B-WSS-Public/blob/main/wss_documentation.md#market-status
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {object} [params.method] 'state' (default) or 'price'
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const watchTickerOptions = this.safeDict(this.options, 'watchTicker');
        let name = this.safeString(watchTickerOptions, 'name', 'state'); // or price
        [name, params] = this.handleOptionAndParams(params, 'method', 'name', name);
        const market = this.market(symbol);
        symbol = market['symbol'];
        this.options['tickerSubs'][market['id']] = true; // we need to re-subscribe to all tickers upon watching a new ticker
        const tickerSubs = this.options['tickerSubs'];
        const request = Object.keys(tickerSubs);
        const messageHash = name + '::' + market['symbol'];
        return await this.subscribe(name + '.subscribe', messageHash, request, params);
    }
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name p2b#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://github.com/P2B-team/P2B-WSS-Public/blob/main/wss_documentation.md#deals
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = [
            market['id'],
        ];
        const messageHash = 'deals::' + market['symbol'];
        const trades = await this.subscribe('deals.subscribe', messageHash, request, params);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name p2b#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://github.com/P2B-team/P2B-WSS-Public/blob/main/wss_documentation.md#depth-of-market
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] 1-100, default=100
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.interval] 0, 0.00000001, 0.0000001, 0.000001, 0.00001, 0.0001, 0.001, 0.01, 0.1, interval of precision for order, default=0.001
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const name = 'depth.subscribe';
        const messageHash = 'orderbook::' + market['symbol'];
        const interval = this.safeString(params, 'interval', '0.001');
        if (limit === undefined) {
            limit = 100;
        }
        const request = [
            market['id'],
            limit,
            interval,
        ];
        const orderbook = await this.subscribe(name, messageHash, request, params);
        return orderbook.limit();
    }
    handleOHLCV(client, message) {
        //
        //    {
        //        "method": "kline.update",
        //        "params": [
        //            [
        //                1657648800,             // Kline start time
        //                "0.054146",             // Kline open price
        //                "0.053938",             // Kline close price (current price)
        //                "0.054146",             // Kline high price
        //                "0.053911",             // Kline low price
        //                "596.4674",             // Volume for stock currency
        //                "32.2298758767",        // Volume for money currency
        //                "ETH_BTC"               // Market
        //            ]
        //        ],
        //        "id": null
        //    }
        //
        let data = this.safeList(message, 'params');
        data = this.safeList(data, 0);
        const method = this.safeString(message, 'method');
        const splitMethod = method.split('.');
        const channel = this.safeString(splitMethod, 0);
        const marketId = this.safeString(data, 7);
        const market = this.safeMarket(marketId);
        const timeframes = this.safeDict(this.options, 'timeframes', {});
        const timeframe = this.findTimeframe(channel, timeframes);
        const symbol = this.safeString(market, 'symbol');
        const messageHash = channel + '::' + symbol;
        const parsed = this.parseOHLCV(data, market);
        this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
        let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
        if (symbol !== undefined) {
            if (stored === undefined) {
                const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
                stored = new Cache.ArrayCacheByTimestamp(limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            stored.append(parsed);
            client.resolve(stored, messageHash);
        }
        return message;
    }
    handleTrade(client, message) {
        //
        //    {
        //        "method": "deals.update",
        //        "params": [
        //            "ETH_BTC",
        //            [
        //                {
        //                    "id": 4503032979,               // Order_id
        //                    "amount": "0.103",
        //                    "type": "sell",                 // Side
        //                    "time": 1657661950.8487639,     // Creation time
        //                    "price": "0.05361"
        //                },
        //                ...
        //            ]
        //        ],
        //        "id": null
        //    }
        //
        const data = this.safeList(message, 'params', []);
        const trades = this.safeList(data, 1);
        const marketId = this.safeString(data, 0);
        const market = this.safeMarket(marketId);
        const symbol = this.safeString(market, 'symbol');
        let tradesArray = this.safeValue(this.trades, symbol);
        if (tradesArray === undefined) {
            const tradesLimit = this.safeInteger(this.options, 'tradesLimit', 1000);
            tradesArray = new Cache.ArrayCache(tradesLimit);
            this.trades[symbol] = tradesArray;
        }
        for (let i = 0; i < trades.length; i++) {
            const item = trades[i];
            const trade = this.parseTrade(item, market);
            tradesArray.append(trade);
        }
        const messageHash = 'deals::' + symbol;
        client.resolve(tradesArray, messageHash);
        return message;
    }
    handleTicker(client, message) {
        //
        // state
        //
        //    {
        //        "method": "state.update",
        //        "params": [
        //            "ETH_BTC",
        //            {
        //                "high": "0.055774",         // High price for the last 24h
        //                "close": "0.053679",        // Close price for the last 24h
        //                "low": "0.053462",          // Low price for the last 24h
        //                "period": 86400,            // Period 24h
        //                "last": "0.053679",         // Last price for the last 24h
        //                "volume": "38463.6132",     // Stock volume for the last 24h
        //                "open": "0.055682",         // Open price for the last 24h
        //                "deal": "2091.0038055314"   // Money volume for the last 24h
        //            }
        //        ],
        //        "id": null
        //    }
        //
        // price
        //
        //    {
        //        "method": "price.update",
        //        "params": [
        //            "ETH_BTC",      // market
        //            "0.053836"      // last price
        //        ],
        //        "id": null
        //    }
        //
        const data = this.safeList(message, 'params', []);
        const marketId = this.safeString(data, 0);
        const market = this.safeMarket(marketId);
        const method = this.safeString(message, 'method');
        const splitMethod = method.split('.');
        const messageHashStart = this.safeString(splitMethod, 0);
        const tickerData = this.safeDict(data, 1);
        let ticker = undefined;
        if (method === 'price.update') {
            const lastPrice = this.safeString(data, 1);
            ticker = this.safeTicker({
                'last': lastPrice,
                'close': lastPrice,
                'symbol': market['symbol'],
            });
        }
        else {
            ticker = this.parseTicker(tickerData, market);
        }
        const symbol = ticker['symbol'];
        const messageHash = messageHashStart + '::' + symbol;
        client.resolve(ticker, messageHash);
        return message;
    }
    handleOrderBook(client, message) {
        //
        //    {
        //        "method": "depth.update",
        //        "params": [
        //            false,                          // true - all records, false - new records
        //            {
        //                "asks": [                   // side
        //                    [
        //                        "19509.81",         // price
        //                        "0.277"             // amount
        //                    ]
        //                ]
        //            },
        //            "BTC_USDT"
        //        ],
        //        "id": null
        //    }
        //
        const params = this.safeList(message, 'params', []);
        const data = this.safeDict(params, 1);
        const asks = this.safeList(data, 'asks');
        const bids = this.safeList(data, 'bids');
        const marketId = this.safeString(params, 2);
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const messageHash = 'orderbook::' + market['symbol'];
        const subscription = this.safeValue(client.subscriptions, messageHash, {});
        const limit = this.safeInteger(subscription, 'limit');
        let orderbook = this.safeValue(this.orderbooks, symbol);
        if (orderbook === undefined) {
            this.orderbooks[symbol] = this.orderBook({}, limit);
            orderbook = this.orderbooks[symbol];
        }
        if (bids !== undefined) {
            for (let i = 0; i < bids.length; i++) {
                const bid = this.safeValue(bids, i);
                const price = this.safeNumber(bid, 0);
                const amount = this.safeNumber(bid, 1);
                const bookSide = orderbook['bids'];
                bookSide.store(price, amount);
            }
        }
        if (asks !== undefined) {
            for (let i = 0; i < asks.length; i++) {
                const ask = this.safeValue(asks, i);
                const price = this.safeNumber(ask, 0);
                const amount = this.safeNumber(ask, 1);
                const bookside = orderbook['asks'];
                bookside.store(price, amount);
            }
        }
        orderbook['symbol'] = symbol;
        client.resolve(orderbook, messageHash);
    }
    handleMessage(client, message) {
        if (this.handleErrorMessage(client, message)) {
            return;
        }
        const result = this.safeString(message, 'result');
        if (result === 'pong') {
            this.handlePong(client, message);
            return;
        }
        const method = this.safeString(message, 'method');
        const methods = {
            'depth.update': this.handleOrderBook,
            'price.update': this.handleTicker,
            'kline.update': this.handleOHLCV,
            'state.update': this.handleTicker,
            'deals.update': this.handleTrade,
        };
        const endpoint = this.safeValue(methods, method);
        if (endpoint !== undefined) {
            endpoint.call(this, client, message);
        }
    }
    handleErrorMessage(client, message) {
        const error = this.safeString(message, 'error');
        if (error !== undefined) {
            throw new errors.ExchangeError(this.id + ' error: ' + this.json(error));
        }
        return false;
    }
    ping(client) {
        /**
         * @see https://github.com/P2B-team/P2B-WSS-Public/blob/main/wss_documentation.md#ping
         * @param client
         */
        return {
            'method': 'server.ping',
            'params': [],
            'id': this.milliseconds(),
        };
    }
    handlePong(client, message) {
        //
        //    {
        //        error: null,
        //        result: 'pong',
        //        id: 1706539608030
        //    }
        //
        client.lastPong = this.safeInteger(message, 'id');
        return message;
    }
    onError(client, error) {
        this.options['tickerSubs'] = this.createSafeDictionary();
        this.onError(client, error);
    }
    onClose(client, error) {
        this.options['tickerSubs'] = this.createSafeDictionary();
        this.onClose(client, error);
    }
}

module.exports = p2b;
