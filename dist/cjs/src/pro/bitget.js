'use strict';

var bitget$1 = require('../bitget.js');
var errors = require('../base/errors.js');
var Precise = require('../base/Precise.js');
var Cache = require('../base/ws/Cache.js');
var sha256 = require('../static_dependencies/noble-hashes/sha256.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class bitget
 * @augments Exchange
 * @description watching delivery future markets is not yet implemented (perpertual future / swap is implemented)
 */
class bitget extends bitget$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'createOrderWs': false,
                'editOrderWs': false,
                'fetchOpenOrdersWs': false,
                'fetchOrderWs': false,
                'cancelOrderWs': false,
                'cancelOrdersWs': false,
                'cancelAllOrdersWs': false,
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': false,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchBidsAsks': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchPositions': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://ws.bitget.com/v2/ws/public',
                        'private': 'wss://ws.bitget.com/v2/ws/private',
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
                // WS timeframes differ from REST timeframes
                'timeframes': {
                    '1m': '1m',
                    '5m': '5m',
                    '15m': '15m',
                    '30m': '30m',
                    '1h': '1H',
                    '4h': '4H',
                    '6h': '6H',
                    '12h': '12H',
                    '1d': '1D',
                    '1w': '1W',
                },
                'watchOrderBook': {
                    'checksum': true,
                },
            },
            'streaming': {
                'ping': this.ping,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        '30001': errors.BadRequest,
                        '30002': errors.AuthenticationError,
                        '30003': errors.BadRequest,
                        '30004': errors.AuthenticationError,
                        '30005': errors.AuthenticationError,
                        '30006': errors.RateLimitExceeded,
                        '30007': errors.RateLimitExceeded,
                        '30011': errors.AuthenticationError,
                        '30012': errors.AuthenticationError,
                        '30013': errors.AuthenticationError,
                        '30014': errors.BadRequest,
                        '30015': errors.AuthenticationError,
                        '30016': errors.BadRequest, // { event: 'error', code: 30016, msg: 'Param error' }
                    },
                    'broad': {},
                },
            },
        });
    }
    getInstType(market, params = {}) {
        let instType = undefined;
        if (market === undefined) {
            [instType, params] = this.handleProductTypeAndParams(undefined, params);
        }
        else if ((market['swap']) || (market['future'])) {
            [instType, params] = this.handleProductTypeAndParams(market, params);
        }
        else {
            instType = 'SPOT';
        }
        let instypeAux = undefined;
        [instypeAux, params] = this.handleOptionAndParams(params, 'getInstType', 'instType', instType);
        instType = instypeAux;
        return [instType, params];
    }
    /**
     * @method
     * @name bitget#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Tickers-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/Tickers-Channel
     * @param {string} symbol unified symbol of the market to watch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const messageHash = 'ticker:' + symbol;
        let instType = undefined;
        [instType, params] = this.getInstType(market, params);
        const args = {
            'instType': instType,
            'channel': 'ticker',
            'instId': market['id'],
        };
        return await this.watchPublic(messageHash, args, params);
    }
    /**
     * @method
     * @name bitget#unWatchTicker
     * @description unsubscribe from the ticker channel
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Tickers-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/Tickers-Channel
     * @param {string} symbol unified symbol of the market to unwatch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    async unWatchTicker(symbol, params = {}) {
        await this.loadMarkets();
        return await this.unWatchChannel(symbol, 'ticker', 'ticker', params);
    }
    /**
     * @method
     * @name bitget#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Tickers-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/Tickers-Channel
     * @param {string[]} symbols unified symbol of the market to watch the tickers for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        const market = this.market(symbols[0]);
        let instType = undefined;
        [instType, params] = this.getInstType(market, params);
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketInner = this.market(symbol);
            const args = {
                'instType': instType,
                'channel': 'ticker',
                'instId': marketInner['id'],
            };
            topics.push(args);
            messageHashes.push('ticker:' + symbol);
        }
        const tickers = await this.watchPublicMultiple(messageHashes, topics, params);
        if (this.newUpdates) {
            const result = {};
            result[tickers['symbol']] = tickers;
            return result;
        }
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    handleTicker(client, message) {
        //
        //     {
        //         "action": "snapshot",
        //         "arg": {
        //             "instType": "SPOT",
        //             "channel": "ticker",
        //             "instId": "BTCUSDT"
        //         },
        //         "data": [
        //             {
        //                 "instId": "BTCUSDT",
        //                 "lastPr": "43528.19",
        //                 "open24h": "42267.78",
        //                 "high24h": "44490.00",
        //                 "low24h": "41401.53",
        //                 "change24h": "0.03879",
        //                 "bidPr": "43528",
        //                 "askPr": "43528.01",
        //                 "bidSz": "0.0334",
        //                 "askSz": "0.1917",
        //                 "baseVolume": "15002.4216",
        //                 "quoteVolume": "648006446.7164",
        //                 "openUtc": "44071.18",
        //                 "changeUtc24h": "-0.01232",
        //                 "ts": "1701842994338"
        //             }
        //         ],
        //         "ts": 1701842994341
        //     }
        //
        this.handleBidAsk(client, message);
        const ticker = this.parseWsTicker(message);
        const symbol = ticker['symbol'];
        this.tickers[symbol] = ticker;
        const messageHash = 'ticker:' + symbol;
        client.resolve(ticker, messageHash);
    }
    parseWsTicker(message, market = undefined) {
        //
        // spot
        //
        //     {
        //         "action": "snapshot",
        //         "arg": {
        //             "instType": "SPOT",
        //             "channel": "ticker",
        //             "instId": "BTCUSDT"
        //         },
        //         "data": [
        //             {
        //                 "instId": "BTCUSDT",
        //                 "lastPr": "43528.19",
        //                 "open24h": "42267.78",
        //                 "high24h": "44490.00",
        //                 "low24h": "41401.53",
        //                 "change24h": "0.03879",
        //                 "bidPr": "43528",
        //                 "askPr": "43528.01",
        //                 "bidSz": "0.0334",
        //                 "askSz": "0.1917",
        //                 "baseVolume": "15002.4216",
        //                 "quoteVolume": "648006446.7164",
        //                 "openUtc": "44071.18",
        //                 "changeUtc24h": "-0.01232",
        //                 "ts": "1701842994338"
        //             }
        //         ],
        //         "ts": 1701842994341
        //     }
        //
        // contract
        //
        //     {
        //         "action": "snapshot",
        //         "arg": {
        //             "instType": "USDT-FUTURES",
        //             "channel": "ticker",
        //             "instId": "BTCUSDT"
        //         },
        //         "data": [
        //             {
        //                 "instId": "BTCUSDT",
        //                 "lastPr": "43480.4",
        //                 "bidPr": "43476.3",
        //                 "askPr": "43476.8",
        //                 "bidSz": "0.1",
        //                 "askSz": "3.055",
        //                 "open24h": "42252.3",
        //                 "high24h": "44518.2",
        //                 "low24h": "41387.0",
        //                 "change24h": "0.03875",
        //                 "fundingRate": "0.000096",
        //                 "nextFundingTime": "1701849600000",
        //                 "markPrice": "43476.4",
        //                 "indexPrice": "43478.4",
        //                 "holdingAmount": "50670.787",
        //                 "baseVolume": "120187.104",
        //                 "quoteVolume": "5167385048.693",
        //                 "openUtc": "44071.4",
        //                 "symbolType": "1",
        //                 "symbol": "BTCUSDT",
        //                 "deliveryPrice": "0",
        //                 "ts": "1701843962811"
        //             }
        //         ],
        //         "ts": 1701843962812
        //     }
        //
        const arg = this.safeValue(message, 'arg', {});
        const data = this.safeValue(message, 'data', []);
        const ticker = this.safeValue(data, 0, {});
        const timestamp = this.safeInteger(ticker, 'ts');
        const instType = this.safeString(arg, 'instType');
        const marketType = (instType === 'SPOT') ? 'spot' : 'contract';
        const marketId = this.safeString(ticker, 'instId');
        market = this.safeMarket(marketId, market, undefined, marketType);
        const close = this.safeString(ticker, 'lastPr');
        const changeDecimal = this.safeString(ticker, 'change24h');
        const change = Precise["default"].stringMul(changeDecimal, '100');
        return this.safeTicker({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'high24h'),
            'low': this.safeString(ticker, 'low24h'),
            'bid': this.safeString(ticker, 'bidPr'),
            'bidVolume': this.safeString(ticker, 'bidSz'),
            'ask': this.safeString(ticker, 'askPr'),
            'askVolume': this.safeString(ticker, 'askSz'),
            'vwap': undefined,
            'open': this.safeString(ticker, 'open24h'),
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': change,
            'average': undefined,
            'baseVolume': this.safeString(ticker, 'baseVolume'),
            'quoteVolume': this.safeString(ticker, 'quoteVolume'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name bitget#watchBidsAsks
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Tickers-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/Tickers-Channel
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchBidsAsks(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        const market = this.market(symbols[0]);
        let instType = undefined;
        [instType, params] = this.getInstType(market, params);
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketInner = this.market(symbol);
            const args = {
                'instType': instType,
                'channel': 'ticker',
                'instId': marketInner['id'],
            };
            topics.push(args);
            messageHashes.push('bidask:' + symbol);
        }
        const tickers = await this.watchPublicMultiple(messageHashes, topics, params);
        if (this.newUpdates) {
            const result = {};
            result[tickers['symbol']] = tickers;
            return result;
        }
        return this.filterByArray(this.bidsasks, 'symbol', symbols);
    }
    handleBidAsk(client, message) {
        const ticker = this.parseWsBidAsk(message);
        const symbol = ticker['symbol'];
        this.bidsasks[symbol] = ticker;
        const messageHash = 'bidask:' + symbol;
        client.resolve(ticker, messageHash);
    }
    parseWsBidAsk(message, market = undefined) {
        const arg = this.safeValue(message, 'arg', {});
        const data = this.safeValue(message, 'data', []);
        const ticker = this.safeValue(data, 0, {});
        const timestamp = this.safeInteger(ticker, 'ts');
        const instType = this.safeString(arg, 'instType');
        const marketType = (instType === 'SPOT') ? 'spot' : 'contract';
        const marketId = this.safeString(ticker, 'instId');
        market = this.safeMarket(marketId, market, undefined, marketType);
        return this.safeTicker({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'ask': this.safeString(ticker, 'askPr'),
            'askVolume': this.safeString(ticker, 'askSz'),
            'bid': this.safeString(ticker, 'bidPr'),
            'bidVolume': this.safeString(ticker, 'bidSz'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name bitget#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Candlesticks-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/Candlesticks-Channel
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const timeframes = this.safeValue(this.options, 'timeframes');
        const interval = this.safeString(timeframes, timeframe);
        const messageHash = 'candles:' + timeframe + ':' + symbol;
        let instType = undefined;
        [instType, params] = this.getInstType(market, params);
        const args = {
            'instType': instType,
            'channel': 'candle' + interval,
            'instId': market['id'],
        };
        const ohlcv = await this.watchPublic(messageHash, args, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    /**
     * @method
     * @name bitget#unWatchOHLCV
     * @description unsubscribe from the ohlcv channel
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Candlesticks-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/Candlesticks-Channel
     * @param {string} symbol unified symbol of the market to unwatch the ohlcv for
     * @param {string} [timeframe] the period for the ratio, default is 1 minute
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOHLCV(symbol, timeframe = '1m', params = {}) {
        await this.loadMarkets();
        const timeframes = this.safeDict(this.options, 'timeframes');
        const interval = this.safeString(timeframes, timeframe);
        const channel = 'candle' + interval;
        return await this.unWatchChannel(symbol, channel, 'candles:' + timeframe, params);
    }
    handleOHLCV(client, message) {
        //
        //     {
        //         "action": "snapshot",
        //         "arg": {
        //             "instType": "SPOT",
        //             "channel": "candle1m",
        //             "instId": "BTCUSDT"
        //         },
        //         "data": [
        //             [
        //                 "1701871620000",
        //                 "44080.23",
        //                 "44080.23",
        //                 "44028.5",
        //                 "44028.51",
        //                 "9.9287",
        //                 "437404.105512",
        //                 "437404.105512"
        //             ],
        //             [
        //                 "1701871680000",
        //                 "44028.51",
        //                 "44108.11",
        //                 "44028.5",
        //                 "44108.11",
        //                 "17.139",
        //                 "755436.870643",
        //                 "755436.870643"
        //             ],
        //         ],
        //         "ts": 1701901610417
        //     }
        //
        const arg = this.safeValue(message, 'arg', {});
        const instType = this.safeString(arg, 'instType');
        const marketType = (instType === 'SPOT') ? 'spot' : 'contract';
        const marketId = this.safeString(arg, 'instId');
        const market = this.safeMarket(marketId, undefined, undefined, marketType);
        const symbol = market['symbol'];
        this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
        const channel = this.safeString(arg, 'channel');
        const interval = channel.replace('candle', '');
        const timeframes = this.safeValue(this.options, 'timeframes');
        const timeframe = this.findTimeframe(interval, timeframes);
        let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            stored = new Cache.ArrayCacheByTimestamp(limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const data = this.safeValue(message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const parsed = this.parseWsOHLCV(data[i], market);
            stored.append(parsed);
        }
        const messageHash = 'candles:' + timeframe + ':' + symbol;
        client.resolve(stored, messageHash);
    }
    parseWsOHLCV(ohlcv, market = undefined) {
        //
        //     [
        //         "1701871620000",  // timestamp
        //         "44080.23", // open
        //         "44080.23", // high
        //         "44028.5", // low
        //         "44028.51", // close
        //         "9.9287", // base volume
        //         "437404.105512", // quote volume
        //         "437404.105512" // USDT volume
        //     ]
        //
        const volumeIndex = (market['inverse']) ? 6 : 5;
        return [
            this.safeInteger(ohlcv, 0),
            this.safeNumber(ohlcv, 1),
            this.safeNumber(ohlcv, 2),
            this.safeNumber(ohlcv, 3),
            this.safeNumber(ohlcv, 4),
            this.safeNumber(ohlcv, volumeIndex),
        ];
    }
    /**
     * @method
     * @name bitget#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Depth-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/Order-Book-Channel
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        return await this.watchOrderBookForSymbols([symbol], limit, params);
    }
    /**
     * @method
     * @name bitget#unWatchOrderBook
     * @description unsubscribe from the orderbook channel
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Depth-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/Order-Book-Channel
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] orderbook limit, default is undefined
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBook(symbol, params = {}) {
        await this.loadMarkets();
        let channel = 'books';
        const limit = this.safeInteger(params, 'limit');
        if ((limit === 1) || (limit === 5) || (limit === 15)) {
            params = this.omit(params, 'limit');
            channel += limit.toString();
        }
        return await this.unWatchChannel(symbol, channel, 'orderbook', params);
    }
    async unWatchChannel(symbol, channel, messageHashTopic, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const messageHash = 'unsubscribe:' + messageHashTopic + ':' + market['symbol'];
        let instType = undefined;
        [instType, params] = this.getInstType(market, params);
        const args = {
            'instType': instType,
            'channel': channel,
            'instId': market['id'],
        };
        return await this.unWatchPublic(messageHash, args, params);
    }
    /**
     * @method
     * @name bitget#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Depth-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/Order-Book-Channel
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols(symbols, limit = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        let channel = 'books';
        let incrementalFeed = true;
        if ((limit === 1) || (limit === 5) || (limit === 15)) {
            channel += limit.toString();
            incrementalFeed = false;
        }
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            let instType = undefined;
            [instType, params] = this.getInstType(market, params);
            const args = {
                'instType': instType,
                'channel': channel,
                'instId': market['id'],
            };
            topics.push(args);
            messageHashes.push('orderbook:' + symbol);
        }
        const orderbook = await this.watchPublicMultiple(messageHashes, topics, params);
        if (incrementalFeed) {
            return orderbook.limit();
        }
        else {
            return orderbook;
        }
    }
    handleOrderBook(client, message) {
        //
        //   {
        //       "action":"snapshot",
        //       "arg":{
        //          "instType":"SPOT",
        //          "channel":"books5",
        //          "instId":"BTCUSDT"
        //       },
        //       "data":[
        //          {
        //             "asks":[
        //                ["21041.11","0.0445"],
        //                ["21041.16","0.0411"],
        //                ["21041.21","0.0421"],
        //                ["21041.26","0.0811"],
        //                ["21041.65","1.9465"]
        //             ],
        //             "bids":[
        //                ["21040.76","0.0417"],
        //                ["21040.71","0.0434"],
        //                ["21040.66","0.1141"],
        //                ["21040.61","0.3004"],
        //                ["21040.60","1.3357"]
        //             ],
        //             "checksum": -1367582038,
        //             "ts":"1656413855484"
        //          }
        //       ]
        //   }
        //
        const arg = this.safeValue(message, 'arg');
        const channel = this.safeString(arg, 'channel');
        const instType = this.safeString(arg, 'instType');
        const marketType = (instType === 'SPOT') ? 'spot' : 'contract';
        const marketId = this.safeString(arg, 'instId');
        const market = this.safeMarket(marketId, undefined, undefined, marketType);
        const symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        const data = this.safeValue(message, 'data');
        const rawOrderBook = this.safeValue(data, 0);
        const timestamp = this.safeInteger(rawOrderBook, 'ts');
        const incrementalBook = channel === 'books';
        if (incrementalBook) {
            // storedOrderBook = this.safeValue (this.orderbooks, symbol);
            if (!(symbol in this.orderbooks)) {
                // const ob = this.orderBook ({});
                const ob = this.countedOrderBook({});
                ob['symbol'] = symbol;
                this.orderbooks[symbol] = ob;
            }
            const storedOrderBook = this.orderbooks[symbol];
            const asks = this.safeValue(rawOrderBook, 'asks', []);
            const bids = this.safeValue(rawOrderBook, 'bids', []);
            this.handleDeltas(storedOrderBook['asks'], asks);
            this.handleDeltas(storedOrderBook['bids'], bids);
            storedOrderBook['timestamp'] = timestamp;
            storedOrderBook['datetime'] = this.iso8601(timestamp);
            const checksum = this.handleOption('watchOrderBook', 'checksum', true);
            const isSnapshot = this.safeString(message, 'action') === 'snapshot'; // snapshot does not have a checksum
            if (!isSnapshot && checksum) {
                const storedAsks = storedOrderBook['asks'];
                const storedBids = storedOrderBook['bids'];
                const asksLength = storedAsks.length;
                const bidsLength = storedBids.length;
                const payloadArray = [];
                for (let i = 0; i < 25; i++) {
                    if (i < bidsLength) {
                        payloadArray.push(storedBids[i][2][0]);
                        payloadArray.push(storedBids[i][2][1]);
                    }
                    if (i < asksLength) {
                        payloadArray.push(storedAsks[i][2][0]);
                        payloadArray.push(storedAsks[i][2][1]);
                    }
                }
                const payload = payloadArray.join(':');
                const calculatedChecksum = this.crc32(payload, true);
                const responseChecksum = this.safeInteger(rawOrderBook, 'checksum');
                if (calculatedChecksum !== responseChecksum) {
                    // if (messageHash in client.subscriptions) {
                    //     // delete client.subscriptions[messageHash];
                    //     // delete this.orderbooks[symbol];
                    // }
                    this.spawn(this.handleCheckSumError, client, symbol, messageHash);
                    return;
                }
            }
        }
        else {
            const orderbook = this.orderBook({});
            const parsedOrderbook = this.parseOrderBook(rawOrderBook, symbol, timestamp);
            orderbook.reset(parsedOrderbook);
            this.orderbooks[symbol] = orderbook;
        }
        client.resolve(this.orderbooks[symbol], messageHash);
    }
    async handleCheckSumError(client, symbol, messageHash) {
        await this.unWatchOrderBook(symbol);
        const error = new errors.ChecksumError(this.id + ' ' + this.orderbookChecksumMessage(symbol));
        client.reject(error, messageHash);
    }
    handleDelta(bookside, delta) {
        const bidAsk = this.parseBidAsk(delta, 0, 1);
        // we store the string representations in the orderbook for checksum calculation
        // this simplifies the code for generating checksums as we do not need to do any complex number transformations
        bidAsk.push(delta);
        bookside.storeArray(bidAsk);
    }
    handleDeltas(bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta(bookside, deltas[i]);
        }
    }
    /**
     * @method
     * @name bitget#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Trades-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/New-Trades-Channel
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        return await this.watchTradesForSymbols([symbol], since, limit, params);
    }
    /**
     * @method
     * @name bitget#watchTradesForSymbols
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Trades-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/New-Trades-Channel
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTradesForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new errors.ArgumentsRequired(this.id + ' watchTradesForSymbols() requires a non-empty array of symbols');
        }
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            let instType = undefined;
            [instType, params] = this.getInstType(market, params);
            const args = {
                'instType': instType,
                'channel': 'trade',
                'instId': market['id'],
            };
            topics.push(args);
            messageHashes.push('trade:' + symbol);
        }
        const trades = await this.watchPublicMultiple(messageHashes, topics, params);
        if (this.newUpdates) {
            const first = this.safeValue(trades, 0);
            const tradeSymbol = this.safeString(first, 'symbol');
            limit = trades.getLimit(tradeSymbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    /**
     * @method
     * @name bitget#unWatchTrades
     * @description unsubscribe from the trades channel
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Trades-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/New-Trades-Channel
     * @param {string} symbol unified symbol of the market to unwatch the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    async unWatchTrades(symbol, params = {}) {
        await this.loadMarkets();
        return await this.unWatchChannel(symbol, 'trade', 'trade', params);
    }
    handleTrades(client, message) {
        //
        //     {
        //         "action": "snapshot",
        //         "arg": { "instType": "SPOT", "channel": "trade", "instId": "BTCUSDT" },
        //         "data": [
        //             {
        //                 "ts": "1701910980366",
        //                 "price": "43854.01",
        //                 "size": "0.0535",
        //                 "side": "buy",
        //                 "tradeId": "1116461060594286593"
        //             },
        //         ],
        //         "ts": 1701910980730
        //     }
        //
        const arg = this.safeValue(message, 'arg', {});
        const instType = this.safeString(arg, 'instType');
        const marketType = (instType === 'SPOT') ? 'spot' : 'contract';
        const marketId = this.safeString(arg, 'instId');
        const market = this.safeMarket(marketId, undefined, undefined, marketType);
        const symbol = market['symbol'];
        let stored = this.safeValue(this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            stored = new Cache.ArrayCache(limit);
            this.trades[symbol] = stored;
        }
        const data = this.safeList(message, 'data', []);
        const length = data.length;
        // fix chronological order by reversing
        for (let i = 0; i < length; i++) {
            const index = length - i - 1;
            const rawTrade = data[index];
            const parsed = this.parseWsTrade(rawTrade, market);
            stored.append(parsed);
        }
        const messageHash = 'trade:' + symbol;
        client.resolve(stored, messageHash);
    }
    parseWsTrade(trade, market = undefined) {
        //
        //     {
        //         "ts": "1701910980366",
        //         "price": "43854.01",
        //         "size": "0.0535",
        //         "side": "buy",
        //         "tradeId": "1116461060594286593"
        //     }
        // swap private
        //
        //            {
        //               "orderId": "1169142761031114781",
        //               "tradeId": "1169142761312637004",
        //               "symbol": "LTCUSDT",
        //               "orderType": "market",
        //               "side": "buy",
        //               "price": "80.87",
        //               "baseVolume": "0.1",
        //               "quoteVolume": "8.087",
        //               "profit": "0",
        //               "tradeSide": "open",
        //               "posMode": "hedge_mode",
        //               "tradeScope": "taker",
        //               "feeDetail": [
        //                  {
        //                     "feeCoin": "USDT",
        //                     "deduction": "no",
        //                     "totalDeductionFee": "0",
        //                     "totalFee": "-0.0048522"
        //                  }
        //               ],
        //               "cTime": "1714471276596",
        //               "uTime": "1714471276596"
        //            }
        // spot private
        //        {
        //           "orderId": "1169142457356959747",
        //           "tradeId": "1169142457636958209",
        //           "symbol": "LTCUSDT",
        //           "orderType": "market",
        //           "side": "buy",
        //           "priceAvg": "81.069",
        //           "size": "0.074",
        //           "amount": "5.999106",
        //           "tradeScope": "taker",
        //           "feeDetail": [
        //              {
        //                 "feeCoin": "LTC",
        //                 "deduction": "no",
        //                 "totalDeductionFee": "0",
        //                 "totalFee": "0.000074"
        //              }
        //           ],
        //           "cTime": "1714471204194",
        //           "uTime": "1714471204194"
        //        }
        //
        const instId = this.safeString2(trade, 'symbol', 'instId');
        const posMode = this.safeString(trade, 'posMode');
        const defaultType = (posMode !== undefined) ? 'contract' : 'spot';
        if (market === undefined) {
            market = this.safeMarket(instId, undefined, undefined, defaultType);
        }
        const timestamp = this.safeIntegerN(trade, ['uTime', 'cTime', 'ts']);
        const feeDetail = this.safeList(trade, 'feeDetail', []);
        const first = this.safeDict(feeDetail, 0);
        let fee = undefined;
        if (first !== undefined) {
            const feeCurrencyId = this.safeString(first, 'feeCoin');
            const feeCurrencyCode = this.safeCurrencyCode(feeCurrencyId);
            fee = {
                'cost': Precise["default"].stringAbs(this.safeString(first, 'totalFee')),
                'currency': feeCurrencyCode,
            };
        }
        return this.safeTrade({
            'info': trade,
            'id': this.safeString(trade, 'tradeId'),
            'order': this.safeString(trade, 'orderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': this.safeString(trade, 'orderType'),
            'side': this.safeString(trade, 'side'),
            'takerOrMaker': this.safeString(trade, 'tradeScope'),
            'price': this.safeString2(trade, 'priceAvg', 'price'),
            'amount': this.safeString2(trade, 'size', 'baseVolume'),
            'cost': this.safeString2(trade, 'amount', 'quoteVolume'),
            'fee': fee,
        }, market);
    }
    /**
     * @method
     * @name bitget#watchPositions
     * @description watch all open positions
     * @see https://www.bitget.com/api-doc/contract/websocket/private/Positions-Channel
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @param {string} [params.instType] one of 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES', default is 'USDT-FUTURES'
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        let messageHash = '';
        const subscriptionHash = 'positions';
        let instType = 'USDT-FUTURES';
        symbols = this.marketSymbols(symbols);
        if (!this.isEmpty(symbols)) {
            market = this.getMarketFromSymbols(symbols);
            [instType, params] = this.getInstType(market, params);
        }
        messageHash = instType + ':positions' + messageHash;
        const args = {
            'instType': instType,
            'channel': 'positions',
            'instId': 'default',
        };
        const newPositions = await this.watchPrivate(messageHash, subscriptionHash, args, params);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit(newPositions, symbols, since, limit, true);
    }
    handlePositions(client, message) {
        //
        //     {
        //         "action": "snapshot",
        //         "arg": {
        //             "instType": "USDT-FUTURES",
        //             "channel": "positions",
        //             "instId": "default"
        //         },
        //         "data": [
        //             {
        //                 "posId": "926036334386778112",
        //                 "instId": "BTCUSDT",
        //                 "marginCoin": "USDT",
        //                 "marginSize": "2.19245",
        //                 "marginMode": "crossed",
        //                 "holdSide": "long",
        //                 "posMode": "hedge_mode",
        //                 "total": "0.001",
        //                 "available": "0.001",
        //                 "frozen": "0",
        //                 "openPriceAvg": "43849",
        //                 "leverage": 20,
        //                 "achievedProfits": "0",
        //                 "unrealizedPL": "-0.0032",
        //                 "unrealizedPLR": "-0.00145955438",
        //                 "liquidationPrice": "17629.684814834",
        //                 "keepMarginRate": "0.004",
        //                 "marginRate": "0.007634649185",
        //                 "cTime": "1652331666985",
        //                 "uTime": "1701913016923",
        //                 "autoMargin": "off"
        //             },
        //             ...
        //         ]
        //         "ts": 1701913043767
        //     }
        //
        const arg = this.safeValue(message, 'arg', {});
        const instType = this.safeString(arg, 'instType', '');
        if (this.positions === undefined) {
            this.positions = {};
        }
        if (!(instType in this.positions)) {
            this.positions[instType] = new Cache.ArrayCacheBySymbolBySide();
        }
        const cache = this.positions[instType];
        const rawPositions = this.safeValue(message, 'data', []);
        const dataLength = rawPositions.length;
        if (dataLength === 0) {
            return;
        }
        const newPositions = [];
        for (let i = 0; i < rawPositions.length; i++) {
            const rawPosition = rawPositions[i];
            const marketId = this.safeString(rawPosition, 'instId');
            const market = this.safeMarket(marketId, undefined, undefined, 'contract');
            const position = this.parseWsPosition(rawPosition, market);
            newPositions.push(position);
            cache.append(position);
        }
        const messageHashes = this.findMessageHashes(client, instType + ':positions::');
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
        client.resolve(newPositions, instType + ':positions');
    }
    parseWsPosition(position, market = undefined) {
        //
        //     {
        //         "posId": "926036334386778112",
        //         "instId": "BTCUSDT",
        //         "marginCoin": "USDT",
        //         "marginSize": "2.19245",
        //         "marginMode": "crossed",
        //         "holdSide": "long",
        //         "posMode": "hedge_mode",
        //         "total": "0.001",
        //         "available": "0.001",
        //         "frozen": "0",
        //         "openPriceAvg": "43849",
        //         "leverage": 20,
        //         "achievedProfits": "0",
        //         "unrealizedPL": "-0.0032",
        //         "unrealizedPLR": "-0.00145955438",
        //         "liquidationPrice": "17629.684814834",
        //         "keepMarginRate": "0.004",
        //         "marginRate": "0.007634649185",
        //         "cTime": "1652331666985",
        //         "uTime": "1701913016923",
        //         "autoMargin": "off"
        //     }
        //
        const marketId = this.safeString(position, 'instId');
        const marginModeId = this.safeString(position, 'marginMode');
        const marginMode = this.getSupportedMapping(marginModeId, {
            'crossed': 'cross',
            'isolated': 'isolated',
        });
        const hedgedId = this.safeString(position, 'posMode');
        const hedged = (hedgedId === 'hedge_mode') ? true : false;
        const timestamp = this.safeInteger2(position, 'uTime', 'cTime');
        const percentageDecimal = this.safeString(position, 'unrealizedPLR');
        const percentage = Precise["default"].stringMul(percentageDecimal, '100');
        let contractSize = undefined;
        if (market !== undefined) {
            contractSize = market['contractSize'];
        }
        return this.safePosition({
            'info': position,
            'id': this.safeString(position, 'posId'),
            'symbol': this.safeSymbol(marketId, market, undefined, 'contract'),
            'notional': undefined,
            'marginMode': marginMode,
            'liquidationPrice': this.safeNumber(position, 'liquidationPrice'),
            'entryPrice': this.safeNumber(position, 'openPriceAvg'),
            'unrealizedPnl': this.safeNumber(position, 'unrealizedPL'),
            'percentage': this.parseNumber(percentage),
            'contracts': this.safeNumber(position, 'total'),
            'contractSize': contractSize,
            'markPrice': undefined,
            'side': this.safeString(position, 'holdSide'),
            'hedged': hedged,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': this.safeNumber(position, 'keepMarginRate'),
            'collateral': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'leverage': this.safeNumber(position, 'leverage'),
            'marginRatio': this.safeNumber(position, 'marginRate'),
        });
    }
    /**
     * @method
     * @name bitget#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://www.bitget.com/api-doc/spot/websocket/private/Order-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/private/Order-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/private/Plan-Order-Channel
     * @see https://www.bitget.com/api-doc/margin/cross/websocket/private/Cross-Orders
     * @see https://www.bitget.com/api-doc/margin/isolated/websocket/private/Isolate-Orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] *contract only* set to true for watching trigger orders
     * @param {string} [params.marginMode] 'isolated' or 'cross' for watching spot margin orders]
     * @param {string} [params.type] 'spot', 'swap'
     * @param {string} [params.subType] 'linear', 'inverse'
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        let marketId = undefined;
        let isTrigger = undefined;
        [isTrigger, params] = this.isTriggerOrder(params);
        let messageHash = (isTrigger) ? 'triggerOrder' : 'order';
        let subscriptionHash = 'order:trades';
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
            marketId = market['id'];
            messageHash = messageHash + ':' + symbol;
        }
        const productType = this.safeString(params, 'productType');
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('watchOrders', market, params);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('watchOrders', market, params, 'linear');
        if ((type === 'spot' || type === 'margin') && (symbol === undefined)) {
            marketId = 'default';
        }
        if ((productType === undefined) && (type !== 'spot') && (symbol === undefined)) {
            messageHash = messageHash + ':' + subType;
        }
        else if (productType === 'USDT-FUTURES') {
            messageHash = messageHash + ':linear';
        }
        else if (productType === 'COIN-FUTURES') {
            messageHash = messageHash + ':inverse';
        }
        else if (productType === 'USDC-FUTURES') {
            messageHash = messageHash + ':usdcfutures'; // non unified channel
        }
        let instType = undefined;
        if (market === undefined && type === 'spot') {
            instType = 'SPOT';
        }
        else {
            [instType, params] = this.getInstType(market, params);
        }
        if (type === 'spot') {
            subscriptionHash = subscriptionHash + ':' + symbol;
        }
        if (isTrigger) {
            subscriptionHash = subscriptionHash + ':stop'; // we don't want to re-use the same subscription hash for stop orders
        }
        const instId = (type === 'spot' || type === 'margin') ? marketId : 'default'; // different from other streams here the 'rest' id is required for spot markets, contract markets require default here
        let channel = isTrigger ? 'orders-algo' : 'orders';
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('watchOrders', params);
        if (marginMode !== undefined) {
            instType = 'MARGIN';
            messageHash = messageHash + ':' + marginMode;
            if (marginMode === 'isolated') {
                channel = 'orders-isolated';
            }
            else {
                channel = 'orders-crossed';
            }
        }
        subscriptionHash = subscriptionHash + ':' + instType;
        const args = {
            'instType': instType,
            'channel': channel,
            'instId': instId,
        };
        const orders = await this.watchPrivate(messageHash, subscriptionHash, args, params);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    handleOrder(client, message) {
        //
        // spot
        //
        //     {
        //         "action": "snapshot",
        //         "arg": { "instType": "SPOT", "channel": "orders", "instId": "BTCUSDT" },
        //         "data": [
        //             // see all examples in parseWsOrder
        //         ],
        //         "ts": 1701923297285
        //     }
        //
        // contract
        //
        //     {
        //         "action": "snapshot",
        //         "arg": { "instType": "USDT-FUTURES", "channel": "orders", "instId": "default" },
        //         "data": [
        //             // see all examples in parseWsOrder
        //         ],
        //         "ts": 1701920595879
        //     }
        //
        // isolated and cross margin
        //
        //     {
        //         "action": "snapshot",
        //         "arg": { "instType": "MARGIN", "channel": "orders-crossed", "instId": "BTCUSDT" },
        //         "data": [
        //             // see examples in parseWsOrder
        //         ],
        //         "ts": 1701923982497
        //     }
        //
        const arg = this.safeDict(message, 'arg', {});
        const channel = this.safeString(arg, 'channel');
        const instType = this.safeString(arg, 'instType');
        const argInstId = this.safeString(arg, 'instId');
        let marketType = undefined;
        if (instType === 'SPOT') {
            marketType = 'spot';
        }
        else if (instType === 'MARGIN') {
            marketType = 'spot';
        }
        else {
            marketType = 'contract';
        }
        const isLinearSwap = (instType === 'USDT-FUTURES');
        const isInverseSwap = (instType === 'COIN-FUTURES');
        const isUSDCFutures = (instType === 'USDC-FUTURES');
        const data = this.safeValue(message, 'data', []);
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new Cache.ArrayCacheBySymbolById(limit);
            this.triggerOrders = new Cache.ArrayCacheBySymbolById(limit);
        }
        const isTrigger = (channel === 'orders-algo') || (channel === 'ordersAlgo');
        const stored = isTrigger ? this.triggerOrders : this.orders;
        const messageHash = isTrigger ? 'triggerOrder' : 'order';
        const marketSymbols = {};
        for (let i = 0; i < data.length; i++) {
            const order = data[i];
            const marketId = this.safeString(order, 'instId', argInstId);
            const market = this.safeMarket(marketId, undefined, undefined, marketType);
            const parsed = this.parseWsOrder(order, market);
            stored.append(parsed);
            const symbol = parsed['symbol'];
            marketSymbols[symbol] = true;
        }
        const keys = Object.keys(marketSymbols);
        for (let i = 0; i < keys.length; i++) {
            const symbol = keys[i];
            let innerMessageHash = messageHash + ':' + symbol;
            if (channel === 'orders-crossed') {
                innerMessageHash = innerMessageHash + ':cross';
            }
            else if (channel === 'orders-isolated') {
                innerMessageHash = innerMessageHash + ':isolated';
            }
            client.resolve(stored, innerMessageHash);
        }
        client.resolve(stored, messageHash);
        if (isLinearSwap) {
            client.resolve(stored, 'order:linear');
        }
        if (isInverseSwap) {
            client.resolve(stored, 'order:inverse');
        }
        if (isUSDCFutures) {
            client.resolve(stored, 'order:usdcfutures');
        }
    }
    parseWsOrder(order, market = undefined) {
        //
        // spot
        //
        //   {
        //         instId: 'EOSUSDT',
        //         orderId: '1171779081105780739',
        //         price: '0.81075', // limit price, field not present for market orders
        //         clientOid: 'a2330139-1d04-4d78-98be-07de3cfd1055',
        //         notional: '5.675250', // this is not cost! but notional
        //         newSize: '7.0000', // this is not cost! quanity (for limit order or market sell) or cost (for market buy order)
        //         size: '5.6752', // this is not cost, neither quanity, but notional! this field for "spot" can be ignored at all
        //         // Note: for limit order (even filled) we don't have cost value in response, only in market order
        //         orderType: 'limit', // limit, market
        //         force: 'gtc',
        //         side: 'buy',
        //         accBaseVolume: '0.0000', // in case of 'filled', this would be set (for limit orders, this is the only indicator of the amount filled)
        //         priceAvg: '0.00000', // in case of 'filled', this would be set
        //         status: 'live', // live, filled, partially_filled
        //         cTime: '1715099824215',
        //         uTime: '1715099824215',
        //         feeDetail: [],
        //         enterPointSource: 'API'
        //                   #### trigger order has these additional fields: ####
        //         "triggerPrice": "35100",
        //         "price": "35100", // this is same as trigger price
        //         "executePrice": "35123", // this is limit price
        //         "triggerType": "fill_price",
        //         "planType": "amount",
        //                   #### in case order had a partial fill: ####
        //         fillPrice: '35123',
        //         tradeId: '1171775539946528779',
        //         baseVolume: '7', // field present in market order
        //         fillTime: '1715098979937',
        //         fillFee: '-0.0069987',
        //         fillFeeCoin: 'BTC',
        //         tradeScope: 'T',
        //    }
        //
        // contract
        //
        //     {
        //         accBaseVolume: '0', // total amount filled during lifetime for order
        //         cTime: '1715065875539',
        //         clientOid: '1171636690041344003',
        //         enterPointSource: 'API',
        //         feeDetail: [ {
        //             "feeCoin": "USDT",
        //             "fee": "-0.162003"
        //         } ],
        //         force: 'gtc',
        //         instId: 'SEOSSUSDT',
        //         leverage: '10',
        //         marginCoin: 'USDT',
        //         marginMode: 'crossed',
        //         notionalUsd: '10.4468',
        //         orderId: '1171636690028761089',
        //         orderType: 'market',
        //         posMode: 'hedge_mode', // one_way_mode, hedge_mode
        //         posSide: 'short', // short, long, net
        //         price: '0', // zero for market order
        //         reduceOnly: 'no',
        //         side: 'sell',
        //         size: '13', // this is contracts amount
        //         status: 'live', // live, filled, cancelled
        //         tradeSide: 'open',
        //         uTime: '1715065875539'
        //                   #### when filled order is incoming, these additional fields are present too: ###
        //         baseVolume: '9', // amount filled for the incoming update/trade
        //         accBaseVolume: '13', // i.e. 9 has been filled from 13 amount (this value is same as 'size')
        //         fillFee: '-0.0062712',
        //         fillFeeCoin: 'SUSDT',
        //         fillNotionalUsd: '10.452',
        //         fillPrice: '0.804',
        //         fillTime: '1715065875605',
        //         pnl: '0',
        //         priceAvg: '0.804',
        //         tradeId: '1171636690314407937',
        //         tradeScope: 'T',
        //                   #### trigger order has these additional fields:
        //         "triggerPrice": "0.800000000",
        //         "price": "0.800000000",  // <-- this is same as trigger price, actual limit-price is not present in initial response
        //         "triggerType": "mark_price",
        //         "triggerTime": "1715082796679",
        //         "planType": "pl",
        //         "actualSize": "0.000000000",
        //         "stopSurplusTriggerType": "fill_price",
        //         "stopLossTriggerType": "fill_price",
        //     }
        //
        // isolated and cross margin
        //
        //     {
        //         enterPointSource: "web",
        //         feeDetail: [
        //           {
        //             feeCoin: "AAVE",
        //             deduction: "no",
        //             totalDeductionFee: "0",
        //             totalFee: "-0.00010740",
        //           },
        //         ],
        //         force: "gtc",
        //         orderType: "limit",
        //         price: "93.170000000",
        //         fillPrice: "93.170000000",
        //         baseSize: "0.110600000", // total amount of order
        //         quoteSize: "10.304602000", // total cost of order (independently if order is filled or pending)
        //         baseVolume: "0.107400000", // filled amount of order (during order's lifecycle, and not for this specific incoming update)
        //         fillTotalAmount: "10.006458000", // filled cost of order (during order's lifecycle, and not for this specific incoming update)
        //         side: "buy",
        //         status: "partially_filled",
        //         cTime: "1717875017306",
        //         clientOid: "b57afe789a06454e9c560a2aab7f7201",
        //         loanType: "auto-loan",
        //         orderId: "1183419084588060673",
        //       }
        //
        const isSpot = !('posMode' in order);
        const isMargin = ('loanType' in order);
        const marketId = this.safeString(order, 'instId');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeInteger(order, 'cTime');
        const symbol = market['symbol'];
        const rawStatus = this.safeString(order, 'status');
        const orderFee = this.safeValue(order, 'feeDetail', []);
        const fee = this.safeValue(orderFee, 0);
        const feeAmount = this.safeString(fee, 'fee');
        let feeObject = undefined;
        if (feeAmount !== undefined) {
            const feeCurrency = this.safeString(fee, 'feeCoin');
            feeObject = {
                'cost': this.parseNumber(Precise["default"].stringAbs(feeAmount)),
                'currency': this.safeCurrencyCode(feeCurrency),
            };
        }
        const triggerPrice = this.safeNumber(order, 'triggerPrice');
        const isTriggerOrder = (triggerPrice !== undefined);
        let price = undefined;
        if (!isTriggerOrder) {
            price = this.safeNumber(order, 'price');
        }
        else if (isSpot && isTriggerOrder) {
            // for spot trigger order, limit price is this
            price = this.safeNumber(order, 'executePrice');
        }
        const avgPrice = this.omitZero(this.safeString2(order, 'priceAvg', 'fillPrice'));
        const side = this.safeString(order, 'side');
        const type = this.safeString(order, 'orderType');
        const accBaseVolume = this.omitZero(this.safeString(order, 'accBaseVolume'));
        const newSizeValue = this.omitZero(this.safeString(order, 'newSize'));
        const isMarketOrder = (type === 'market');
        const isBuy = (side === 'buy');
        let totalAmount = undefined;
        let filledAmount = undefined;
        let cost = undefined;
        let remaining = undefined;
        let totalFilled = this.safeString(order, 'accBaseVolume');
        if (isSpot) {
            if (isMargin) {
                totalAmount = this.safeString(order, 'baseSize');
                totalFilled = this.safeString(order, 'baseVolume');
                cost = this.safeString(order, 'fillTotalAmount');
            }
            else {
                const partialFillAmount = this.safeString(order, 'baseVolume');
                if (partialFillAmount !== undefined) {
                    filledAmount = partialFillAmount;
                }
                else {
                    filledAmount = totalFilled;
                }
                if (isMarketOrder) {
                    if (isBuy) {
                        totalAmount = accBaseVolume;
                        cost = newSizeValue;
                    }
                    else {
                        totalAmount = newSizeValue;
                        // we don't have cost for market-sell order
                    }
                }
                else {
                    totalAmount = this.safeString(order, 'newSize');
                    // we don't have cost for limit order
                }
            }
        }
        else {
            // baseVolume should not be used for "amount" for contracts !
            filledAmount = this.safeString(order, 'baseVolume');
            totalAmount = this.safeString(order, 'size');
            cost = this.safeString(order, 'fillNotionalUsd');
        }
        remaining = Precise["default"].stringSub(totalAmount, totalFilled);
        return this.safeOrder({
            'info': order,
            'symbol': symbol,
            'id': this.safeString(order, 'orderId'),
            'clientOrderId': this.safeString(order, 'clientOid'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': this.safeInteger(order, 'uTime'),
            'type': type,
            'timeInForce': this.safeStringUpper(order, 'force'),
            'postOnly': undefined,
            'side': side,
            'price': price,
            'triggerPrice': triggerPrice,
            'amount': totalAmount,
            'cost': cost,
            'average': avgPrice,
            'filled': filledAmount,
            'remaining': remaining,
            'status': this.parseWsOrderStatus(rawStatus),
            'fee': feeObject,
            'trades': undefined,
        }, market);
    }
    parseWsOrderStatus(status) {
        const statuses = {
            'live': 'open',
            'partially_filled': 'open',
            'filled': 'closed',
            'cancelled': 'canceled',
            'not_trigger': 'open',
        };
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name bitget#watchMyTrades
     * @description watches trades made by the user
     * @see https://www.bitget.com/api-doc/contract/websocket/private/Order-Channel
     * @param {str} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        let messageHash = 'myTrades';
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
            messageHash = messageHash + ':' + symbol;
        }
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('watchMyTrades', market, params);
        let instType = undefined;
        if (market === undefined && type === 'spot') {
            instType = 'SPOT';
        }
        else {
            [instType, params] = this.getInstType(market, params);
        }
        const subscriptionHash = 'fill:' + instType;
        const args = {
            'instType': instType,
            'channel': 'fill',
            'instId': 'default',
        };
        const trades = await this.watchPrivate(messageHash, subscriptionHash, args, params);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit, true);
    }
    handleMyTrades(client, message) {
        //
        // spot
        // {
        //     "action": "snapshot",
        //     "arg": {
        //        "instType": "SPOT",
        //        "channel": "fill",
        //        "instId": "default"
        //     },
        //     "data": [
        //        {
        //           "orderId": "1169142457356959747",
        //           "tradeId": "1169142457636958209",
        //           "symbol": "LTCUSDT",
        //           "orderType": "market",
        //           "side": "buy",
        //           "priceAvg": "81.069",
        //           "size": "0.074",
        //           "amount": "5.999106",
        //           "tradeScope": "taker",
        //           "feeDetail": [
        //              {
        //                 "feeCoin": "LTC",
        //                 "deduction": "no",
        //                 "totalDeductionFee": "0",
        //                 "totalFee": "0.000074"
        //              }
        //           ],
        //           "cTime": "1714471204194",
        //           "uTime": "1714471204194"
        //        }
        //     ],
        //     "ts": 1714471204270
        // }
        // swap
        //     {
        //         "action": "snapshot",
        //         "arg": {
        //            "instType": "USDT-FUTURES",
        //            "channel": "fill",
        //            "instId": "default"
        //         },
        //         "data": [
        //            {
        //               "orderId": "1169142761031114781",
        //               "tradeId": "1169142761312637004",
        //               "symbol": "LTCUSDT",
        //               "orderType": "market",
        //               "side": "buy",
        //               "price": "80.87",
        //               "baseVolume": "0.1",
        //               "quoteVolume": "8.087",
        //               "profit": "0",
        //               "tradeSide": "open",
        //               "posMode": "hedge_mode",
        //               "tradeScope": "taker",
        //               "feeDetail": [
        //                  {
        //                     "feeCoin": "USDT",
        //                     "deduction": "no",
        //                     "totalDeductionFee": "0",
        //                     "totalFee": "-0.0048522"
        //                  }
        //               ],
        //               "cTime": "1714471276596",
        //               "uTime": "1714471276596"
        //            }
        //         ],
        //         "ts": 1714471276629
        //     }
        //
        if (this.myTrades === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            this.myTrades = new Cache.ArrayCache(limit);
        }
        const stored = this.myTrades;
        const data = this.safeList(message, 'data', []);
        const length = data.length;
        const messageHash = 'myTrades';
        for (let i = 0; i < length; i++) {
            const trade = data[i];
            const parsed = this.parseWsTrade(trade);
            stored.append(parsed);
            const symbol = parsed['symbol'];
            const symbolSpecificMessageHash = 'myTrades:' + symbol;
            client.resolve(stored, symbolSpecificMessageHash);
        }
        client.resolve(stored, messageHash);
    }
    /**
     * @method
     * @name bitget#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.bitget.com/api-doc/spot/websocket/private/Account-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/private/Account-Channel
     * @see https://www.bitget.com/api-doc/margin/cross/websocket/private/Margin-Cross-Account-Assets
     * @see https://www.bitget.com/api-doc/margin/isolated/websocket/private/Margin-isolated-account-assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {str} [params.type] spot or contract if not provided this.options['defaultType'] is used
     * @param {string} [params.instType] one of 'SPOT', 'MARGIN', 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
     * @param {string} [params.marginMode] 'isolated' or 'cross' for watching spot margin balances
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('watchBalance', undefined, params);
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('watchBalance', params);
        let instType = undefined;
        let channel = 'account';
        if ((type === 'swap') || (type === 'future')) {
            instType = 'USDT-FUTURES';
        }
        else if (marginMode !== undefined) {
            instType = 'MARGIN';
            if (marginMode === 'isolated') {
                channel = 'account-isolated';
            }
            else {
                channel = 'account-crossed';
            }
        }
        else {
            instType = 'SPOT';
        }
        [instType, params] = this.handleOptionAndParams(params, 'watchBalance', 'instType', instType);
        const args = {
            'instType': instType,
            'channel': channel,
            'coin': 'default',
        };
        const messageHash = 'balance:' + instType.toLowerCase();
        return await this.watchPrivate(messageHash, messageHash, args, params);
    }
    handleBalance(client, message) {
        //
        // spot
        //
        //     {
        //         "action": "snapshot",
        //         "arg": { "instType": "SPOT", "channel": "account", "coin": "default" },
        //         "data": [
        //             {
        //                 "coin": "USDT",
        //                 "available": "19.1430952856087",
        //                 "frozen": "7",
        //                 "locked": "0",
        //                 "limitAvailable": "0",
        //                 "uTime": "1701931970487"
        //             },
        //         ],
        //         "ts": 1701931970487
        //     }
        //
        // swap
        //
        //     {
        //         "action": "snapshot",
        //         "arg": { "instType": "USDT-FUTURES", "channel": "account", "coin": "default" },
        //         "data": [
        //             {
        //                 "marginCoin": "USDT",
        //                 "frozen": "5.36581500",
        //                 "available": "26.14309528",
        //                 "maxOpenPosAvailable": "20.77728028",
        //                 "maxTransferOut": "20.77728028",
        //                 "equity": "26.14309528",
        //                 "usdtEquity": "26.143095285166"
        //             }
        //         ],
        //         "ts": 1701932570822
        //     }
        //
        // margin
        //
        //     {
        //         "action": "snapshot",
        //         "arg": { "instType": "MARGIN", "channel": "account-crossed", "coin": "default" },
        //         "data": [
        //             {
        //                 "uTime": "1701933110544",
        //                 "id": "1096916799926710272",
        //                 "coin": "USDT",
        //                 "available": "16.24309528",
        //                 "borrow": "0.00000000",
        //                 "frozen": "9.90000000",
        //                 "interest": "0.00000000",
        //                 "coupon": "0.00000000"
        //             }
        //         ],
        //         "ts": 1701933110544
        //     }
        //
        const data = this.safeValue(message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const rawBalance = data[i];
            const currencyId = this.safeString2(rawBalance, 'coin', 'marginCoin');
            const code = this.safeCurrencyCode(currencyId);
            const account = (code in this.balance) ? this.balance[code] : this.account();
            const borrow = this.safeString(rawBalance, 'borrow');
            if (borrow !== undefined) {
                const interest = this.safeString(rawBalance, 'interest');
                account['debt'] = Precise["default"].stringAdd(borrow, interest);
            }
            const freeQuery = ('maxTransferOut' in rawBalance) ? 'maxTransferOut' : 'available';
            account['free'] = this.safeString(rawBalance, freeQuery);
            account['total'] = this.safeString(rawBalance, 'equity');
            account['used'] = this.safeString(rawBalance, 'frozen');
            this.balance[code] = account;
        }
        this.balance = this.safeBalance(this.balance);
        const arg = this.safeValue(message, 'arg');
        const instType = this.safeStringLower(arg, 'instType');
        const messageHash = 'balance:' + instType;
        client.resolve(this.balance, messageHash);
    }
    async watchPublic(messageHash, args, params = {}) {
        const url = this.urls['api']['ws']['public'];
        const request = {
            'op': 'subscribe',
            'args': [args],
        };
        const message = this.extend(request, params);
        return await this.watch(url, messageHash, message, messageHash);
    }
    async unWatchPublic(messageHash, args, params = {}) {
        const url = this.urls['api']['ws']['public'];
        const request = {
            'op': 'unsubscribe',
            'args': [args],
        };
        const message = this.extend(request, params);
        return await this.watch(url, messageHash, message, messageHash);
    }
    async watchPublicMultiple(messageHashes, argsArray, params = {}) {
        const url = this.urls['api']['ws']['public'];
        const request = {
            'op': 'subscribe',
            'args': argsArray,
        };
        const message = this.extend(request, params);
        return await this.watchMultiple(url, messageHashes, message, messageHashes);
    }
    async authenticate(params = {}) {
        this.checkRequiredCredentials();
        const url = this.urls['api']['ws']['private'];
        const client = this.client(url);
        const messageHash = 'authenticated';
        const future = client.future(messageHash);
        const authenticated = this.safeValue(client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const timestamp = this.seconds().toString();
            const auth = timestamp + 'GET' + '/user/verify';
            const signature = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256, 'base64');
            const operation = 'login';
            const request = {
                'op': operation,
                'args': [
                    {
                        'apiKey': this.apiKey,
                        'passphrase': this.password,
                        'timestamp': timestamp,
                        'sign': signature,
                    },
                ],
            };
            const message = this.extend(request, params);
            this.watch(url, messageHash, message, messageHash);
        }
        return await future;
    }
    async watchPrivate(messageHash, subscriptionHash, args, params = {}) {
        await this.authenticate();
        const url = this.urls['api']['ws']['private'];
        const request = {
            'op': 'subscribe',
            'args': [args],
        };
        const message = this.extend(request, params);
        return await this.watch(url, messageHash, message, subscriptionHash);
    }
    handleAuthenticate(client, message) {
        //
        //  { event: "login", code: 0 }
        //
        const messageHash = 'authenticated';
        const future = this.safeValue(client.futures, messageHash);
        future.resolve(true);
    }
    handleErrorMessage(client, message) {
        //
        //    { event: "error", code: 30015, msg: "Invalid sign" }
        //
        const event = this.safeString(message, 'event');
        try {
            if (event === 'error') {
                const code = this.safeString(message, 'code');
                const feedback = this.id + ' ' + this.json(message);
                this.throwExactlyMatchedException(this.exceptions['ws']['exact'], code, feedback);
                const msg = this.safeString(message, 'msg', '');
                this.throwBroadlyMatchedException(this.exceptions['ws']['broad'], msg, feedback);
                throw new errors.ExchangeError(feedback);
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
                // Note: if error happens on a subscribe event, user will have to close exchange to resubscribe. Issue #19041
                client.reject(e);
            }
            return true;
        }
    }
    handleMessage(client, message) {
        //
        //   {
        //       "action": "snapshot",
        //       "arg": { instType: 'SPOT', channel: "ticker", instId: "BTCUSDT" },
        //       "data": [
        //         {
        //           "instId": "BTCUSDT",
        //           "last": "21150.53",
        //           "open24h": "20759.65",
        //           "high24h": "21202.29",
        //           "low24h": "20518.82",
        //           "bestBid": "21150.500000",
        //           "bestAsk": "21150.600000",
        //           "baseVolume": "25402.1961",
        //           "quoteVolume": "530452554.2156",
        //           "ts": 1656408934044,
        //           "labeId": 0
        //         }
        //       ]
        //   }
        // pong message
        //    "pong"
        //
        // login
        //
        //     { event: "login", code: 0 }
        //
        // subscribe
        //
        //    {
        //        "event": "subscribe",
        //        "arg": { instType: 'SPOT', channel: "account", instId: "default" }
        //    }
        // unsubscribe
        //    {
        //        "op":"unsubscribe",
        //        "args":[
        //          {
        //            "instType":"USDT-FUTURES",
        //            "channel":"ticker",
        //            "instId":"BTCUSDT"
        //          }
        //        ]
        //    }
        //
        if (this.handleErrorMessage(client, message)) {
            return;
        }
        const content = this.safeString(message, 'message');
        if (content === 'pong') {
            this.handlePong(client, message);
            return;
        }
        if (message === 'pong') {
            this.handlePong(client, message);
            return;
        }
        const event = this.safeString(message, 'event');
        if (event === 'login') {
            this.handleAuthenticate(client, message);
            return;
        }
        if (event === 'subscribe') {
            this.handleSubscriptionStatus(client, message);
            return;
        }
        if (event === 'unsubscribe') {
            this.handleUnSubscriptionStatus(client, message);
            return;
        }
        const methods = {
            'ticker': this.handleTicker,
            'trade': this.handleTrades,
            'fill': this.handleMyTrades,
            'orders': this.handleOrder,
            'ordersAlgo': this.handleOrder,
            'orders-algo': this.handleOrder,
            'orders-crossed': this.handleOrder,
            'orders-isolated': this.handleOrder,
            'account': this.handleBalance,
            'positions': this.handlePositions,
            'account-isolated': this.handleBalance,
            'account-crossed': this.handleBalance,
        };
        const arg = this.safeValue(message, 'arg', {});
        const topic = this.safeValue(arg, 'channel', '');
        const method = this.safeValue(methods, topic);
        if (method !== undefined) {
            method.call(this, client, message);
        }
        if (topic.indexOf('candle') >= 0) {
            this.handleOHLCV(client, message);
        }
        if (topic.indexOf('books') >= 0) {
            this.handleOrderBook(client, message);
        }
    }
    ping(client) {
        return 'ping';
    }
    handlePong(client, message) {
        client.lastPong = this.milliseconds();
        return message;
    }
    handleSubscriptionStatus(client, message) {
        //
        //    {
        //        "event": "subscribe",
        //        "arg": { instType: 'SPOT', channel: "account", instId: "default" }
        //    }
        //
        return message;
    }
    handleOrderBookUnSubscription(client, message) {
        //
        //    {"event":"unsubscribe","arg":{"instType":"SPOT","channel":"books","instId":"BTCUSDT"}}
        //
        const arg = this.safeDict(message, 'arg', {});
        const instType = this.safeStringLower(arg, 'instType');
        const type = (instType === 'spot') ? 'spot' : 'contract';
        const instId = this.safeString(arg, 'instId');
        const market = this.safeMarket(instId, undefined, undefined, type);
        const symbol = market['symbol'];
        const messageHash = 'unsubscribe:orderbook:' + market['symbol'];
        const subMessageHash = 'orderbook:' + symbol;
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        if (subMessageHash in client.subscriptions) {
            delete client.subscriptions[subMessageHash];
        }
        if (messageHash in client.subscriptions) {
            delete client.subscriptions[messageHash];
        }
        const error = new errors.UnsubscribeError(this.id + 'orderbook ' + symbol);
        client.reject(error, subMessageHash);
        client.resolve(true, messageHash);
    }
    handleTradesUnSubscription(client, message) {
        //
        //    {"event":"unsubscribe","arg":{"instType":"SPOT","channel":"trade","instId":"BTCUSDT"}}
        //
        const arg = this.safeDict(message, 'arg', {});
        const instType = this.safeStringLower(arg, 'instType');
        const type = (instType === 'spot') ? 'spot' : 'contract';
        const instId = this.safeString(arg, 'instId');
        const market = this.safeMarket(instId, undefined, undefined, type);
        const symbol = market['symbol'];
        const messageHash = 'unsubscribe:trade:' + market['symbol'];
        const subMessageHash = 'trade:' + symbol;
        if (symbol in this.trades) {
            delete this.trades[symbol];
        }
        if (subMessageHash in client.subscriptions) {
            delete client.subscriptions[subMessageHash];
        }
        if (messageHash in client.subscriptions) {
            delete client.subscriptions[messageHash];
        }
        const error = new errors.UnsubscribeError(this.id + 'trades ' + symbol);
        client.reject(error, subMessageHash);
        client.resolve(true, messageHash);
    }
    handleTickerUnSubscription(client, message) {
        //
        //    {"event":"unsubscribe","arg":{"instType":"SPOT","channel":"trade","instId":"BTCUSDT"}}
        //
        const arg = this.safeDict(message, 'arg', {});
        const instType = this.safeStringLower(arg, 'instType');
        const type = (instType === 'spot') ? 'spot' : 'contract';
        const instId = this.safeString(arg, 'instId');
        const market = this.safeMarket(instId, undefined, undefined, type);
        const symbol = market['symbol'];
        const messageHash = 'unsubscribe:ticker:' + market['symbol'];
        const subMessageHash = 'ticker:' + symbol;
        if (symbol in this.tickers) {
            delete this.tickers[symbol];
        }
        if (subMessageHash in client.subscriptions) {
            delete client.subscriptions[subMessageHash];
        }
        if (messageHash in client.subscriptions) {
            delete client.subscriptions[messageHash];
        }
        const error = new errors.UnsubscribeError(this.id + 'ticker ' + symbol);
        client.reject(error, subMessageHash);
        client.resolve(true, messageHash);
    }
    handleOHLCVUnSubscription(client, message) {
        //
        //    {"event":"unsubscribe","arg":{"instType":"SPOT","channel":"candle1m","instId":"BTCUSDT"}}
        //
        const arg = this.safeDict(message, 'arg', {});
        const instType = this.safeStringLower(arg, 'instType');
        const type = (instType === 'spot') ? 'spot' : 'contract';
        const instId = this.safeString(arg, 'instId');
        const channel = this.safeString(arg, 'channel');
        const interval = channel.replace('candle', '');
        const timeframes = this.safeValue(this.options, 'timeframes');
        const timeframe = this.findTimeframe(interval, timeframes);
        const market = this.safeMarket(instId, undefined, undefined, type);
        const symbol = market['symbol'];
        const messageHash = 'unsubscribe:candles:' + timeframe + ':' + market['symbol'];
        const subMessageHash = 'candles:' + timeframe + ':' + symbol;
        if (symbol in this.ohlcvs) {
            if (timeframe in this.ohlcvs[symbol]) {
                delete this.ohlcvs[symbol][timeframe];
            }
        }
        this.cleanUnsubscription(client, subMessageHash, messageHash);
    }
    handleUnSubscriptionStatus(client, message) {
        //
        //  {
        //      "op":"unsubscribe",
        //      "args":[
        //        {
        //          "instType":"USDT-FUTURES",
        //          "channel":"ticker",
        //          "instId":"BTCUSDT"
        //        },
        //        {
        //          "instType":"USDT-FUTURES",
        //          "channel":"candle1m",
        //          "instId":"BTCUSDT"
        //        }
        //      ]
        //  }
        //  or
        // {"event":"unsubscribe","arg":{"instType":"SPOT","channel":"books","instId":"BTCUSDT"}}
        //
        let argsList = this.safeList(message, 'args');
        if (argsList === undefined) {
            argsList = [this.safeDict(message, 'arg', {})];
        }
        for (let i = 0; i < argsList.length; i++) {
            const arg = argsList[i];
            const channel = this.safeString(arg, 'channel');
            if (channel === 'books') {
                // for now only unWatchOrderBook is supporteod
                this.handleOrderBookUnSubscription(client, message);
            }
            else if (channel === 'trade') {
                this.handleTradesUnSubscription(client, message);
            }
            else if (channel === 'ticker') {
                this.handleTickerUnSubscription(client, message);
            }
            else if (channel.startsWith('candle')) {
                this.handleOHLCVUnSubscription(client, message);
            }
        }
        return message;
    }
}

module.exports = bitget;
