'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var toobit$1 = require('../toobit.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class toobit extends toobit$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                // 'watchPosition': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'common': 'wss://stream.toobit.com',
                    },
                },
            },
            'options': {
                'ws': {
                    'timeframes': {
                        '1m': '1m',
                        '3m': '3m',
                        '5m': '5m',
                        '15m': '15m',
                        '30m': '30m',
                        '1h': '1h',
                        '2h': '2h',
                        '4h': '4h',
                        '6h': '6h',
                        '8h': '8h',
                        '12h': '12h',
                        '1d': '1d',
                        '1w': '1w',
                        '1M': '1M',
                    },
                    'watchOrderBook': {
                        'channel': 'depth', // depth, diffDepth
                    },
                    'listenKeyRefreshRate': 1200000, // 20 mins
                },
            },
            'streaming': {
                'keepAlive': (60 - 1) * 5 * 1000,
                'ping': this.ping,
            },
            'exceptions': {
                'ws': {
                    'exact': {},
                },
            },
        });
    }
    ping(client) {
        return {
            'ping': this.milliseconds(),
        };
    }
    handleMessage(client, message) {
        //
        // public
        //
        //     {
        //         topic: "trade",
        //         symbol: "DOGEUSDT",
        //         symbolName: "DOGEUSDT",
        //         params: {
        //             realtimeInterval: "24h",
        //             binary: "false",
        //         },
        //         data: [
        //             {
        //                 v: "4864732022868004630",
        //                 t: 1757243788405,
        //                 p: "0.21804",
        //                 q: "80",
        //                 m: true,
        //             },
        //         ],
        //         f: true,  // initial first snapshot or not
        //         sendTime: 1757244002117,
        //         shared: false,
        //     }
        //
        // private
        //
        //     [
        //       {
        //         e: 'outboundContractAccountInfo',
        //         E: '1758228398234',
        //         T: true,
        //         W: true,
        //         D: true,
        //         B: [ [Object] ]
        //       }
        //     ]
        //
        const topic = this.safeString(message, 'topic');
        if (this.handleErrorMessage(client, message)) {
            return;
        }
        //
        // handle ping-pong: { ping: 1758540450000 }
        //
        const pongTimestamp = this.safeInteger(message, 'pong');
        if (pongTimestamp !== undefined) {
            this.handleIncomingPong(client, pongTimestamp);
            return;
        }
        const methods = {
            'trade': this.handleTrades,
            'kline': this.handleOHLCV,
            'realtimes': this.handleTickers,
            'depth': this.handleOrderBookPartialSnapshot,
            'diffDepth': this.handleOrderBook,
            'outboundAccountInfo': this.handleBalance,
            'outboundContractAccountInfo': this.handleBalance,
            'executionReport': this.handleOrder,
            'contractExecutionReport': this.handleOrder,
            'ticketInfo': this.handleMyTrade,
            'outboundContractPositionInfo': this.handlePositions,
        };
        const method = this.safeValue(methods, topic);
        if (method !== undefined) {
            method.call(this, client, message);
        }
        else {
            // check private streams
            for (let i = 0; i < message.length; i++) {
                const item = message[i];
                const event = this.safeString(item, 'e');
                const method2 = this.safeValue(methods, event);
                if (method2 !== undefined) {
                    method2.call(this, client, item);
                }
            }
        }
    }
    handleIncomingPong(client, pongTimestamp) {
        client.lastPong = pongTimestamp;
    }
    /**
     * @method
     * @name toobit#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#trade-streams
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        return await this.watchTradesForSymbols([symbol], since, limit, params);
    }
    /**
     * @method
     * @name toobit#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#trade-streams
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.name] the name of the method to call, 'trade' or 'aggTrade', default is 'trade'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTradesForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            messageHashes.push('trade::' + symbol);
            market['id'];
        }
        const marketIds = this.marketIds(symbols);
        const url = this.urls['api']['ws']['common'] + '/quote/ws/v1';
        const request = {
            'symbol': marketIds.join(','),
            'topic': 'trade',
            'event': 'sub',
        };
        const trades = await this.watchMultiple(url, messageHashes, this.extend(request, params), messageHashes);
        if (this.newUpdates) {
            const first = this.safeValue(trades, 0);
            const tradeSymbol = this.safeString(first, 'symbol');
            limit = trades.getLimit(tradeSymbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleTrades(client, message) {
        //
        //     {
        //         symbol: "DOGEUSDT",
        //         symbolName: "DOGEUSDT",
        //         topic: "trade",
        //         params: {
        //             realtimeInterval: "24h",
        //             binary: "false",
        //         },
        //         data: [
        //             {
        //                 v: "4864732022868004630",
        //                 t: 1757243788405,
        //                 p: "0.21804",
        //                 q: "80",
        //                 m: true,
        //             },
        //         ],
        //         f: true,  // initial first snapshot or not
        //         sendTime: 1757244002117,
        //         shared: false,
        //     }
        //
        const marketId = this.safeString(message, 'symbol');
        const symbol = this.safeSymbol(marketId);
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new Cache.ArrayCache(limit);
        }
        const stored = this.trades[symbol];
        const data = this.safeList(message, 'data', []);
        const parsed = this.parseWsTrades(data);
        for (let i = 0; i < parsed.length; i++) {
            const trade = parsed[i];
            trade['symbol'] = symbol;
            stored.append(trade);
        }
        const messageHash = 'trade::' + symbol;
        client.resolve(stored, messageHash);
    }
    parseWsTrade(trade, market = undefined) {
        return this.parseTrade(trade, market);
    }
    /**
     * @method
     * @name toobit#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#kline-candlestick-streams
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        params['callerMethodName'] = 'watchOHLCV';
        const result = await this.watchOHLCVForSymbols([[symbol, timeframe]], since, limit, params);
        return result[symbol][timeframe];
    }
    /**
     * @method
     * @name toobit#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#kline-candlestick-streams
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCVForSymbols(symbolsAndTimeframes, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const url = this.urls['api']['ws']['common'] + '/quote/ws/v1';
        const messageHashes = [];
        const timeframes = this.safeDict(this.options['ws'], 'timeframes', {});
        const marketIds = [];
        let selectedTimeframe = undefined;
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const data = symbolsAndTimeframes[i];
            const symbolStr = this.safeString(data, 0);
            const market = this.market(symbolStr);
            const marketId = market['id'];
            const unfiedTimeframe = this.safeString(data, 1, '1m');
            const rawTimeframe = this.safeString(timeframes, unfiedTimeframe, unfiedTimeframe);
            if (selectedTimeframe !== undefined && selectedTimeframe !== rawTimeframe) {
                throw new errors.NotSupported(this.id + ' watchOHLCVForSymbols() only supports a single timeframe for all symbols');
            }
            else {
                selectedTimeframe = rawTimeframe;
            }
            marketIds.push(marketId);
            messageHashes.push('ohlcv::' + symbolStr + '::' + unfiedTimeframe);
        }
        const request = {
            'symbol': marketIds.join(','),
            'topic': 'kline_' + selectedTimeframe,
            'event': 'sub',
        };
        const [symbol, timeframe, stored] = await this.watchMultiple(url, messageHashes, this.extend(request, params), messageHashes);
        if (this.newUpdates) {
            limit = stored.getLimit(symbol, limit);
        }
        const filtered = this.filterBySinceLimit(stored, since, limit, 0, true);
        return this.createOHLCVObject(symbol, timeframe, filtered);
    }
    handleOHLCV(client, message) {
        //
        //     {
        //         symbol: 'DOGEUSDT',
        //         symbolName: 'DOGEUSDT',
        //         klineType: '1m',
        //         topic: 'kline',
        //         params: { realtimeInterval: '24h', klineType: '1m', binary: 'false' },
        //         data: [
        //             {
        //                 t: 1757251200000,
        //                 s: 'DOGEUSDT',
        //                 sn: 'DOGEUSDT',
        //                 c: '0.21889',
        //                 h: '0.21898',
        //                 l: '0.21889',
        //                 o: '0.21897',
        //                 v: '5247',
        //                 st: 0
        //             }
        //         ],
        //         f: true,
        //         sendTime: 1757251217643,
        //         shared: false
        //     }
        //
        const marketId = this.safeString(message, 'symbol');
        const market = this.market(marketId);
        const symbol = market['symbol'];
        const params = this.safeDict(message, 'params', {});
        const timeframeId = this.safeString(params, 'klineType');
        const timeframe = this.findTimeframe(timeframeId);
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger(this.options['ws'], 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new Cache.ArrayCacheByTimestamp(limit);
        }
        const stored = this.ohlcvs[symbol][timeframe];
        const data = this.safeList(message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const parsed = this.parseWsOHLCV(data[i], market);
            stored.append(parsed);
        }
        const messageHash = 'ohlcv::' + symbol + '::' + timeframe;
        const resolveData = [symbol, timeframe, stored];
        client.resolve(resolveData, messageHash);
    }
    parseWsOHLCV(ohlcv, market = undefined) {
        //
        //             {
        //                 t: 1757251200000,
        //                 o: '0.21897',
        //                 h: '0.21898',
        //                 l: '0.21889',
        //                 c: '0.21889',
        //                 v: '5247',
        //                 s: 'DOGEUSDT',
        //                 sn: 'DOGEUSDT',
        //                 st: 0
        //             }
        //
        const parsed = this.parseOHLCV(ohlcv, market);
        return parsed;
    }
    /**
     * @method
     * @name toobit#watchTicker
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#individual-symbol-ticker-streams
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        symbol = this.symbol(symbol);
        const tickers = await this.watchTickers([symbol], params);
        return tickers[symbol];
    }
    /**
     * @method
     * @name toobit#watchTickers
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#individual-symbol-ticker-streams
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            messageHashes.push('ticker::' + symbol);
            market['id'];
        }
        const marketIds = this.marketIds(symbols);
        const url = this.urls['api']['ws']['common'] + '/quote/ws/v1';
        const request = {
            'symbol': marketIds.join(','),
            'topic': 'realtimes',
            'event': 'sub',
        };
        const ticker = await this.watchMultiple(url, messageHashes, this.extend(request, params), messageHashes);
        if (this.newUpdates) {
            const result = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    handleTickers(client, message) {
        //
        //    {
        //        "symbol": "DOGEUSDT",
        //        "symbolName": "DOGEUSDT",
        //        "topic": "realtimes",
        //        "params": {
        //            "realtimeInterval": "24h"
        //        },
        //        "data": [
        //            {
        //                "t": 1757257643683,
        //                "s": "DOGEUSDT",
        //                "o": "0.21462",
        //                "h": "0.22518",
        //                "l": "0.21229",
        //                "c": "0.2232",
        //                "v": "283337017",
        //                "qv": "62063771.42702",
        //                "sn": "DOGEUSDT",
        //                "m": "0.04",
        //                "e": 301,
        //                "c24h": "0.2232",
        //                "h24h": "0.22518",
        //                "l24h": "0.21229",
        //                "o24h": "0.21462",
        //                "v24h": "283337017",
        //                "qv24h": "62063771.42702",
        //                "m24h": "0.04"
        //            }
        //        ],
        //        "f": false,
        //        "sendTime": 1757257643751,
        //        "shared": false
        //    }
        //
        const data = this.safeList(message, 'data');
        const newTickers = {};
        for (let i = 0; i < data.length; i++) {
            const ticker = data[i];
            const parsed = this.parseWsTicker(ticker);
            const symbol = parsed['symbol'];
            this.tickers[symbol] = parsed;
            newTickers[symbol] = parsed;
            const messageHash = 'ticker::' + symbol;
            client.resolve(parsed, messageHash);
        }
        client.resolve(newTickers, 'tickers');
    }
    parseWsTicker(ticker, market = undefined) {
        return this.parseTicker(ticker, market);
    }
    /**
     * @method
     * @name toobit#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#partial-book-depth-streams
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        return await this.watchOrderBookForSymbols([symbol], limit, params);
    }
    /**
     * @method
     * @name toobit#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#partial-book-depth-streams
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols(symbols, limit = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        let channel = undefined;
        [channel, params] = this.handleOptionAndParams(params, 'watchOrderBook', 'channel', 'depth');
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            messageHashes.push('orderBook::' + symbol + '::' + channel);
            market['id'];
        }
        const marketIds = this.marketIds(symbols);
        const url = this.urls['api']['ws']['common'] + '/quote/ws/v1';
        const request = {
            'symbol': marketIds.join(','),
            'topic': channel,
            'event': 'sub',
        };
        const orderbook = await this.watchMultiple(url, messageHashes, this.extend(request, params), messageHashes);
        return orderbook.limit();
    }
    handleOrderBook(client, message) {
        //
        //     {
        //         symbol: 'DOGEUSDT',
        //         symbolName: 'DOGEUSDT',
        //         topic: 'depth',
        //         params: { realtimeInterval: '24h' },
        //         data: [
        //             {
        //             e: 301,
        //             t: 1757304842860,
        //             v: '9814355_1E-18',
        //             b: [Array],
        //             a: [Array],
        //             o: 0
        //             }
        //         ],
        //         f: false,
        //         sendTime: 1757304843047,
        //         shared: false
        //     }
        //
        const isSnapshot = this.safeBool(message, 'f', false);
        if (isSnapshot) {
            this.setOrderBookSnapshot(client, message, 'diffDepth');
            return;
        }
        const marketId = this.safeString(message, 'symbol');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const data = this.safeList(message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const messageHash = 'orderBook::' + symbol + '::' + 'diffDepth';
            if (!(symbol in this.orderbooks)) {
                const limit = this.safeInteger(this.options['ws'], 'orderBookLimit', 1000);
                this.orderbooks[symbol] = this.orderBook({}, limit);
            }
            const orderBook = this.orderbooks[symbol];
            const timestamp = this.safeInteger(entry, 't');
            const bids = this.safeList(entry, 'b', []);
            const asks = this.safeList(entry, 'a', []);
            this.handleDeltas(orderBook['asks'], asks);
            this.handleDeltas(orderBook['bids'], bids);
            orderBook['timestamp'] = timestamp;
            this.orderbooks[symbol] = orderBook;
            client.resolve(orderBook, messageHash);
        }
    }
    handleDelta(bookside, delta) {
        const bidAsk = this.parseBidAsk(delta);
        bookside.storeArray(bidAsk);
    }
    handleOrderBookPartialSnapshot(client, message) {
        //
        //     {
        //         symbol: 'DOGEUSDT',
        //         symbolName: 'DOGEUSDT',
        //         topic: 'depth',
        //         params: { realtimeInterval: '24h' },
        //         data: [
        //             {
        //             e: 301,
        //             s: 'DOGEUSDT',
        //             t: 1757304842860,
        //             v: '9814355_1E-18',
        //             b: [Array],
        //             a: [Array],
        //             o: 0
        //             }
        //         ],
        //         f: false,
        //         sendTime: 1757304843047,
        //         shared: false
        //     }
        //
        this.setOrderBookSnapshot(client, message, 'depth');
    }
    setOrderBookSnapshot(client, message, channel) {
        const data = this.safeList(message, 'data', []);
        const length = data.length;
        if (length === 0) {
            return;
        }
        for (let i = 0; i < length; i++) {
            const entry = data[i];
            const marketId = this.safeString(entry, 's');
            const symbol = this.safeSymbol(marketId);
            const messageHash = 'orderBook::' + symbol + '::' + channel;
            if (!(symbol in this.orderbooks)) {
                const limit = this.safeInteger(this.options['ws'], 'orderBookLimit', 1000);
                this.orderbooks[symbol] = this.orderBook({}, limit);
            }
            const orderbook = this.orderbooks[symbol];
            const timestamp = this.safeInteger(entry, 't');
            const snapshot = this.parseOrderBook(entry, symbol, timestamp, 'b', 'a');
            orderbook.reset(snapshot);
            client.resolve(orderbook, messageHash);
        }
    }
    /**
     * @method
     * @name toobit#watchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#payload-account-update
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        await this.loadMarkets();
        await this.authenticate();
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('watchBalance', undefined, params);
        const isSpot = (marketType === 'spot');
        const type = isSpot ? 'spot' : 'contract';
        const spotSubHash = 'spot:balance';
        const swapSubHash = 'contract:private';
        const spotMessageHash = 'spot:balance';
        const swapMessageHash = 'contract:balance';
        const messageHash = isSpot ? spotMessageHash : swapMessageHash;
        const subscriptionHash = isSpot ? spotSubHash : swapSubHash;
        const url = this.getUserStreamUrl();
        const client = this.client(url);
        this.setBalanceCache(client, marketType, subscriptionHash, params);
        client.future(type + ':fetchBalanceSnapshot');
        return await this.watch(url, messageHash, params, subscriptionHash);
    }
    setBalanceCache(client, marketType, subscriptionHash = undefined, params = {}) {
        if (subscriptionHash in client.subscriptions) {
            return;
        }
        const type = (marketType === 'spot') ? 'spot' : 'contract';
        const messageHash = type + ':fetchBalanceSnapshot';
        if (!(messageHash in client.futures)) {
            client.future(messageHash);
            this.spawn(this.loadBalanceSnapshot, client, messageHash, marketType);
        }
    }
    handleBalance(client, message) {
        //
        // spot
        //
        // [
        //     {
        //         e: 'outboundAccountInfo',
        //         E: '1758226989725',
        //         T: true,
        //         W: true,
        //         D: true,
        //         B: [
        //             {
        //               a: "USDT",
        //               f: "6.37242839",
        //               l: "0",
        //             },
        //         ]
        //     }
        // ]
        //
        // contract
        //
        // [
        //     {
        //         e: 'outboundContractAccountInfo',
        //         E: '1758226989742',
        //         T: true,
        //         W: true,
        //         D: true,
        //         B: [ [Object] ]
        //     }
        // ]
        //
        const channel = this.safeString(message, 'e');
        const data = this.safeList(message, 'B', []);
        const timestamp = this.safeInteger(message, 'E');
        const type = (channel === 'outboundContractAccountInfo') ? 'contract' : 'spot';
        if (!(type in this.balance)) {
            this.balance[type] = {};
        }
        this.balance[type]['info'] = data;
        this.balance[type]['timestamp'] = timestamp;
        this.balance[type]['datetime'] = this.iso8601(timestamp);
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const currencyId = this.safeString(balance, 'a');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['info'] = balance;
            account['used'] = this.safeString(balance, 'l');
            account['free'] = this.safeString(balance, 'f');
            this.balance[type][code] = account;
        }
        this.balance[type] = this.safeBalance(this.balance[type]);
        client.resolve(this.balance[type], type + ':balance');
    }
    async loadBalanceSnapshot(client, messageHash, marketType) {
        const response = await this.fetchBalance({ 'type': marketType });
        const type = (marketType === 'spot') ? 'spot' : 'contract';
        this.balance[type] = this.extend(response, this.safeDict(this.balance, type, {}));
        // don't remove the future from the .futures cache
        const future = client.futures[messageHash];
        future.resolve();
        client.resolve(this.balance[type], type + ':fetchBalanceSnapshot');
        client.resolve(this.balance[type], type + ':balance'); // we should also resolve right away after snapshot, so user doesn't double-fetch balance
    }
    /**
     * @method
     * @name toobit#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#payload-order-update
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        await this.authenticate();
        const market = this.marketOrNull(symbol);
        symbol = this.safeString(market, 'symbol', symbol);
        let messageHash = 'orders';
        if (symbol !== undefined) {
            messageHash = messageHash + ':' + symbol;
        }
        const url = this.getUserStreamUrl();
        const orders = await this.watch(url, messageHash, params, messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    handleOrder(client, message) {
        //
        //    {
        //        "e": "executionReport",
        //        "E": "1758311011844",
        //        "s": "DOGEUSDT",
        //        "c": "1758311011948",
        //        "S": "BUY",
        //        "o": "LIMIT",
        //        "f": "GTC",
        //        "q": "22",
        //        "p": "0.23",
        //        "pt": "INPUT",
        //        "X": "NEW",
        //        "i": "2043255292855185152",
        //        "l": "0", // Last executed quantity
        //        "z": "0", // Cumulative filled quantity
        //        "L": "0", // Last executed price
        //        "n": "0",
        //        "N": "",
        //        "u": true,
        //        "w": true,
        //        "m": false,
        //        "O": "1758311011833",
        //        "U": "1758311011841",
        //        "Z": "0",
        //        "C": false,
        //        "v": "0",
        //        "rp": "0",
        //        "td": "0"
        //    }
        //
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new Cache.ArrayCacheBySymbolById(limit);
        }
        const orders = this.orders;
        const order = this.parseWsOrder(message);
        orders.append(order);
        let messageHash = 'orders';
        client.resolve(orders, messageHash);
        messageHash = 'orders:' + this.safeString(order, 'symbol');
        client.resolve(orders, messageHash);
    }
    parseWsOrder(order, market = undefined) {
        const timestamp = this.safeInteger(order, 'O');
        const marketId = this.safeString(order, 's');
        const symbol = this.safeSymbol(marketId, market);
        const priceType = this.safeStringLower(order, 'pt');
        const rawOrderType = this.safeStringLower(order, 'o');
        let orderType = undefined;
        if (priceType === 'market') {
            orderType = 'market';
        }
        else {
            orderType = rawOrderType;
        }
        const feeCost = this.safeNumber(order, 'n');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': undefined,
            };
        }
        return this.safeOrder({
            'info': order,
            'id': this.safeString(order, 'i'),
            'clientOrderId': this.safeString(order, 'c'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastUpdateTimestamp': this.safeInteger2(order, 'U', 'E'),
            'symbol': symbol,
            'type': orderType,
            'timeInForce': this.safeStringUpper(order, 'f'),
            'postOnly': undefined,
            'side': this.safeStringLower(order, 'S'),
            'price': this.safeString(order, 'L'),
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': this.safeString(order, 'q'),
            'cost': undefined,
            'average': this.safeString(order, 'p'),
            'filled': this.safeString(order, 'z'),
            'remaining': undefined,
            'status': this.parseOrderStatus(this.safeString(order, 'X')),
            'fee': fee,
            'trades': undefined,
        }, market);
    }
    /**
     * @method
     * @name toobit#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#payload-ticket-push
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.unifiedMargin] use unified margin account
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        await this.authenticate();
        const market = this.marketOrNull(symbol);
        symbol = this.safeString(market, 'symbol', symbol);
        let messageHash = 'myTrades';
        if (symbol !== undefined) {
            messageHash = messageHash + ':' + symbol;
        }
        const url = this.getUserStreamUrl();
        const trades = await this.watch(url, messageHash, params, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleMyTrade(client, message) {
        //
        //    {
        //        "e": "ticketInfo",
        //        "E": "1758314657847",
        //        "s": "DOGEUSDT",
        //        "q": "22.0",
        //        "t": "1758314657842",
        //        "p": "0.26667",
        //        "T": "4864732022877055421",
        //        "o": "2043285877770284800",
        //        "c": "1758314657002",
        //        "a": "1783404067076253952",
        //        "m": false,
        //        "S": "BUY"
        //    }
        //
        let myTrades = this.myTrades;
        if (myTrades === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            myTrades = new Cache.ArrayCacheBySymbolById(limit);
        }
        const trade = this.parseMyTrade(message);
        myTrades.append(trade);
        let messageHash = 'myTrades:' + trade['symbol'];
        client.resolve(myTrades, messageHash);
        messageHash = 'myTrades';
        client.resolve(myTrades, messageHash);
    }
    parseMyTrade(trade, market = undefined) {
        const marketId = this.safeString(trade, 's');
        const ts = this.safeString(trade, 't');
        return this.safeTrade({
            'info': trade,
            'id': this.safeString(trade, 'T'),
            'timestamp': ts,
            'datetime': this.iso8601(ts),
            'symbol': this.safeSymbol(marketId, market),
            'order': this.safeString(trade, 'o'),
            'type': undefined,
            'side': this.safeStringLower(trade, 'S'),
            'takerOrMaker': this.safeBool(trade, 'm') ? 'maker' : 'taker',
            'price': this.safeString(trade, 'p'),
            'amount': this.safeString(trade, 'q'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }
    /**
     * @method
     * @name toobit#watchPositions
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#event-position-update
     * @description watch all open positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        await this.authenticate();
        let messageHash = '';
        if (!this.isEmpty(symbols)) {
            symbols = this.marketSymbols(symbols);
            messageHash = '::' + symbols.join(',');
        }
        const url = this.getUserStreamUrl();
        const client = this.client(url);
        await this.authenticate(url);
        this.setPositionsCache(client, symbols);
        const cache = this.positions;
        if (cache === undefined) {
            const snapshot = await client.future('fetchPositionsSnapshot');
            return this.filterBySymbolsSinceLimit(snapshot, symbols, since, limit, true);
        }
        const newPositions = await this.watch(url, messageHash, undefined, messageHash);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit(cache, symbols, since, limit, true);
    }
    setPositionsCache(client, type, symbols = undefined, isPortfolioMargin = false) {
        if (this.positions === undefined) {
            this.positions = {};
        }
        if (type in this.positions) {
            return;
        }
        const fetchPositionsSnapshot = this.handleOption('watchPositions', 'fetchPositionsSnapshot', false);
        if (fetchPositionsSnapshot) {
            const messageHash = type + ':fetchPositionsSnapshot';
            if (!(messageHash in client.futures)) {
                client.future(messageHash);
                this.spawn(this.loadPositionsSnapshot, client, messageHash, type, isPortfolioMargin);
            }
        }
        else {
            this.positions[type] = new Cache.ArrayCacheBySymbolBySide();
        }
    }
    async loadPositionsSnapshot(client, messageHash, type) {
        const params = {
            'type': type,
        };
        const positions = await this.fetchPositions(undefined, params);
        this.positions[type] = new Cache.ArrayCacheBySymbolBySide();
        const cache = this.positions[type];
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            cache.append(position);
        }
        // don't remove the future from the .futures cache
        const future = client.futures[messageHash];
        future.resolve(cache);
        client.resolve(cache, type + ':positions');
    }
    handlePositions(client, message) {
        //
        // [
        //     {
        //         e: 'outboundContractPositionInfo',
        //         E: '1758316454554',
        //         A: '1783404067076253954',
        //         s: 'DOGE-SWAP-USDT',
        //         S: 'LONG',
        //         p: '0',
        //         P: '0',
        //         a: '0',
        //         f: '0.1228',
        //         m: '0',
        //         r: '0',
        //         up: '0',
        //         pr: '0',
        //         pv: '0',
        //         v: '3.0',
        //         mt: 'CROSS',
        //         mm: '0',
        //         mp: '0.265410000000000000'
        //     }
        // ]
        //
        const subscriptions = Object.keys(client.subscriptions);
        const accountType = subscriptions[0];
        if (this.positions === undefined) {
            this.positions = {};
        }
        if (!(accountType in this.positions)) {
            this.positions[accountType] = new Cache.ArrayCacheBySymbolBySide();
        }
        const cache = this.positions[accountType];
        const newPositions = [];
        for (let i = 0; i < message.length; i++) {
            const rawPosition = message[i];
            const position = this.parseWsPosition(rawPosition);
            const timestamp = this.safeInteger(rawPosition, 'E');
            position['timestamp'] = timestamp;
            position['datetime'] = this.iso8601(timestamp);
            newPositions.push(position);
            cache.append(position);
        }
        const messageHashes = this.findMessageHashes(client, accountType + ':positions::');
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
        client.resolve(newPositions, accountType + ':positions');
    }
    parseWsPosition(position, market = undefined) {
        const marketId = this.safeString(position, 's');
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': this.safeSymbol(marketId, undefined),
            'notional': this.omitZero(this.safeString(position, 'pv')),
            'marginMode': this.safeStringLower(position, 'mt'),
            'liquidationPrice': this.safeString(position, 'f'),
            'entryPrice': this.safeString(position, 'p'),
            'unrealizedPnl': this.safeString(position, 'up'),
            'realizedPnl': this.safeNumber(position, 'r'),
            'percentage': undefined,
            'contracts': undefined,
            'contractSize': undefined,
            'markPrice': this.safeString(position, 'mp'),
            'side': this.safeStringLower(position, 'S'),
            'hedged': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'maintenanceMargin': this.safeString(position, 'mm'),
            'maintenanceMarginPercentage': undefined,
            'collateral': undefined,
            'initialMargin': this.omitZero(this.safeString(position, 'm')),
            'initialMarginPercentage': undefined,
            'leverage': this.safeString(position, 'v'),
            'marginRatio': undefined,
        });
    }
    async authenticate(params = {}) {
        const client = this.client(this.getUserStreamUrl());
        const messageHash = 'authenticated';
        const future = client.reusableFuture(messageHash);
        const authenticated = this.safeValue(client.subscriptions, messageHash);
        if (authenticated === undefined) {
            this.checkRequiredCredentials();
            const time = this.milliseconds();
            const lastAuthenticatedTime = this.safeInteger(this.options['ws'], 'lastAuthenticatedTime', 0);
            const listenKeyRefreshRate = this.safeInteger(this.options['ws'], 'listenKeyRefreshRate', 1200000);
            const delay = this.sum(listenKeyRefreshRate, 10000);
            if (time - lastAuthenticatedTime > delay) {
                try {
                    client.subscriptions[messageHash] = true;
                    const response = await this.privatePostApiV1UserDataStream(params);
                    this.options['ws']['listenKey'] = this.safeString(response, 'listenKey');
                    this.options['ws']['lastAuthenticatedTime'] = time;
                    future.resolve(true);
                    this.delay(listenKeyRefreshRate, this.keepAliveListenKey, params);
                }
                catch (e) {
                    const err = new errors.AuthenticationError(this.id + ' ' + this.json(e));
                    client.reject(err, messageHash);
                    if (messageHash in client.subscriptions) {
                        delete client.subscriptions[messageHash];
                    }
                }
            }
        }
        return await future;
    }
    async keepAliveListenKey(params = {}) {
        const options = this.safeValue(this.options, 'ws', {});
        const listenKey = this.safeString(options, 'listenKey');
        if (listenKey === undefined) {
            // A network error happened: we can't renew a listen key that does not exist.
            return;
        }
        try {
            const response = await this.privatePostApiV1UserDataStream(params);
            this.options['ws']['listenKey'] = this.safeString(response, 'listenKey');
            this.options['ws']['lastAuthenticatedTime'] = this.milliseconds();
        }
        catch (error) {
            const url = this.getUserStreamUrl();
            const client = this.client(url);
            const messageHashes = Object.keys(client.futures);
            for (let i = 0; i < messageHashes.length; i++) {
                const messageHash = messageHashes[i];
                client.reject(error, messageHash);
            }
            this.options['ws']['listenKey'] = undefined;
            this.options['ws']['lastAuthenticatedTime'] = 0;
            return;
        }
        // whether or not to schedule another listenKey keepAlive request
        const listenKeyRefreshRate = this.safeInteger(this.options, 'listenKeyRefreshRate', 1200000);
        this.delay(listenKeyRefreshRate, this.keepAliveListenKey, params);
    }
    getUserStreamUrl() {
        return this.urls['api']['ws']['common'] + '/api/v1/ws/' + this.options['ws']['listenKey'];
    }
    handleErrorMessage(client, message) {
        //
        //    {
        //        "code": '-100010',
        //        "desc": "Invalid Symbols!"
        //    }
        //
        const code = this.safeString(message, 'code');
        if (code !== undefined) {
            const desc = this.safeString(message, 'desc');
            const msg = this.id + ' code: ' + code + ' message: ' + desc;
            const exception = new errors.ExchangeError(msg); // c# fix
            client.reject(exception);
            return true;
        }
        return false;
    }
}

exports["default"] = toobit;
