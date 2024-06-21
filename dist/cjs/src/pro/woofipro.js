'use strict';

var woofipro$1 = require('../woofipro.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');
var Precise = require('../base/Precise.js');
var crypto = require('../base/functions/crypto.js');
var ed25519 = require('../static_dependencies/noble-curves/ed25519.js');

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
class woofipro extends woofipro$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchPositions': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://ws-evm.orderly.org/ws/stream',
                        'private': 'wss://ws-private-evm.orderly.org/v2/ws/private/stream',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://testnet-ws-evm.orderly.org/ws/stream',
                        'private': 'wss://testnet-ws-private-evm.orderly.org/v2/ws/private/stream',
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'accountId': true,
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'requestId': {},
                'watchPositions': {
                    'fetchPositionsSnapshot': true,
                    'awaitPositionsSnapshot': true, // whether to wait for the positions snapshot before providing updates
                },
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 10000,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        'Auth is needed.': errors.AuthenticationError,
                    },
                },
            },
        });
    }
    requestId(url) {
        const options = this.safeDict(this.options, 'requestId', {});
        const previousValue = this.safeInteger(options, url, 0);
        const newValue = this.sum(previousValue, 1);
        this.options['requestId'][url] = newValue;
        return newValue;
    }
    async watchPublic(messageHash, message) {
        // the default id
        let id = 'OqdphuyCtYWxwzhxyLLjOWNdFP7sQt8RPWzmb5xY';
        if (this.accountId !== undefined) {
            id = this.accountId;
        }
        const url = this.urls['api']['ws']['public'] + '/' + id;
        const requestId = this.requestId(url);
        const subscribe = {
            'id': requestId,
        };
        const request = this.extend(subscribe, message);
        return await this.watch(url, messageHash, request, messageHash, subscribe);
    }
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name woofipro#watchOrderBook
         * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/public/orderbook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return.
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const name = 'orderbook';
        const market = this.market(symbol);
        const topic = market['id'] + '@' + name;
        const request = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend(request, params);
        const orderbook = await this.watchPublic(topic, message);
        return orderbook.limit();
    }
    handleOrderBook(client, message) {
        //
        //     {
        //         "topic": "PERP_BTC_USDC@orderbook",
        //         "ts": 1650121915308,
        //         "data": {
        //             "symbol": "PERP_BTC_USDC",
        //             "bids": [
        //                 [
        //                     0.30891,
        //                     2469.98
        //                 ]
        //             ],
        //             "asks": [
        //                 [
        //                     0.31075,
        //                     2379.63
        //                 ]
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict(message, 'data', {});
        const marketId = this.safeString(data, 'symbol');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const topic = this.safeString(message, 'topic');
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook();
        }
        const orderbook = this.orderbooks[symbol];
        const timestamp = this.safeInteger(message, 'ts');
        const snapshot = this.parseOrderBook(data, symbol, timestamp, 'bids', 'asks');
        orderbook.reset(snapshot);
        client.resolve(orderbook, topic);
    }
    async watchTicker(symbol, params = {}) {
        /**
         * @method
         * @name woofipro#watchTicker
         * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/public/24-hour-ticker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const name = 'ticker';
        const market = this.market(symbol);
        symbol = market['symbol'];
        const topic = market['id'] + '@' + name;
        const request = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend(request, params);
        return await this.watchPublic(topic, message);
    }
    parseWsTicker(ticker, market = undefined) {
        //
        //     {
        //         "symbol": "PERP_BTC_USDC",
        //         "open": 19441.5,
        //         "close": 20147.07,
        //         "high": 20761.87,
        //         "low": 19320.54,
        //         "volume": 2481.103,
        //         "amount": 50037935.0286,
        //         "count": 3689
        //     }
        //
        return this.safeTicker({
            'symbol': this.safeSymbol(undefined, market),
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString(ticker, 'high'),
            'low': this.safeString(ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString(ticker, 'open'),
            'close': this.safeString(ticker, 'close'),
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString(ticker, 'volume'),
            'quoteVolume': this.safeString(ticker, 'amount'),
            'info': ticker,
        }, market);
    }
    handleTicker(client, message) {
        //
        //     {
        //         "topic": "PERP_BTC_USDC@ticker",
        //         "ts": 1657120017000,
        //         "data": {
        //             "symbol": "PERP_BTC_USDC",
        //             "open": 19441.5,
        //             "close": 20147.07,
        //             "high": 20761.87,
        //             "low": 19320.54,
        //             "volume": 2481.103,
        //             "amount": 50037935.0286,
        //             "count": 3689
        //         }
        //     }
        //
        const data = this.safeDict(message, 'data', {});
        const topic = this.safeString(message, 'topic');
        const marketId = this.safeString(data, 'symbol');
        const market = this.safeMarket(marketId);
        const timestamp = this.safeInteger(message, 'ts');
        data['date'] = timestamp;
        const ticker = this.parseWsTicker(data, market);
        ticker['symbol'] = market['symbol'];
        this.tickers[market['symbol']] = ticker;
        client.resolve(ticker, topic);
        return message;
    }
    async watchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name woofipro#watchTickers
         * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/public/24-hour-tickers
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
         * @param {string[]} symbols unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const name = 'tickers';
        const topic = name;
        const request = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend(request, params);
        const tickers = await this.watchPublic(topic, message);
        return this.filterByArray(tickers, 'symbol', symbols);
    }
    handleTickers(client, message) {
        //
        //     {
        //         "topic":"tickers",
        //         "ts":1618820615000,
        //         "data":[
        //             {
        //                 "symbol":"PERP_NEAR_USDC",
        //                 "open":16.297,
        //                 "close":17.183,
        //                 "high":24.707,
        //                 "low":11.997,
        //                 "volume":0,
        //                 "amount":0,
        //                 "count":0
        //             },
        //         ...
        //         ]
        //     }
        //
        const topic = this.safeString(message, 'topic');
        const data = this.safeList(message, 'data', []);
        const timestamp = this.safeInteger(message, 'ts');
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const marketId = this.safeString(data[i], 'symbol');
            const market = this.safeMarket(marketId);
            const ticker = this.parseWsTicker(this.extend(data[i], { 'date': timestamp }), market);
            this.tickers[market['symbol']] = ticker;
            result.push(ticker);
        }
        client.resolve(result, topic);
    }
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woofipro#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/public/k-line
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        if ((timeframe !== '1m') && (timeframe !== '5m') && (timeframe !== '15m') && (timeframe !== '30m') && (timeframe !== '1h') && (timeframe !== '1d') && (timeframe !== '1w') && (timeframe !== '1M')) {
            throw new errors.NotSupported(this.id + ' watchOHLCV timeframe argument must be 1m, 5m, 15m, 30m, 1h, 1d, 1w, 1M');
        }
        const market = this.market(symbol);
        const interval = this.safeString(this.timeframes, timeframe, timeframe);
        const name = 'kline';
        const topic = market['id'] + '@' + name + '_' + interval;
        const request = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend(request, params);
        const ohlcv = await this.watchPublic(topic, message);
        if (this.newUpdates) {
            limit = ohlcv.getLimit(market['symbol'], limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    handleOHLCV(client, message) {
        //
        //     {
        //         "topic":"PERP_BTC_USDC@kline_1m",
        //         "ts":1618822432146,
        //         "data":{
        //             "symbol":"PERP_BTC_USDC",
        //             "type":"1m",
        //             "open":56948.97,
        //             "close":56891.76,
        //             "high":56948.97,
        //             "low":56889.06,
        //             "volume":44.00947568,
        //             "amount":2504584.9,
        //             "startTime":1618822380000,
        //             "endTime":1618822440000
        //         }
        //     }
        //
        const data = this.safeDict(message, 'data', {});
        const topic = this.safeString(message, 'topic');
        const marketId = this.safeString(data, 'symbol');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const interval = this.safeString(data, 'type');
        const timeframe = this.findTimeframe(interval);
        const parsed = [
            this.safeInteger(data, 'startTime'),
            this.safeNumber(data, 'open'),
            this.safeNumber(data, 'high'),
            this.safeNumber(data, 'low'),
            this.safeNumber(data, 'close'),
            this.safeNumber(data, 'volume'),
        ];
        this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
        let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            stored = new Cache.ArrayCacheByTimestamp(limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const ohlcvCache = this.ohlcvs[symbol][timeframe];
        ohlcvCache.append(parsed);
        client.resolve(ohlcvCache, topic);
    }
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woofipro#watchTrades
         * @description watches information on multiple trades made in a market
         * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/public/trade
         * @param {string} symbol unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const topic = market['id'] + '@trade';
        const request = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend(request, params);
        const trades = await this.watchPublic(topic, message);
        if (this.newUpdates) {
            limit = trades.getLimit(market['symbol'], limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit, true);
    }
    handleTrade(client, message) {
        //
        // {
        //     "topic":"PERP_ADA_USDC@trade",
        //     "ts":1618820361552,
        //     "data":{
        //         "symbol":"PERP_ADA_USDC",
        //         "price":1.27988,
        //         "size":300,
        //         "side":"BUY",
        //     }
        // }
        //
        const topic = this.safeString(message, 'topic');
        const timestamp = this.safeInteger(message, 'ts');
        const data = this.safeDict(message, 'data', {});
        const marketId = this.safeString(data, 'symbol');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const trade = this.parseWsTrade(this.extend(data, { 'timestamp': timestamp }), market);
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            const stored = new Cache.ArrayCache(limit);
            this.trades[symbol] = stored;
        }
        const trades = this.trades[symbol];
        trades.append(trade);
        this.trades[symbol] = trades;
        client.resolve(trades, topic);
    }
    parseWsTrade(trade, market = undefined) {
        //
        //     {
        //         "symbol":"PERP_ADA_USDC",
        //         "timestamp":1618820361552,
        //         "price":1.27988,
        //         "size":300,
        //         "side":"BUY",
        //     }
        // private stream
        //     {
        //         symbol: 'PERP_XRP_USDC',
        //         clientOrderId: '',
        //         orderId: 1167632251,
        //         type: 'MARKET',
        //         side: 'BUY',
        //         quantity: 20,
        //         price: 0,
        //         tradeId: '1715179456664012',
        //         executedPrice: 0.5276,
        //         executedQuantity: 20,
        //         fee: 0.006332,
        //         feeAsset: 'USDC',
        //         totalExecutedQuantity: 20,
        //         avgPrice: 0.5276,
        //         averageExecutedPrice: 0.5276,
        //         status: 'FILLED',
        //         reason: '',
        //         totalFee: 0.006332,
        //         visible: 0,
        //         visibleQuantity: 0,
        //         timestamp: 1715179456660,
        //         orderTag: 'CCXT',
        //         createdTime: 1715179456656,
        //         maker: false
        //     }
        //
        const marketId = this.safeString(trade, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString2(trade, 'executedPrice', 'price');
        const amount = this.safeString2(trade, 'executedQuantity', 'size');
        const cost = Precise["default"].stringMul(price, amount);
        const side = this.safeStringLower(trade, 'side');
        const timestamp = this.safeInteger(trade, 'timestamp');
        let takerOrMaker = undefined;
        const maker = this.safeBool(trade, 'maker');
        if (maker !== undefined) {
            takerOrMaker = maker ? 'maker' : 'taker';
        }
        let fee = undefined;
        const feeValue = this.safeString(trade, 'fee');
        if (feeValue !== undefined) {
            fee = {
                'cost': feeValue,
                'currency': this.safeCurrencyCode(this.safeString(trade, 'feeAsset')),
            };
        }
        return this.safeTrade({
            'id': this.safeString(trade, 'tradeId'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'order': this.safeString(trade, 'orderId'),
            'takerOrMaker': takerOrMaker,
            'type': this.safeStringLower(trade, 'type'),
            'fee': fee,
            'info': trade,
        }, market);
    }
    handleAuth(client, message) {
        //
        //     {
        //         "event": "auth",
        //         "success": true,
        //         "ts": 1657463158812
        //     }
        //
        const messageHash = 'authenticated';
        const success = this.safeValue(message, 'success');
        if (success) {
            // client.resolve (message, messageHash);
            const future = this.safeValue(client.futures, 'authenticated');
            future.resolve(true);
        }
        else {
            const error = new errors.AuthenticationError(this.json(message));
            client.reject(error, messageHash);
            // allows further authentication attempts
            if (messageHash in client.subscriptions) {
                delete client.subscriptions['authenticated'];
            }
        }
    }
    async authenticate(params = {}) {
        this.checkRequiredCredentials();
        const url = this.urls['api']['ws']['private'] + '/' + this.accountId;
        const client = this.client(url);
        const messageHash = 'authenticated';
        const event = 'auth';
        const future = client.future(messageHash);
        const authenticated = this.safeValue(client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const ts = this.nonce().toString();
            const auth = ts;
            let secret = this.secret;
            if (secret.indexOf('ed25519:') >= 0) {
                const parts = secret.split('ed25519:');
                secret = parts[1];
            }
            const signature = crypto.eddsa(this.encode(auth), this.base58ToBinary(secret), ed25519.ed25519);
            const request = {
                'event': event,
                'params': {
                    'orderly_key': this.apiKey,
                    'sign': signature,
                    'timestamp': ts,
                },
            };
            const message = this.extend(request, params);
            this.watch(url, messageHash, message, messageHash);
        }
        return await future;
    }
    async watchPrivate(messageHash, message, params = {}) {
        await this.authenticate(params);
        const url = this.urls['api']['ws']['private'] + '/' + this.accountId;
        const requestId = this.requestId(url);
        const subscribe = {
            'id': requestId,
        };
        const request = this.extend(subscribe, message);
        return await this.watch(url, messageHash, request, messageHash, subscribe);
    }
    async watchPrivateMultiple(messageHashes, message, params = {}) {
        await this.authenticate(params);
        const url = this.urls['api']['ws']['private'] + '/' + this.accountId;
        const requestId = this.requestId(url);
        const subscribe = {
            'id': requestId,
        };
        const request = this.extend(subscribe, message);
        return await this.watchMultiple(url, messageHashes, request, messageHashes, subscribe);
    }
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woofipro#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/private/execution-report
         * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/private/algo-execution-report
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.trigger] true if trigger order
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const trigger = this.safeBool2(params, 'stop', 'trigger', false);
        const topic = (trigger) ? 'algoexecutionreport' : 'executionreport';
        params = this.omit(params, ['stop', 'trigger']);
        let messageHash = topic;
        if (symbol !== undefined) {
            const market = this.market(symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
        }
        const request = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend(request, params);
        const orders = await this.watchPrivate(messageHash, message);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woofipro#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/private/execution-report
         * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/private/algo-execution-report
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.trigger] true if trigger order
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const trigger = this.safeBool2(params, 'stop', 'trigger', false);
        const topic = (trigger) ? 'algoexecutionreport' : 'executionreport';
        params = this.omit(params, 'stop');
        let messageHash = 'myTrades';
        if (symbol !== undefined) {
            const market = this.market(symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
        }
        const request = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend(request, params);
        const orders = await this.watchPrivate(messageHash, message);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    parseWsOrder(order, market = undefined) {
        //
        //     {
        //         "symbol": "PERP_BTC_USDT",
        //         "clientOrderId": 0,
        //         "orderId": 52952826,
        //         "type": "LIMIT",
        //         "side": "SELL",
        //         "quantity": 0.01,
        //         "price": 22000,
        //         "tradeId": 0,
        //         "executedPrice": 0,
        //         "executedQuantity": 0,
        //         "fee": 0,
        //         "feeAsset": "USDT",
        //         "totalExecutedQuantity": 0,
        //         "status": "NEW",
        //         "reason": '',
        //         "orderTag": "default",
        //         "totalFee": 0,
        //         "visible": 0.01,
        //         "timestamp": 1657515556799,
        //         "reduceOnly": false,
        //         "maker": false
        //     }
        // algo order
        //     {
        //         "symbol":"PERP_MATIC_USDC",
        //         "rootAlgoOrderId":123,
        //         "parentAlgoOrderId":123,
        //         "algoOrderId":123,
        //         "orderTag":"some tags",
        //         "algoType": "STOP",
        //         "clientOrderId":"client_id",
        //         "type":"LIMIT",
        //         "side":"BUY",
        //         "quantity":7029.0,
        //         "price":0.7699,
        //         "tradeId":0,
        //         "triggerTradePrice":0,
        //         "triggerTime":1234567,
        //         "triggered": false,
        //         "activated": false,
        //         "executedPrice":0.0,
        //         "executedQuantity":0.0,
        //         "fee":0.0,
        //         "feeAsset":"USDC",
        //         "totalExecutedQuantity":0.0,
        //         "averageExecutedQuantity":0.0,
        //         "avgPrice":0,
        //         "triggerPrice":0.0,
        //         "triggerPriceType":"STOP",
        //         "isActivated": false,
        //         "status":"NEW",
        //         "rootAlgoStatus": "FILLED",
        //         "algoStatus": "FILLED",
        //         "reason":"",
        //         "totalFee":0.0,
        //         "visible": 7029.0,
        //         "visibleQuantity":7029.0,
        //         "timestamp":1704679472448,
        //         "maker":false,
        //         "isMaker":false,
        //         "createdTime":1704679472448
        //     }
        //
        const orderId = this.safeString(order, 'orderId');
        const marketId = this.safeString(order, 'symbol');
        market = this.market(marketId);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger(order, 'timestamp');
        const fee = {
            'cost': this.safeString(order, 'totalFee'),
            'currency': this.safeString(order, 'feeAsset'),
        };
        let price = this.safeNumber(order, 'price');
        const avgPrice = this.safeNumber(order, 'avgPrice');
        if ((price === 0) && (avgPrice !== undefined)) {
            price = avgPrice;
        }
        const amount = this.safeString(order, 'quantity');
        const side = this.safeStringLower(order, 'side');
        const type = this.safeStringLower(order, 'type');
        const filled = this.safeNumber(order, 'totalExecutedQuantity');
        const totalExecQuantity = this.safeString(order, 'totalExecutedQuantity');
        let remaining = amount;
        if (Precise["default"].stringGe(amount, totalExecQuantity)) {
            remaining = Precise["default"].stringSub(remaining, totalExecQuantity);
        }
        const rawStatus = this.safeString(order, 'status');
        const status = this.parseOrderStatus(rawStatus);
        const trades = undefined;
        const clientOrderId = this.safeString(order, 'clientOrderId');
        const triggerPrice = this.safeNumber(order, 'triggerPrice');
        return this.safeOrder({
            'info': order,
            'symbol': symbol,
            'id': orderId,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': timestamp,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': triggerPrice,
            'triggerPrice': triggerPrice,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': trades,
        });
    }
    handleOrderUpdate(client, message) {
        //
        //     {
        //         "topic": "executionreport",
        //         "ts": 1657515556799,
        //         "data": {
        //             "symbol": "PERP_BTC_USDT",
        //             "clientOrderId": 0,
        //             "orderId": 52952826,
        //             "type": "LIMIT",
        //             "side": "SELL",
        //             "quantity": 0.01,
        //             "price": 22000,
        //             "tradeId": 0,
        //             "executedPrice": 0,
        //             "executedQuantity": 0,
        //             "fee": 0,
        //             "feeAsset": "USDT",
        //             "totalExecutedQuantity": 0,
        //             "status": "NEW",
        //             "reason": '',
        //             "orderTag": "default",
        //             "totalFee": 0,
        //             "visible": 0.01,
        //             "timestamp": 1657515556799,
        //             "maker": false
        //         }
        //     }
        //
        const topic = this.safeString(message, 'topic');
        const data = this.safeValue(message, 'data');
        if (Array.isArray(data)) {
            // algoexecutionreport
            for (let i = 0; i < data.length; i++) {
                const order = data[i];
                const tradeId = this.omitZero(this.safeString(data, 'tradeId'));
                if (tradeId !== undefined) {
                    this.handleMyTrade(client, order);
                }
                this.handleOrder(client, order, topic);
            }
        }
        else {
            // executionreport
            const tradeId = this.omitZero(this.safeString(data, 'tradeId'));
            if (tradeId !== undefined) {
                this.handleMyTrade(client, data);
            }
            this.handleOrder(client, data, topic);
        }
    }
    handleOrder(client, message, topic) {
        const parsed = this.parseWsOrder(message);
        const symbol = this.safeString(parsed, 'symbol');
        const orderId = this.safeString(parsed, 'id');
        if (symbol !== undefined) {
            if (this.orders === undefined) {
                const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
                this.orders = new Cache.ArrayCacheBySymbolById(limit);
            }
            const cachedOrders = this.orders;
            const orders = this.safeDict(cachedOrders.hashmap, symbol, {});
            const order = this.safeDict(orders, orderId);
            if (order !== undefined) {
                const fee = this.safeValue(order, 'fee');
                if (fee !== undefined) {
                    parsed['fee'] = fee;
                }
                const fees = this.safeList(order, 'fees');
                if (fees !== undefined) {
                    parsed['fees'] = fees;
                }
                parsed['trades'] = this.safeList(order, 'trades');
                parsed['timestamp'] = this.safeInteger(order, 'timestamp');
                parsed['datetime'] = this.safeString(order, 'datetime');
            }
            cachedOrders.append(parsed);
            client.resolve(this.orders, topic);
            const messageHashSymbol = topic + ':' + symbol;
            client.resolve(this.orders, messageHashSymbol);
        }
    }
    handleMyTrade(client, message) {
        //
        // {
        //     symbol: 'PERP_XRP_USDC',
        //     clientOrderId: '',
        //     orderId: 1167632251,
        //     type: 'MARKET',
        //     side: 'BUY',
        //     quantity: 20,
        //     price: 0,
        //     tradeId: '1715179456664012',
        //     executedPrice: 0.5276,
        //     executedQuantity: 20,
        //     fee: 0.006332,
        //     feeAsset: 'USDC',
        //     totalExecutedQuantity: 20,
        //     avgPrice: 0.5276,
        //     averageExecutedPrice: 0.5276,
        //     status: 'FILLED',
        //     reason: '',
        //     totalFee: 0.006332,
        //     visible: 0,
        //     visibleQuantity: 0,
        //     timestamp: 1715179456660,
        //     orderTag: 'CCXT',
        //     createdTime: 1715179456656,
        //     maker: false
        // }
        //
        const messageHash = 'myTrades';
        const marketId = this.safeString(message, 'symbol');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const trade = this.parseWsTrade(message, market);
        let trades = this.myTrades;
        if (trades === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            trades = new Cache.ArrayCacheBySymbolById(limit);
            this.myTrades = trades;
        }
        trades.append(trade);
        client.resolve(trades, messageHash);
        const symbolSpecificMessageHash = messageHash + ':' + symbol;
        client.resolve(trades, symbolSpecificMessageHash);
    }
    async watchPositions(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woofipro#watchPositions
         * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/private/position-push
         * @description watch all open positions
         * @param {string[]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        await this.loadMarkets();
        const messageHashes = [];
        symbols = this.marketSymbols(symbols);
        if (!this.isEmpty(symbols)) {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                messageHashes.push('positions::' + symbol);
            }
        }
        else {
            messageHashes.push('positions');
        }
        const url = this.urls['api']['ws']['private'] + '/' + this.accountId;
        const client = this.client(url);
        this.setPositionsCache(client, symbols);
        const fetchPositionsSnapshot = this.handleOption('watchPositions', 'fetchPositionsSnapshot', true);
        const awaitPositionsSnapshot = this.safeBool('watchPositions', 'awaitPositionsSnapshot', true);
        if (fetchPositionsSnapshot && awaitPositionsSnapshot && this.positions === undefined) {
            const snapshot = await client.future('fetchPositionsSnapshot');
            return this.filterBySymbolsSinceLimit(snapshot, symbols, since, limit, true);
        }
        const request = {
            'event': 'subscribe',
            'topic': 'position',
        };
        const newPositions = await this.watchPrivateMultiple(messageHashes, request, params);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit(this.positions, symbols, since, limit, true);
    }
    setPositionsCache(client, type, symbols = undefined) {
        const fetchPositionsSnapshot = this.handleOption('watchPositions', 'fetchPositionsSnapshot', false);
        if (fetchPositionsSnapshot) {
            const messageHash = 'fetchPositionsSnapshot';
            if (!(messageHash in client.futures)) {
                client.future(messageHash);
                this.spawn(this.loadPositionsSnapshot, client, messageHash);
            }
        }
        else {
            this.positions = new Cache.ArrayCacheBySymbolBySide();
        }
    }
    async loadPositionsSnapshot(client, messageHash) {
        const positions = await this.fetchPositions();
        this.positions = new Cache.ArrayCacheBySymbolBySide();
        const cache = this.positions;
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            const contracts = this.safeString(position, 'contracts', '0');
            if (Precise["default"].stringGt(contracts, '0')) {
                cache.append(position);
            }
        }
        // don't remove the future from the .futures cache
        const future = client.futures[messageHash];
        future.resolve(cache);
        client.resolve(cache, 'positions');
    }
    handlePositions(client, message) {
        //
        //    {
        //        "topic":"position",
        //        "ts":1705292345255,
        //        "data":{
        //           "positions":[
        //              {
        //                     "symbol":"PERP_ETH_USDC",
        //                     "positionQty":3.1408,
        //                     "costPosition":5706.51952,
        //                     "lastSumUnitaryFunding":0.804,
        //                     "sumUnitaryFundingVersion":0,
        //                     "pendingLongQty":0.0,
        //                     "pendingShortQty":-1.0,
        //                     "settlePrice":1816.9,
        //                     "averageOpenPrice":1804.51490427,
        //                     "unsettledPnl":-2.79856,
        //                     "pnl24H":-338.90179488,
        //                     "fee24H":4.242423,
        //                     "markPrice":1816.2,
        //                     "estLiqPrice":0.0,
        //                     "version":179967,
        //                     "imrwithOrders":0.1,
        //                     "mmrwithOrders":0.05,
        //                     "mmr":0.05,
        //                     "imr":0.1,
        //                     "timestamp":1685154032762
        //              }
        //           ]
        //        }
        //    }
        //
        const data = this.safeDict(message, 'data', {});
        const rawPositions = this.safeList(data, 'positions', []);
        if (this.positions === undefined) {
            this.positions = new Cache.ArrayCacheBySymbolBySide();
        }
        const cache = this.positions;
        const newPositions = [];
        for (let i = 0; i < rawPositions.length; i++) {
            const rawPosition = rawPositions[i];
            const marketId = this.safeString(rawPosition, 'symbol');
            const market = this.safeMarket(marketId);
            const position = this.parseWsPosition(rawPosition, market);
            newPositions.push(position);
            cache.append(position);
            const messageHash = 'positions::' + market['symbol'];
            client.resolve(position, messageHash);
        }
        client.resolve(newPositions, 'positions');
    }
    parseWsPosition(position, market = undefined) {
        //
        //     {
        //         "symbol":"PERP_ETH_USDC",
        //         "positionQty":3.1408,
        //         "costPosition":5706.51952,
        //         "lastSumUnitaryFunding":0.804,
        //         "sumUnitaryFundingVersion":0,
        //         "pendingLongQty":0.0,
        //         "pendingShortQty":-1.0,
        //         "settlePrice":1816.9,
        //         "averageOpenPrice":1804.51490427,
        //         "unsettledPnl":-2.79856,
        //         "pnl24H":-338.90179488,
        //         "fee24H":4.242423,
        //         "markPrice":1816.2,
        //         "estLiqPrice":0.0,
        //         "version":179967,
        //         "imrwithOrders":0.1,
        //         "mmrwithOrders":0.05,
        //         "mmr":0.05,
        //         "imr":0.1,
        //         "timestamp":1685154032762
        //     }
        //
        const contract = this.safeString(position, 'symbol');
        market = this.safeMarket(contract, market);
        let size = this.safeString(position, 'positionQty');
        let side = undefined;
        if (Precise["default"].stringGt(size, '0')) {
            side = 'long';
        }
        else {
            side = 'short';
        }
        const contractSize = this.safeString(market, 'contractSize');
        const markPrice = this.safeString(position, 'markPrice');
        const timestamp = this.safeInteger(position, 'timestamp');
        const entryPrice = this.safeString(position, 'averageOpenPrice');
        const unrealisedPnl = this.safeString(position, 'unsettledPnl');
        size = Precise["default"].stringAbs(size);
        const notional = Precise["default"].stringMul(size, markPrice);
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': this.safeString(market, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastUpdateTimestamp': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'entryPrice': this.parseNumber(entryPrice),
            'notional': this.parseNumber(notional),
            'leverage': undefined,
            'unrealizedPnl': this.parseNumber(unrealisedPnl),
            'contracts': this.parseNumber(size),
            'contractSize': this.parseNumber(contractSize),
            'marginRatio': undefined,
            'liquidationPrice': this.safeNumber(position, 'estLiqPrice'),
            'markPrice': this.parseNumber(markPrice),
            'lastPrice': undefined,
            'collateral': undefined,
            'marginMode': 'cross',
            'marginType': undefined,
            'side': side,
            'percentage': undefined,
            'hedged': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }
    async watchBalance(params = {}) {
        /**
         * @method
         * @name woofipro#watchBalance
         * @description watch balance and get the amount of funds available for trading or funds locked in orders
         * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/private/balance
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets();
        const topic = 'balance';
        const messageHash = topic;
        const request = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend(request, params);
        return await this.watchPrivate(messageHash, message);
    }
    handleBalance(client, message) {
        //
        //     {
        //         "topic":"balance",
        //         "ts":1651836695254,
        //         "data":{
        //             "balances":{
        //                 "USDC":{
        //                     "holding":5555815.47398272,
        //                     "frozen":0,
        //                     "interest":0,
        //                     "pendingShortQty":0,
        //                     "pendingExposure":0,
        //                     "pendingLongQty":0,
        //                     "pendingLongExposure":0,
        //                     "version":894,
        //                     "staked":51370692,
        //                     "unbonding":0,
        //                     "vault":0,
        //                     "averageOpenPrice":0.00000574,
        //                     "pnl24H":0,
        //                     "fee24H":0.01914,
        //                     "markPrice":0.31885
        //                 }
        //             }
        //         }
        //     }
        //
        const data = this.safeDict(message, 'data', {});
        const balances = this.safeDict(data, 'balances', {});
        const keys = Object.keys(balances);
        const ts = this.safeInteger(message, 'ts');
        this.balance['info'] = data;
        this.balance['timestamp'] = ts;
        this.balance['datetime'] = this.iso8601(ts);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = balances[key];
            const code = this.safeCurrencyCode(key);
            const account = (code in this.balance) ? this.balance[code] : this.account();
            const total = this.safeString(value, 'holding');
            const used = this.safeString(value, 'frozen');
            account['total'] = total;
            account['used'] = used;
            account['free'] = Precise["default"].stringSub(total, used);
            this.balance[code] = account;
        }
        this.balance = this.safeBalance(this.balance);
        client.resolve(this.balance, 'balance');
    }
    handleErrorMessage(client, message) {
        //
        // {"id":"1","event":"subscribe","success":false,"ts":1710780997216,"errorMsg":"Auth is needed."}
        //
        if (!('success' in message)) {
            return false;
        }
        const success = this.safeBool(message, 'success');
        if (success) {
            return false;
        }
        const errorMessage = this.safeString(message, 'errorMsg');
        try {
            if (errorMessage !== undefined) {
                const feedback = this.id + ' ' + this.json(message);
                this.throwExactlyMatchedException(this.exceptions['exact'], errorMessage, feedback);
            }
            return false;
        }
        catch (error) {
            if (error instanceof errors.AuthenticationError) {
                const messageHash = 'authenticated';
                client.reject(error, messageHash);
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
            }
            else {
                client.reject(error);
            }
            return true;
        }
    }
    handleMessage(client, message) {
        if (this.handleErrorMessage(client, message)) {
            return;
        }
        const methods = {
            'ping': this.handlePing,
            'pong': this.handlePong,
            'subscribe': this.handleSubscribe,
            'orderbook': this.handleOrderBook,
            'ticker': this.handleTicker,
            'tickers': this.handleTickers,
            'kline': this.handleOHLCV,
            'trade': this.handleTrade,
            'auth': this.handleAuth,
            'executionreport': this.handleOrderUpdate,
            'algoexecutionreport': this.handleOrderUpdate,
            'position': this.handlePositions,
            'balance': this.handleBalance,
        };
        const event = this.safeString(message, 'event');
        let method = this.safeValue(methods, event);
        if (method !== undefined) {
            method.call(this, client, message);
            return;
        }
        const topic = this.safeString(message, 'topic');
        if (topic !== undefined) {
            method = this.safeValue(methods, topic);
            if (method !== undefined) {
                method.call(this, client, message);
                return;
            }
            const splitTopic = topic.split('@');
            const splitLength = splitTopic.length;
            if (splitLength === 2) {
                const name = this.safeString(splitTopic, 1);
                method = this.safeValue(methods, name);
                if (method !== undefined) {
                    method.call(this, client, message);
                    return;
                }
                const splitName = name.split('_');
                const splitNameLength = splitTopic.length;
                if (splitNameLength === 2) {
                    method = this.safeValue(methods, this.safeString(splitName, 0));
                    if (method !== undefined) {
                        method.call(this, client, message);
                    }
                }
            }
        }
    }
    ping(client) {
        return { 'event': 'ping' };
    }
    handlePing(client, message) {
        return { 'event': 'pong' };
    }
    handlePong(client, message) {
        //
        // { event: "pong", ts: 1614667590000 }
        //
        client.lastPong = this.milliseconds();
        return message;
    }
    handleSubscribe(client, message) {
        //
        //     {
        //         "id": "666888",
        //         "event": "subscribe",
        //         "success": true,
        //         "ts": 1657117712212
        //     }
        //
        return message;
    }
}

module.exports = woofipro;
