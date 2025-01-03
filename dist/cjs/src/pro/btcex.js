'use strict';

var btcex$1 = require('../btcex.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class btcex extends btcex$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchTrades': true,
                'watchMyTrades': true,
                'watchOrders': true,
                'watchOrderBook': true,
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://api.btcex.com/ws/api/v1',
                },
            },
            'options': {
                'watchOrderBook': {
                    'snapshotDelay': 0,
                    'maxRetries': 3,
                },
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 5000,
            },
            'exceptions': {},
            'timeframes': {
                '1m': '1',
                '3m': '3',
                '5m': '4',
                '10m': '10',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '3h': '180',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': '1D',
            },
        });
    }
    requestId() {
        const requestId = this.sum(this.safeInteger(this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId.toString();
    }
    async watchBalance(params = {}) {
        /**
         * @method
         * @name btcex#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://docs.btcex.com/#user-asset-asset_type
         * @param {object} params extra parameters specific to the btcex api endpoint
         * @param {string} params.type asset type WALLET, BTC,ETH,MARGIN,SPOT,PERPETUAL
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        const token = await this.authenticate(params);
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('watchBalance', undefined, params);
        const types = this.safeValue(this.options, 'accountsByType', {});
        const assetType = this.safeString(types, type, type);
        params = this.omit(params, 'type');
        const messageHash = 'balancess';
        const url = this.urls['api']['ws'];
        const subscribe = {
            'jsonrpc': '2.0',
            'id': this.requestId(),
            'method': '/private/subscribe',
            'params': {
                'access_token': token,
                'channels': [
                    'user.asset.' + assetType,
                ],
            },
        };
        const request = this.deepExtend(subscribe, params);
        return await this.watch(url, messageHash, request, messageHash, request);
    }
    handleBalance(client, message) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "user.asset.WALLET",
        //             "data": {
        //                 "WALLET": {
        //                     "total": "5578184962",
        //                     "coupon": "0",
        //                     "details": [
        //                         {
        //                             "available": "4999",
        //                             "freeze": "0",
        //                             "coin_type": "BTC",
        //                             "current_mark_price": "38000"
        //                         },
        //                         ...
        //                     ]
        //                 }
        //             }
        //         }
        //     }
        //
        const params = this.safeValue(message, 'params', {});
        const data = this.safeValue(params, 'data', {});
        const messageHash = 'balancess';
        this.balance = this.parseBalance(data);
        client.resolve(this.balance, messageHash);
    }
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name btcex#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market.
         * @see https://docs.btcex.com/#chart-trades-instrument_name-resolution
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents.
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        let instrumentName = market['id'];
        if (market['spot']) {
            instrumentName = market['baseId'] + '-' + market['quoteId'];
        }
        const interval = this.safeString(this.timeframes, timeframe, timeframe);
        const messageHash = 'ohlcv:' + symbol + ':' + interval;
        let request = {
            'jsonrpc': '2.0',
            'id': this.requestId(),
            'method': '/public/subscribe',
            'params': {
                'channels': [
                    'chart.trades.' + instrumentName + '.' + interval,
                ],
            },
        };
        request = this.deepExtend(request, params);
        const url = this.urls['api']['ws'];
        const ohlcv = await this.watch(url, messageHash, request, messageHash, request);
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    handleOHLCV(client, message) {
        //
        //     {
        //         "params": {
        //             "data": {
        //                 "tick": "1660095420",
        //                 "open": "22890.30000000",
        //                 "high": "22890.50000000",
        //                 "low": "22886.50000000",
        //                 "close": "22886.50000000",
        //                 "volume": "314.46800000",
        //                 "cost": "7197974.01690000"
        //             },
        //             "channel": "chart.trades.BTC-USDT-PERPETUAL.1"
        //         },
        //         "method": "subscription",
        //         "jsonrpc": "2.0"
        //     }
        //
        const params = this.safeValue(message, 'params');
        const channel = this.safeString(params, 'channel');
        const symbolInterval = channel.slice(13);
        const dotIndex = symbolInterval.indexOf('.');
        const marketId = symbolInterval.slice(0, dotIndex);
        const timeframeId = symbolInterval.slice(dotIndex + 1);
        const timeframe = this.findTimeframe(timeframeId);
        const symbol = this.safeSymbol(marketId, undefined, '-');
        const messageHash = 'ohlcv:' + symbol + ':' + timeframeId;
        const data = this.safeValue(params, 'data', {});
        const ohlcv = this.parseOHLCV(data);
        this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
        let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            stored = new Cache.ArrayCacheByTimestamp(limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        stored.append(ohlcv);
        client.resolve(stored, messageHash);
    }
    async watchTicker(symbol, params = {}) {
        /**
         * @method
         * @name btcex#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.btcex.com/#ticker-instrument_name-interval
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the btcex api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        let instrumentName = market['id'];
        if (market['spot']) {
            instrumentName = market['baseId'] + '-' + market['quoteId'];
        }
        const url = this.urls['api']['ws'];
        const messageHash = 'ticker:' + symbol;
        let request = {
            'jsonrpc': '2.0',
            'id': this.requestId(),
            'method': '/public/subscribe',
            'params': {
                'channels': [
                    'ticker.' + instrumentName + '.raw',
                ],
            },
        };
        request = this.deepExtend(request, params);
        return await this.watch(url, messageHash, request, messageHash);
    }
    handleTicker(client, message) {
        //
        //     {
        //         "params": {
        //             "data": {
        //                 "timestamp": "1660094543813",
        //                 "stats": {
        //                     "volume": "630219.70300000000008822",
        //                     "price_change": "-0.0378",
        //                     "low": "22659.50000000",
        //                     "turnover": "14648416962.26930706016719341",
        //                     "high": "23919.00000000"
        //                 },
        //                 "state": "open",
        //                 "last_price": "22890.00000000",
        //                 "instrument_name": "BTC-USDT-PERPETUAL",
        //                 "best_bid_price": "22888.60000000",
        //                 "best_bid_amount": "33.38500000",
        //                 "best_ask_price": "22889.40000000",
        //                 "best_ask_amount": "5.45200000",
        //                 "mark_price": "22890.5",
        //                 "underlying_price": "22891",
        //                 "open_interest": "33886.083"
        //             },
        //             "channel": "ticker.BTC-USDT-PERPETUAL.raw"
        //         },
        //         "method": "subscription",
        //         "jsonrpc": "2.0"
        //     }
        //
        const params = this.safeValue(message, 'params');
        const data = this.safeValue(params, 'data');
        const ticker = this.parseTicker(data);
        const symbol = this.safeString(ticker, 'symbol');
        const messageHash = 'ticker:' + symbol;
        this.tickers[symbol] = ticker;
        client.resolve(ticker, messageHash);
    }
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name btcex#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.btcex.com/#trades-instrument_name-interval
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of    trades to fetch
         * @param {object} params extra parameters specific to the btcex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws'];
        const messageHash = 'trades:' + symbol;
        let request = {
            'jsonrpc': '2.0',
            'id': this.requestId(),
            'method': '/public/subscribe',
            'params': {
                'channels': [
                    'trades.' + market['id'] + '.raw',
                ],
            },
        };
        request = this.deepExtend(request, params);
        const trades = await this.watch(url, messageHash, request, messageHash, request);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleTrades(client, message) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "trades.BTC-USDT-PERPETUAL.raw",
        //             "data": [{
        //                 "timestamp": "1660093462553",
        //                 "price": "22815.9",
        //                 "amount": "4.479",
        //                 "iv": "0",
        //                 "direction": "sell",
        //                 "instrument_name": "BTC-USDT-PERPETUAL",
        //                 "trade_id": "227976617",
        //                 "mark_price": "22812.7"
        //             }]
        //         }
        //     }
        //
        const params = this.safeValue(message, 'params', {});
        const fullChannel = this.safeString(params, 'channel');
        const parts = fullChannel.split('.');
        const marketId = parts[1];
        const symbol = this.safeSymbol(marketId);
        const messageHash = 'trades:' + symbol;
        let stored = this.safeValue(this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            stored = new Cache.ArrayCache(limit);
            this.trades[symbol] = stored;
        }
        const rawTrades = this.safeValue(params, 'data', []);
        for (let i = 0; i < rawTrades.length; i++) {
            const rawTrade = rawTrades[i];
            const trade = this.parseTrade(rawTrade, undefined);
            stored.append(trade);
        }
        this.trades[symbol] = stored;
        client.resolve(stored, messageHash);
    }
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bibox#fetchMyTrades
         * @description watch all trades made by the user
         * @see https://docs.btcex.com/#user-trades-instrument_name-interval
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the bibox api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' watchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets();
        const token = await this.authenticate();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws'];
        const messageHash = 'myTrades:' + symbol;
        const request = {
            'jsonrpc': '2.0',
            'id': this.requestId(),
            'method': '/private/subscribe',
            'params': {
                'access_token': token,
                'channels': [
                    'user.trades.' + market['id'] + '.raw',
                ],
            },
        };
        const trades = await this.watch(url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit, true);
    }
    handleMyTrades(client, message) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "user.trades.BTC-14AUG20.raw",
        //             "data": [{
        //                 "direction": "sell",
        //                 "amount": "1",
        //                 "price": "33000",
        //                 "iv": "0",
        //                 "fee": "0",
        //                 "timestamp": 1626148488157,
        //                 "trade_id": "1",
        //                 "order_id": "160717710099746816",
        //                 "instrument_name": "BTC-24SEP21",
        //                 "order_type": "limit",
        //                 "fee_coin_type": "USDT",
        //                 "index_price": "33157.63"
        //             }]
        //         }
        //     }
        //
        const params = this.safeValue(message, 'params', {});
        const channel = this.safeString(params, 'channel', '');
        const endIndex = channel.indexOf('.raw');
        const marketId = channel.slice(12, endIndex);
        const symbol = this.safeSymbol(marketId, undefined, '-');
        const rawTrades = this.safeValue(params, 'data', []);
        let stored = this.myTrades;
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            stored = new Cache.ArrayCacheBySymbolById(limit);
        }
        for (let i = 0; i < rawTrades.length; i++) {
            const rawTrade = rawTrades[i];
            const trade = this.parseTrade(rawTrade);
            stored.append(trade);
        }
        this.myTrades = stored;
        const messageHash = 'myTrades:' + symbol;
        client.resolve(stored, messageHash);
    }
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name btcex#fetchOrders
         * @description watches information on multiple orders made by the user
         * @see https://docs.btcex.com/#user-changes-kind-currency-interval
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the btcex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + 'watchesOrders() requires a symbol');
        }
        await this.loadMarkets();
        const token = await this.authenticate();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws'];
        const message = {
            'jsonrpc': '2.0',
            'id': this.requestId(),
            'method': '/private/subscribe',
            'params': {
                'access_token': token,
                'channels': [
                    'user.orders.' + market['id'] + '.raw',
                ],
            },
        };
        const messageHash = 'orders:' + symbol;
        const request = this.deepExtend(message, params);
        const orders = await this.watch(url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit);
    }
    handleOrder(client, message) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "user.orders.BTC-14AUG20.raw",
        //             "data": {
        //                 "amount": "1",
        //                 "price": "11895.00",
        //                 "direction": "buy",
        //                 "version": 0,
        //                 "order_state": "filled",
        //                 "instrument_name": "BTC-14AUG20",
        //                 "time_in_force": "good_til_cancelled",
        //                 "last_update_timestamp": 1597130534567,
        //                 "filled_amount": "1",
        //                 "average_price": "11770.00",
        //                 "order_id": "39007591615041536",
        //                 "creation_timestamp": 1597130534567,
        //                 "order_type": "limit"
        //             }
        //     }
        //
        const params = this.safeValue(message, 'params', {});
        const rawOrder = this.safeValue(params, 'data', {});
        let cachedOrders = this.orders;
        if (cachedOrders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            cachedOrders = new Cache.ArrayCacheBySymbolById(limit);
        }
        const order = this.parseOrder(rawOrder);
        const symbol = this.safeString(order, 'symbol');
        const messageHash = 'orders:' + symbol;
        cachedOrders.append(order);
        this.orders = cachedOrders;
        client.resolve(this.orders, messageHash);
    }
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name btcex#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.btcex.com/#book-instrument_name-interval
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {objectConstructor} params extra parameters specific to the btcex api endpoint
         * @param {string|undefined} params.type accepts l2 or l3 for level 2 or level 3 order book
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        let instrumentName = market['id'];
        if (market['spot']) {
            instrumentName = market['baseId'] + '-' + market['quoteId'];
        }
        const url = this.urls['api']['ws'];
        params = this.omit(params, 'type');
        const messageHash = 'orderbook:' + symbol;
        const subscribe = {
            'jsonrpc': '2.0',
            'id': this.requestId(),
            'method': '/public/subscribe',
            'params': {
                'channels': [
                    'book.' + instrumentName + '.raw',
                ],
            },
        };
        const request = this.deepExtend(subscribe, params);
        const orderbook = await this.watch(url, messageHash, request, messageHash);
        return orderbook.limit();
    }
    handleOrderBook(client, message) {
        //
        //     {
        //         "params": {
        //             "data": {
        //                 "timestamp": 1626056933600,
        //                 "change_id": 1566764,
        //                 "asks": [
        //                     [
        //                         "new",
        //                         "34227.122",
        //                         "0.00554"
        //                     ],
        //                     ...
        //                 ],
        //                 "bids": [
        //                     [
        //                         "delete",
        //                         "34105.540",
        //                         "0"
        //                     ],
        //                     ...
        //                 ],
        //                 "instrument_name": "BTC-USDT"
        //             },
        //             "channel": "book.BTC-USDT.raw"
        //         },
        //         "method": "subscription",
        //         "jsonrpc": "2.0"
        //     }
        // `
        const params = this.safeValue(message, 'params');
        const data = this.safeValue(params, 'data');
        const marketId = this.safeString(data, 'instrument_name');
        const symbol = this.safeSymbol(marketId, undefined, '-');
        const storedOrderBook = this.safeValue(this.orderbooks, symbol);
        const nonce = this.safeInteger(storedOrderBook, 'nonce');
        const deltaNonce = this.safeInteger(data, 'change_id');
        const messageHash = 'orderbook:' + symbol;
        if (nonce === undefined) {
            const cacheLength = storedOrderBook.cache.length;
            const snapshotDelay = this.handleOption('watchOrderBook', 'snapshotDelay', 0);
            if (cacheLength === snapshotDelay) {
                const limit = 0;
                this.spawn(this.loadOrderBook, client, messageHash, symbol, limit);
            }
            storedOrderBook.cache.push(data);
            return;
        }
        else if (deltaNonce <= nonce) {
            return;
        }
        this.handleDelta(storedOrderBook, data);
        client.resolve(storedOrderBook, messageHash);
    }
    getCacheIndex(orderBook, cache) {
        const firstElement = cache[0];
        let lastChangeId = this.safeInteger(firstElement, 'change_id');
        const nonce = this.safeInteger(orderBook, 'nonce');
        if (nonce < lastChangeId - 1) {
            return -1;
        }
        for (let i = 0; i < cache.length; i++) {
            const delta = cache[i];
            lastChangeId = this.safeInteger(delta, 'change_id');
            if (nonce === lastChangeId - 1) {
                // nonce is inside the cache
                // [ d, d, n, d ]
                return i;
            }
        }
        return cache.length;
    }
    handleDelta(orderbook, delta) {
        const timestamp = this.safeInteger(delta, 'timestamp');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601(timestamp);
        orderbook['nonce'] = this.safeInteger(delta, 'change_id');
        const bids = this.safeValue(delta, 'bids', []);
        const asks = this.safeValue(delta, 'asks', []);
        const storedBids = orderbook['bids'];
        const storedAsks = orderbook['asks'];
        this.handleBidAsks(storedBids, bids);
        this.handleBidAsks(storedAsks, asks);
    }
    handleBidAsks(bookSide, bidAsks) {
        for (let i = 0; i < bidAsks.length; i++) {
            const bidAsk = this.parseBidAsk(bidAsks[i], 1, 2);
            bookSide.storeArray(bidAsk);
        }
    }
    handleUser(client, message) {
        const params = this.safeValue(message, 'params');
        const fullChannel = this.safeString(params, 'channel');
        const sliceUser = fullChannel.slice(5);
        const endIndex = sliceUser.indexOf('.');
        const userChannel = sliceUser.slice(0, endIndex);
        const handlers = {
            'asset': this.handleBalance,
            'orders': this.handleOrder,
            'trades': this.handleMyTrades,
        };
        const handler = this.safeValue(handlers, userChannel);
        if (handler !== undefined) {
            return handler.call(this, client, message);
        }
        throw new errors.NotSupported(this.id + ' received an unsupported message: ' + this.json(message));
    }
    handleErrorMessage(client, message) {
        //
        //     {
        //         id: '1',
        //         jsonrpc: '2.0',
        //         usIn: 1660140064049,
        //         usOut: 1660140064051,
        //         usDiff: 2,
        //         error: { code: 10000, message: 'Authentication Failure' }
        //     }
        //
        const error = this.safeValue(message, 'error', {});
        throw new errors.ExchangeError(this.id + ' error: ' + this.json(error));
    }
    handleAuthenticate(client, message) {
        //
        //     {
        //         id: '1',
        //         jsonrpc: '2.0',
        //         usIn: 1660140846671,
        //         usOut: 1660140846688,
        //         usDiff: 17,
        //         result: {
        //           access_token: 'xxxxxx43jIXYrF3VSm90ar+f5n447M3ll82AiFO58L85pxb/DbVf6Bn4ZyBX1i1tM/KYFBJ234ZkrUkwImUIEu8vY1PBh5JqaaaaaeGnao=',
        //           token_type: 'bearer',
        //           refresh_token: '/I56sUOB/zwpwo8X8Q0Z234bW8Lz1YNlXOXSP6C+ZJDWR+49CjVPr0Z3PVXoL3BOB234WxXtTid+YmNjQ8OqGn1MM9pQL5TKZ97s49SvaRc=',
        //           expires_in: 604014,
        //           scope: 'account:read_write block_trade:read_write trade:read_write wallet:read_write',
        //           m: '00000000006e446c6b44694759735570786e5668387335431274546e633867474d647772717a463924a6d3746756951334b637459653970576d63693143e6e335972584e48594c74674c4d416872564a4d56424c347438737938736f4645747263315374454e73324e546d346e5651792b69696279336647347737413d3d'
        //         }
        //     }
        //
        const result = this.safeValue(message, 'result', {});
        const expiresIn = this.safeInteger(result, 'expires_in', 0);
        this.options['expiresAt'] = this.sum(this.seconds(), expiresIn) * 1000;
        const accessToken = this.safeString(result, 'access_token');
        client.resolve(accessToken, 'authenticated');
    }
    handleSubscription(client, message) {
        const channels = this.safeValue(message, 'result', []);
        for (let i = 0; i < channels.length; i++) {
            const fullChannel = channels[i];
            const parts = fullChannel.split('.');
            const channel = this.safeString(parts, 0);
            const marketId = this.safeString(parts, 1);
            if (channel === 'book') {
                const symbol = this.safeSymbol(marketId, undefined, '-');
                this.orderbooks[symbol] = this.orderBook({});
                // get full depth book
            }
        }
    }
    handlePong(client, message) {
        client.lastPong = this.milliseconds();
    }
    handleMessage(client, message) {
        if (message === 'PONG') {
            this.handlePong(client, message);
            return;
        }
        const error = this.safeValue(message, 'error');
        if (error !== undefined) {
            return this.handleErrorMessage(client, message);
        }
        const result = this.safeValue(message, 'result', {});
        const accessToken = this.safeString(result, 'access_token');
        if (accessToken !== undefined) {
            return this.handleAuthenticate(client, message);
        }
        const method = this.safeString(message, 'method');
        if (method === 'subscription') {
            const params = this.safeValue(message, 'params');
            const fullChannel = this.safeString(params, 'channel');
            const parts = fullChannel.split('.');
            const channel = this.safeString(parts, 0);
            const handlers = {
                'ticker': this.handleTicker,
                'trades': this.handleTrades,
                'chart': this.handleOHLCV,
                'balances': this.handleBalance,
                'trading': this.handleOrder,
                'user': this.handleUser,
                'book': this.handleOrderBook,
            };
            const handler = this.safeValue(handlers, channel);
            if (handler !== undefined) {
                return handler.call(this, client, message);
            }
        }
        else if ('result' in message) {
            this.handleSubscription(client, message);
        }
        return message;
    }
    authenticate(params = {}) {
        const url = this.urls['api']['ws'];
        const client = this.client(url);
        const messageHash = 'authenticated';
        const expiresAt = this.safeNumber(this.options, 'expiresAt');
        const time = this.milliseconds();
        let future = this.safeValue(client.subscriptions, messageHash);
        if ((future === undefined) || (expiresAt <= time)) {
            const request = {
                'jsonrpc': '2.0',
                'id': this.requestId(),
                'method': '/public/auth',
                'params': {
                    'grant_type': 'client_credentials',
                    'client_id': this.apiKey,
                    'client_secret': this.secret,
                },
            };
            const message = this.extend(request, params);
            future = this.watch(url, messageHash, message);
            client.subscriptions[messageHash] = future;
        }
        return future;
    }
    ping(client) {
        return 'PING';
    }
}

module.exports = btcex;
