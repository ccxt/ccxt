// ----------------------------------------------------------------------------
import wooRest from '../woo.js';
import { ExchangeError, AuthenticationError } from '../base/errors.js';
import { ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCache, ArrayCacheBySymbolBySide } from '../base/ws/Cache.js';
import { Precise } from '../base/Precise.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
// ----------------------------------------------------------------------------
export default class woo extends wooRest {
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
                'watchBidsAsks': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchPositions': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://wss.woox.io/ws/stream',
                        'private': 'wss://wss.woox.io/v2/ws/private/stream',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://wss.staging.woox.io/ws/stream',
                        'private': 'wss://wss.staging.woox.io/v2/ws/private/stream',
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
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
                'keepAlive': 9000,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        'Auth is needed.': AuthenticationError,
                    },
                },
            },
        });
    }
    requestId(url) {
        const options = this.safeValue(this.options, 'requestId', {});
        const previousValue = this.safeInteger(options, url, 0);
        const newValue = this.sum(previousValue, 1);
        this.options['requestId'][url] = newValue;
        return newValue;
    }
    async watchPublic(messageHash, message) {
        const urlUid = (this.uid) ? '/' + this.uid : '';
        const url = this.urls['api']['ws']['public'] + urlUid;
        const requestId = this.requestId(url);
        const subscribe = {
            'id': requestId,
        };
        const request = this.extend(subscribe, message);
        return await this.watch(url, messageHash, request, messageHash, subscribe);
    }
    /**
     * @method
     * @name woo#watchOrderBook
     * @see https://docs.woox.io/#orderbookupdate
     * @see https://docs.woox.io/#orderbook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] either (default) 'orderbook' or 'orderbookupdate', default is 'orderbook'
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        let method = undefined;
        [method, params] = this.handleOptionAndParams(params, 'watchOrderBook', 'method', 'orderbook');
        const market = this.market(symbol);
        const topic = market['id'] + '@' + method;
        const urlUid = (this.uid) ? '/' + this.uid : '';
        const url = this.urls['api']['ws']['public'] + urlUid;
        const requestId = this.requestId(url);
        const request = {
            'event': 'subscribe',
            'topic': topic,
            'id': requestId,
        };
        const subscription = {
            'id': requestId.toString(),
            'name': method,
            'symbol': symbol,
            'limit': limit,
            'params': params,
        };
        if (method === 'orderbookupdate') {
            subscription['method'] = this.handleOrderBookSubscription;
        }
        const orderbook = await this.watch(url, topic, this.extend(request, params), topic, subscription);
        return orderbook.limit();
    }
    handleOrderBook(client, message) {
        //
        //     {
        //         "topic": "PERP_BTC_USDT@orderbookupdate",
        //         "ts": 1722500373999,
        //         "data": {
        //             "symbol": "PERP_BTC_USDT",
        //             "prevTs": 1722500373799,
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
        const data = this.safeDict(message, 'data');
        const marketId = this.safeString(data, 'symbol');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const topic = this.safeString(message, 'topic');
        const method = this.safeString(topic.split('@'), 1);
        if (method === 'orderbookupdate') {
            if (!(symbol in this.orderbooks)) {
                return;
            }
            const orderbook = this.orderbooks[symbol];
            const timestamp = this.safeInteger(orderbook, 'timestamp');
            if (timestamp === undefined) {
                orderbook.cache.push(message);
            }
            else {
                try {
                    const ts = this.safeInteger(message, 'ts');
                    if (ts > timestamp) {
                        this.handleOrderBookMessage(client, message, orderbook);
                        client.resolve(orderbook, topic);
                    }
                }
                catch (e) {
                    delete this.orderbooks[symbol];
                    delete client.subscriptions[topic];
                    client.reject(e, topic);
                }
            }
        }
        else {
            if (!(symbol in this.orderbooks)) {
                const defaultLimit = this.safeInteger(this.options, 'watchOrderBookLimit', 1000);
                const subscription = client.subscriptions[topic];
                const limit = this.safeInteger(subscription, 'limit', defaultLimit);
                this.orderbooks[symbol] = this.orderBook({}, limit);
            }
            const orderbook = this.orderbooks[symbol];
            const timestamp = this.safeInteger(message, 'ts');
            const snapshot = this.parseOrderBook(data, symbol, timestamp, 'bids', 'asks');
            orderbook.reset(snapshot);
            client.resolve(orderbook, topic);
        }
    }
    handleOrderBookSubscription(client, message, subscription) {
        const defaultLimit = this.safeInteger(this.options, 'watchOrderBookLimit', 1000);
        const limit = this.safeInteger(subscription, 'limit', defaultLimit);
        const symbol = this.safeString(subscription, 'symbol'); // watchOrderBook
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        this.orderbooks[symbol] = this.orderBook({}, limit);
        this.spawn(this.fetchOrderBookSnapshot, client, message, subscription);
    }
    async fetchOrderBookSnapshot(client, message, subscription) {
        const symbol = this.safeString(subscription, 'symbol');
        const messageHash = this.safeString(message, 'topic');
        try {
            const defaultLimit = this.safeInteger(this.options, 'watchOrderBookLimit', 1000);
            const limit = this.safeInteger(subscription, 'limit', defaultLimit);
            const params = this.safeValue(subscription, 'params');
            const snapshot = await this.fetchRestOrderBookSafe(symbol, limit, params);
            if (this.safeValue(this.orderbooks, symbol) === undefined) {
                // if the orderbook is dropped before the snapshot is received
                return;
            }
            const orderbook = this.orderbooks[symbol];
            orderbook.reset(snapshot);
            const messages = orderbook.cache;
            for (let i = 0; i < messages.length; i++) {
                const messageItem = messages[i];
                const ts = this.safeInteger(messageItem, 'ts');
                if (ts < orderbook['timestamp']) {
                    continue;
                }
                else {
                    this.handleOrderBookMessage(client, messageItem, orderbook);
                }
            }
            this.orderbooks[symbol] = orderbook;
            client.resolve(orderbook, messageHash);
        }
        catch (e) {
            delete client.subscriptions[messageHash];
            client.reject(e, messageHash);
        }
    }
    handleOrderBookMessage(client, message, orderbook) {
        const data = this.safeDict(message, 'data');
        this.handleDeltas(orderbook['asks'], this.safeValue(data, 'asks', []));
        this.handleDeltas(orderbook['bids'], this.safeValue(data, 'bids', []));
        const timestamp = this.safeInteger(message, 'ts');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601(timestamp);
        return orderbook;
    }
    handleDelta(bookside, delta) {
        const price = this.safeFloat2(delta, 'price', 0);
        const amount = this.safeFloat2(delta, 'quantity', 1);
        bookside.store(price, amount);
    }
    handleDeltas(bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta(bookside, deltas[i]);
        }
    }
    /**
     * @method
     * @name woo#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
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
        //         "symbol": "PERP_BTC_USDT",
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
        //         "topic": "PERP_BTC_USDT@ticker",
        //         "ts": 1657120017000,
        //         "data": {
        //             "symbol": "PERP_BTC_USDT",
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
        const data = this.safeValue(message, 'data');
        const topic = this.safeValue(message, 'topic');
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
    /**
     * @method
     * @name woo#watchTickers
     * @see https://docs.woox.io/#24h-tickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
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
        //                 "symbol":"SPOT_OKB_USDT",
        //                 "open":16.297,
        //                 "close":17.183,
        //                 "high":24.707,
        //                 "low":11.997,
        //                 "volume":0,
        //                 "amount":0,
        //                 "count":0
        //             },
        //             {
        //                 "symbol":"SPOT_XRP_USDT",
        //                 "open":1.3515,
        //                 "close":1.43794,
        //                 "high":1.96674,
        //                 "low":0.39264,
        //                 "volume":750127.1,
        //                 "amount":985440.5122,
        //                 "count":396
        //             },
        //         ...
        //         ]
        //     }
        //
        const topic = this.safeValue(message, 'topic');
        const data = this.safeValue(message, 'data');
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
    /**
     * @method
     * @name woo#watchBidsAsks
     * @see https://docs.woox.io/#bbos
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchBidsAsks(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        const name = 'bbos';
        const topic = name;
        const request = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend(request, params);
        const tickers = await this.watchPublic(topic, message);
        if (this.newUpdates) {
            return tickers;
        }
        return this.filterByArray(this.bidsasks, 'symbol', symbols);
    }
    handleBidAsk(client, message) {
        //
        //     {
        //         "topic": "bbos",
        //         "ts": 1618822376000,
        //         "data": [
        //             {
        //                 "symbol": "SPOT_FIL_USDT",
        //                 "ask": 159.0318,
        //                 "askSize": 370.43,
        //                 "bid": 158.9158,
        //                 "bidSize": 16
        //             }
        //         ]
        //     }
        //
        const topic = this.safeString(message, 'topic');
        const data = this.safeList(message, 'data', []);
        const timestamp = this.safeInteger(message, 'ts');
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const ticker = this.safeDict(data, i);
            ticker['ts'] = timestamp;
            const parsedTicker = this.parseWsBidAsk(ticker);
            const symbol = parsedTicker['symbol'];
            this.bidsasks[symbol] = parsedTicker;
            result[symbol] = parsedTicker;
        }
        client.resolve(result, topic);
    }
    parseWsBidAsk(ticker, market = undefined) {
        const marketId = this.safeString(ticker, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = this.safeString(market, 'symbol');
        const timestamp = this.safeInteger(ticker, 'ts');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'ask': this.safeString(ticker, 'ask'),
            'askVolume': this.safeString(ticker, 'askSize'),
            'bid': this.safeString(ticker, 'bid'),
            'bidVolume': this.safeString(ticker, 'bidSize'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name woo#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.woox.io/#k-line
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        if ((timeframe !== '1m') && (timeframe !== '5m') && (timeframe !== '15m') && (timeframe !== '30m') && (timeframe !== '1h') && (timeframe !== '1d') && (timeframe !== '1w') && (timeframe !== '1M')) {
            throw new ExchangeError(this.id + ' watchOHLCV timeframe argument must be 1m, 5m, 15m, 30m, 1h, 1d, 1w, 1M');
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
        //         "topic":"SPOT_BTC_USDT@kline_1m",
        //         "ts":1618822432146,
        //         "data":{
        //             "symbol":"SPOT_BTC_USDT",
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
        const data = this.safeValue(message, 'data');
        const topic = this.safeValue(message, 'topic');
        const marketId = this.safeString(data, 'symbol');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const interval = this.safeString(data, 'type');
        const timeframe = this.findTimeframe(interval);
        const parsed = [
            this.safeInteger(data, 'startTime'),
            this.safeFloat(data, 'open'),
            this.safeFloat(data, 'high'),
            this.safeFloat(data, 'low'),
            this.safeFloat(data, 'close'),
            this.safeFloat(data, 'volume'),
        ];
        this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
        let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp(limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        stored.append(parsed);
        client.resolve(stored, topic);
    }
    /**
     * @method
     * @name woo#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://docs.woox.io/#trade
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
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
        //     "topic":"SPOT_ADA_USDT@trade",
        //     "ts":1618820361552,
        //     "data":{
        //         "symbol":"SPOT_ADA_USDT",
        //         "price":1.27988,
        //         "size":300,
        //         "side":"BUY",
        //         "source":0
        //     }
        // }
        //
        const topic = this.safeString(message, 'topic');
        const timestamp = this.safeInteger(message, 'ts');
        const data = this.safeValue(message, 'data');
        const marketId = this.safeString(data, 'symbol');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const trade = this.parseWsTrade(this.extend(data, { 'timestamp': timestamp }), market);
        let tradesArray = this.safeValue(this.trades, symbol);
        if (tradesArray === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            tradesArray = new ArrayCache(limit);
        }
        tradesArray.append(trade);
        this.trades[symbol] = tradesArray;
        client.resolve(tradesArray, topic);
    }
    parseWsTrade(trade, market = undefined) {
        //
        //     {
        //         "symbol":"SPOT_ADA_USDT",
        //         "timestamp":1618820361552,
        //         "price":1.27988,
        //         "size":300,
        //         "side":"BUY",
        //         "source":0
        //     }
        // private trade
        //    {
        //     "msgType": 0,  // execution report
        //     "symbol": "SPOT_BTC_USDT",
        //     "clientOrderId": 0,
        //     "orderId": 54774393,
        //     "type": "MARKET",
        //     "side": "BUY",
        //     "quantity": 0.0,
        //     "price": 0.0,
        //     "tradeId": 56201985,
        //     "executedPrice": 23534.06,
        //     "executedQuantity": 0.00040791,
        //     "fee": 2.1E-7,
        //     "feeAsset": "BTC",
        //     "totalExecutedQuantity": 0.00040791,
        //     "avgPrice": 23534.06,
        //     "status": "FILLED",
        //     "reason": "",
        //     "orderTag": "default",
        //     "totalFee": 2.1E-7,
        //     "feeCurrency": "BTC",
        //     "totalRebate": 0,
        //     "rebateCurrency": "USDT",
        //     "visible": 0.0,
        //     "timestamp": 1675406261689,
        //     "reduceOnly": false,
        //     "maker": false
        //   }
        //
        const marketId = this.safeString(trade, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString2(trade, 'executedPrice', 'price');
        const amount = this.safeString2(trade, 'executedQuantity', 'size');
        const cost = Precise.stringMul(price, amount);
        const side = this.safeStringLower(trade, 'side');
        const timestamp = this.safeInteger(trade, 'timestamp');
        const maker = this.safeBool(trade, 'marker');
        let takerOrMaker = undefined;
        if (maker !== undefined) {
            takerOrMaker = maker ? 'maker' : 'taker';
        }
        const type = this.safeStringLower(trade, 'type');
        let fee = undefined;
        const feeCost = this.safeNumber(trade, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': this.safeCurrencyCode(this.safeString(trade, 'feeCurrency')),
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
            'type': type,
            'fee': fee,
            'info': trade,
        }, market);
    }
    checkRequiredUid(error = true) {
        if (!this.uid) {
            if (error) {
                throw new AuthenticationError(this.id + ' requires `uid` credential (woox calls it `application_id`)');
            }
            else {
                return false;
            }
        }
        return true;
    }
    async authenticate(params = {}) {
        this.checkRequiredCredentials();
        const url = this.urls['api']['ws']['private'] + '/' + this.uid;
        const client = this.client(url);
        const messageHash = 'authenticated';
        const event = 'auth';
        const future = client.future(messageHash);
        const authenticated = this.safeValue(client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const ts = this.nonce().toString();
            const auth = '|' + ts;
            const signature = this.hmac(this.encode(auth), this.encode(this.secret), sha256);
            const request = {
                'event': event,
                'params': {
                    'apikey': this.apiKey,
                    'sign': signature,
                    'timestamp': ts,
                },
            };
            const message = this.extend(request, params);
            this.watch(url, messageHash, message, messageHash, message);
        }
        return await future;
    }
    async watchPrivate(messageHash, message, params = {}) {
        await this.authenticate(params);
        const url = this.urls['api']['ws']['private'] + '/' + this.uid;
        const requestId = this.requestId(url);
        const subscribe = {
            'id': requestId,
        };
        const request = this.extend(subscribe, message);
        return await this.watch(url, messageHash, request, messageHash, subscribe);
    }
    async watchPrivateMultiple(messageHashes, message, params = {}) {
        await this.authenticate(params);
        const url = this.urls['api']['ws']['private'] + '/' + this.uid;
        const requestId = this.requestId(url);
        const subscribe = {
            'id': requestId,
        };
        const request = this.extend(subscribe, message);
        return await this.watchMultiple(url, messageHashes, request, messageHashes, subscribe);
    }
    /**
     * @method
     * @name woo#watchOrders
     * @see https://docs.woox.io/#executionreport
     * @see https://docs.woox.io/#algoexecutionreportv2
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] true if trigger order
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const trigger = this.safeBool2(params, 'stop', 'trigger', false);
        const topic = (trigger) ? 'algoexecutionreportv2' : 'executionreport';
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
    /**
     * @method
     * @name woo#watchMyTrades
     * @see https://docs.woox.io/#executionreport
     * @see https://docs.woox.io/#algoexecutionreportv2
     * @description watches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] true if trigger order
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const trigger = this.safeBool2(params, 'stop', 'trigger', false);
        const topic = (trigger) ? 'algoexecutionreportv2' : 'executionreport';
        params = this.omit(params, ['stop', 'trigger']);
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
        const trades = await this.watchPrivate(messageHash, message);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit, true);
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
        const priceString = this.safeString(order, 'price');
        let price = this.safeNumber(order, 'price');
        const avgPrice = this.safeNumber(order, 'avgPrice');
        if (Precise.stringEq(priceString, '0') && (avgPrice !== undefined)) {
            price = avgPrice;
        }
        const amount = this.safeFloat(order, 'quantity');
        const side = this.safeStringLower(order, 'side');
        const type = this.safeStringLower(order, 'type');
        const filled = this.safeNumber(order, 'totalExecutedQuantity');
        const totalExecQuantity = this.safeFloat(order, 'totalExecutedQuantity');
        let remaining = amount;
        if (amount >= totalExecQuantity) {
            remaining -= totalExecQuantity;
        }
        const rawStatus = this.safeString(order, 'status');
        const status = this.parseOrderStatus(rawStatus);
        const trades = undefined;
        const clientOrderId = this.safeString(order, 'clientOrderId');
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
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'average': avgPrice,
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
        //             "reduceOnly": false,
        //             "maker": false
        //         }
        //     }
        //
        const topic = this.safeString(message, 'topic');
        const data = this.safeValue(message, 'data');
        if (Array.isArray(data)) {
            // algoexecutionreportv2
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
                this.orders = new ArrayCacheBySymbolById(limit);
            }
            const cachedOrders = this.orders;
            const orders = this.safeValue(cachedOrders.hashmap, symbol, {});
            const order = this.safeValue(orders, orderId);
            if (order !== undefined) {
                const fee = this.safeValue(order, 'fee');
                if (fee !== undefined) {
                    parsed['fee'] = fee;
                }
                const fees = this.safeValue(order, 'fees');
                if (fees !== undefined) {
                    parsed['fees'] = fees;
                }
                parsed['trades'] = this.safeValue(order, 'trades');
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
        //    {
        //     "msgType": 0,  // execution report
        //     "symbol": "SPOT_BTC_USDT",
        //     "clientOrderId": 0,
        //     "orderId": 54774393,
        //     "type": "MARKET",
        //     "side": "BUY",
        //     "quantity": 0.0,
        //     "price": 0.0,
        //     "tradeId": 56201985,
        //     "executedPrice": 23534.06,
        //     "executedQuantity": 0.00040791,
        //     "fee": 2.1E-7,
        //     "feeAsset": "BTC",
        //     "totalExecutedQuantity": 0.00040791,
        //     "avgPrice": 23534.06,
        //     "status": "FILLED",
        //     "reason": "",
        //     "orderTag": "default",
        //     "totalFee": 2.1E-7,
        //     "feeCurrency": "BTC",
        //     "totalRebate": 0,
        //     "rebateCurrency": "USDT",
        //     "visible": 0.0,
        //     "timestamp": 1675406261689,
        //     "reduceOnly": false,
        //     "maker": false
        //   }
        //
        let myTrades = this.myTrades;
        if (myTrades === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            myTrades = new ArrayCacheBySymbolById(limit);
        }
        const trade = this.parseWsTrade(message);
        myTrades.append(trade);
        let messageHash = 'myTrades:' + trade['symbol'];
        client.resolve(myTrades, messageHash);
        messageHash = 'myTrades';
        client.resolve(myTrades, messageHash);
    }
    /**
     * @method
     * @name woo#watchPositions
     * @see https://docs.woox.io/#position-push
     * @description watch all open positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param since
     * @param limit
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions(symbols = undefined, since = undefined, limit = undefined, params = {}) {
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
        const url = this.urls['api']['ws']['private'] + '/' + this.uid;
        const client = this.client(url);
        this.setPositionsCache(client, symbols);
        const fetchPositionsSnapshot = this.handleOption('watchPositions', 'fetchPositionsSnapshot', true);
        const awaitPositionsSnapshot = this.handleOption('watchPositions', 'awaitPositionsSnapshot', true);
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
            this.positions = new ArrayCacheBySymbolBySide();
        }
    }
    async loadPositionsSnapshot(client, messageHash) {
        const positions = await this.fetchPositions();
        this.positions = new ArrayCacheBySymbolBySide();
        const cache = this.positions;
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            const contracts = this.safeNumber(position, 'contracts', 0);
            if (contracts > 0) {
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
        //           "positions":{
        //              "PERP_LTC_USDT":{
        //                 "holding":1,
        //                 "pendingLongQty":0,
        //                 "pendingShortQty":0,
        //                 "averageOpenPrice":71.53,
        //                 "pnl24H":0,
        //                 "fee24H":0.07153,
        //                 "settlePrice":71.53,
        //                 "markPrice":71.32098452065145,
        //                 "version":7886,
        //                 "openingTime":1705292304267,
        //                 "pnl24HPercentage":0,
        //                 "adlQuantile":1,
        //                 "positionSide":"BOTH"
        //              }
        //           }
        //        }
        //    }
        //
        const data = this.safeValue(message, 'data', {});
        const rawPositions = this.safeValue(data, 'positions', {});
        const postitionsIds = Object.keys(rawPositions);
        if (this.positions === undefined) {
            this.positions = new ArrayCacheBySymbolBySide();
        }
        const cache = this.positions;
        const newPositions = [];
        for (let i = 0; i < postitionsIds.length; i++) {
            const marketId = postitionsIds[i];
            const market = this.safeMarket(marketId);
            const rawPosition = rawPositions[marketId];
            const position = this.parsePosition(rawPosition, market);
            newPositions.push(position);
            cache.append(position);
            const messageHash = 'positions::' + market['symbol'];
            client.resolve(position, messageHash);
        }
        client.resolve(newPositions, 'positions');
    }
    /**
     * @method
     * @see https://docs.woox.io/#balance
     * @name woo#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance(params = {}) {
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
        //   {
        //       "topic": "balance",
        //       "ts": 1695716888789,
        //       "data": {
        //          "balances": {
        //             "USDT": {
        //                "holding": 266.56059176,
        //                "frozen": 0,
        //                "interest": 0,
        //                "pendingShortQty": 0,
        //                "pendingExposure": 0,
        //                "pendingLongQty": 0,
        //                "pendingLongExposure": 0,
        //                "version": 37,
        //                "staked": 0,
        //                "unbonding": 0,
        //                "vault": 0,
        //                "averageOpenPrice": 0,
        //                "pnl24H": 0,
        //                "fee24H": 0,
        //                "markPrice": 1,
        //                "pnl24HPercentage": 0
        //             }
        //          }
        //
        //    }
        //
        const data = this.safeValue(message, 'data');
        const balances = this.safeValue(data, 'balances');
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
            account['free'] = Precise.stringSub(total, used);
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
            if (error instanceof AuthenticationError) {
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
            'orderbookupdate': this.handleOrderBook,
            'ticker': this.handleTicker,
            'tickers': this.handleTickers,
            'kline': this.handleOHLCV,
            'auth': this.handleAuth,
            'executionreport': this.handleOrderUpdate,
            'algoexecutionreportv2': this.handleOrderUpdate,
            'trade': this.handleTrade,
            'balance': this.handleBalance,
            'position': this.handlePositions,
            'bbos': this.handleBidAsk,
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
        // { event: "pong", ts: 1657117026090 }
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
        const id = this.safeString(message, 'id');
        const subscriptionsById = this.indexBy(client.subscriptions, 'id');
        const subscription = this.safeValue(subscriptionsById, id, {});
        const method = this.safeValue(subscription, 'method');
        if (method !== undefined) {
            method.call(this, client, message, subscription);
        }
        return message;
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
            const error = new AuthenticationError(this.json(message));
            client.reject(error, messageHash);
            // allows further authentication attempts
            if (messageHash in client.subscriptions) {
                delete client.subscriptions['authenticated'];
            }
        }
    }
}
