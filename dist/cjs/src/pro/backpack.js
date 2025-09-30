'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var backpack$1 = require('../backpack.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');
var crypto = require('../base/functions/crypto.js');
var ed25519 = require('../static_dependencies/noble-curves/ed25519.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class backpack extends backpack$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchBidsAsks': true,
                'watchMyTrades': false,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOrders': true,
                'watchPositions': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'unwatchBidsAsks': true,
                'unwatchOHLCV': true,
                'unwatchOHLCVForSymbols': true,
                'unwatchOrderBook': true,
                'unwatchOrderBookForSymbols': true,
                'unwatchTicker': true,
                'unwatchTickers': true,
                'unWatchTrades': true,
                'unWatchTradesForSymbols': true,
                'unWatchOrders': true,
                'unWatchPositions': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://ws.backpack.exchange',
                        'private': 'wss://ws.backpack.exchange',
                    },
                },
            },
            'options': {
                'timeframes': {},
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 119000,
            },
        });
    }
    async watchPublic(topics, messageHashes, params = {}, unwatch = false) {
        await this.loadMarkets();
        const url = this.urls['api']['ws']['public'];
        const method = unwatch ? 'UNSUBSCRIBE' : 'SUBSCRIBE';
        const request = {
            'method': method,
            'params': topics,
        };
        const message = this.deepExtend(request, params);
        if (unwatch) {
            this.handleUnsubscriptions(url, messageHashes, message);
            return undefined;
        }
        return await this.watchMultiple(url, messageHashes, message, messageHashes);
    }
    async watchPrivate(topics, messageHashes, params = {}, unwatch = false) {
        this.checkRequiredCredentials();
        const url = this.urls['api']['ws']['private'];
        const instruction = 'subscribe';
        const ts = this.nonce().toString();
        const method = unwatch ? 'UNSUBSCRIBE' : 'SUBSCRIBE';
        const recvWindow = this.safeString2(this.options, 'recvWindow', 'X-Window', '5000');
        const payload = 'instruction=' + instruction + '&' + 'timestamp=' + ts + '&window=' + recvWindow;
        const secretBytes = this.base64ToBinary(this.secret);
        const seed = this.arraySlice(secretBytes, 0, 32);
        const signature = crypto.eddsa(this.encode(payload), seed, ed25519.ed25519);
        const request = {
            'method': method,
            'params': topics,
            'signature': [this.apiKey, signature, ts, recvWindow],
        };
        const message = this.deepExtend(request, params);
        if (unwatch) {
            this.handleUnsubscriptions(url, messageHashes, message);
            return undefined;
        }
        return await this.watchMultiple(url, messageHashes, message, messageHashes);
    }
    handleUnsubscriptions(url, messageHashes, message) {
        const client = this.client(url);
        this.watchMultiple(url, messageHashes, message, messageHashes);
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const subMessageHash = messageHash.replace('unsubscribe:', '');
            this.cleanUnsubscription(client, subMessageHash, messageHash);
            if (messageHash.indexOf('ticker') >= 0) {
                const symbol = messageHash.replace('unsubscribe:ticker:', '');
                if (symbol in this.tickers) {
                    delete this.tickers[symbol];
                }
            }
            else if (messageHash.indexOf('bidask') >= 0) {
                const symbol = messageHash.replace('unsubscribe:bidask:', '');
                if (symbol in this.bidsasks) {
                    delete this.bidsasks[symbol];
                }
            }
            else if (messageHash.indexOf('candles') >= 0) {
                const splitHashes = messageHash.split(':');
                const symbol = this.safeString(splitHashes, 2);
                const timeframe = this.safeString(splitHashes, 3);
                if (symbol in this.ohlcvs) {
                    if (timeframe in this.ohlcvs[symbol]) {
                        delete this.ohlcvs[symbol][timeframe];
                    }
                }
            }
            else if (messageHash.indexOf('orderbook') >= 0) {
                const symbol = messageHash.replace('unsubscribe:orderbook:', '');
                if (symbol in this.orderbooks) {
                    delete this.orderbooks[symbol];
                }
            }
            else if (messageHash.indexOf('trades') >= 0) {
                const symbol = messageHash.replace('unsubscribe:trades:', '');
                if (symbol in this.trades) {
                    delete this.trades[symbol];
                }
            }
            else if (messageHash.indexOf('orders') >= 0) {
                if (messageHash === 'unsubscribe:orders') {
                    const cache = this.orders;
                    const keys = Object.keys(cache);
                    for (let j = 0; j < keys.length; j++) {
                        const symbol = keys[j];
                        delete this.orders[symbol];
                    }
                }
                else {
                    const symbol = messageHash.replace('unsubscribe:orders:', '');
                    if (symbol in this.orders) {
                        delete this.orders[symbol];
                    }
                }
            }
            else if (messageHash.indexOf('positions') >= 0) {
                if (messageHash === 'unsubscribe:positions') {
                    const cache = this.positions;
                    const keys = Object.keys(cache);
                    for (let j = 0; j < keys.length; j++) {
                        const symbol = keys[j];
                        delete this.positions[symbol];
                    }
                }
                else {
                    const symbol = messageHash.replace('unsubscribe:positions:', '');
                    if (symbol in this.positions) {
                        delete this.positions[symbol];
                    }
                }
            }
        }
    }
    /**
     * @method
     * @name backpack#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const topic = 'ticker' + '.' + market['id'];
        const messageHash = 'ticker' + ':' + symbol;
        return await this.watchPublic([topic], [messageHash], params);
    }
    /**
     * @method
     * @name backpack#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchTicker(symbol, params = {}) {
        return await this.unWatchTickers([symbol], params);
    }
    /**
     * @method
     * @name backpack#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Ticker
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        const messageHashes = [];
        const topics = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId(symbol);
            messageHashes.push('ticker:' + symbol);
            topics.push('ticker.' + marketId);
        }
        await this.watchPublic(topics, messageHashes, params);
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    /**
     * @method
     * @name backpack#unWatchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Ticker
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId(symbol);
            topics.push('ticker.' + marketId);
            messageHashes.push('unsubscribe:ticker:' + symbol);
        }
        return await this.watchPublic(topics, messageHashes, params, true);
    }
    handleTicker(client, message) {
        //
        //     {
        //         data: {
        //             E: '1754176123312507',
        //             V: '19419526.742584',
        //             c: '3398.57',
        //             e: 'ticker',
        //             h: '3536.65',
        //             l: '3371.8',
        //             n: 17152,
        //             o: '3475.45',
        //             s: 'ETH_USDC',
        //             v: '5573.5827'
        //         },
        //         stream: 'bookTicker.ETH_USDC'
        //     }
        //
        const ticker = this.safeDict(message, 'data', {});
        const marketId = this.safeString(ticker, 's');
        const market = this.safeMarket(marketId);
        const symbol = this.safeSymbol(marketId, market);
        const parsedTicker = this.parseWsTicker(ticker, market);
        const messageHash = 'ticker' + ':' + symbol;
        this.tickers[symbol] = parsedTicker;
        client.resolve(parsedTicker, messageHash);
    }
    parseWsTicker(ticker, market = undefined) {
        //
        //     {
        //         E: '1754178406415232',
        //         V: '19303818.6923',
        //         c: '3407.54',
        //         e: 'ticker',
        //         h: '3536.65',
        //         l: '3369.18',
        //         n: 17272,
        //         o: '3481.71',
        //         s: 'ETH_USDC',
        //         v: '5542.3911'
        //     }
        //
        const microseconds = this.safeInteger(ticker, 'E');
        const timestamp = this.parseToInt(microseconds / 1000);
        const marketId = this.safeString(ticker, 's');
        market = this.safeMarket(marketId, market);
        const symbol = this.safeSymbol(marketId, market);
        const last = this.safeString(ticker, 'c');
        const open = this.safeString(ticker, 'o');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeNumber(ticker, 'h'),
            'low': this.safeNumber(ticker, 'l'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString(ticker, 'v'),
            'quoteVolume': this.safeString(ticker, 'V'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name backpack#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Book-ticker
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchBidsAsks(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId(symbol);
            topics.push('bookTicker.' + marketId);
            messageHashes.push('bidask:' + symbol);
        }
        await this.watchPublic(topics, messageHashes, params);
        return this.filterByArray(this.bidsasks, 'symbol', symbols);
    }
    /**
     * @method
     * @name backpack#unWatchBidsAsks
     * @description unWatches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchBidsAsks(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId(symbol);
            topics.push('bookTicker.' + marketId);
            messageHashes.push('unsubscribe:bidask:' + symbol);
        }
        return await this.watchPublic(topics, messageHashes, params, true);
    }
    handleBidAsk(client, message) {
        //
        //     {
        //         data: {
        //             A: '0.4087',
        //             B: '0.0020',
        //             E: '1754517402450016',
        //             T: '1754517402449064',
        //             a: '3667.50',
        //             b: '3667.49',
        //             e: 'bookTicker',
        //             s: 'ETH_USDC',
        //             u: 1328288557
        //         },
        //         stream: 'bookTicker.ETH_USDC'
        //     }
        const data = this.safeDict(message, 'data', {});
        const marketId = this.safeString(data, 's');
        const market = this.safeMarket(marketId);
        const symbol = this.safeSymbol(marketId, market);
        const parsedBidAsk = this.parseWsBidAsk(data, market);
        const messageHash = 'bidask' + ':' + symbol;
        this.bidsasks[symbol] = parsedBidAsk;
        client.resolve(parsedBidAsk, messageHash);
    }
    parseWsBidAsk(ticker, market = undefined) {
        //
        //     {
        //         A: '0.4087',
        //         B: '0.0020',
        //         E: '1754517402450016',
        //         T: '1754517402449064',
        //         a: '3667.50',
        //         b: '3667.49',
        //         e: 'bookTicker',
        //         s: 'ETH_USDC',
        //         u: 1328288557
        //     }
        //
        const marketId = this.safeString(ticker, 's');
        market = this.safeMarket(marketId, market);
        const symbol = this.safeString(market, 'symbol');
        const microseconds = this.safeInteger(ticker, 'E');
        const timestamp = this.parseToInt(microseconds / 1000);
        const ask = this.safeString(ticker, 'a');
        const askVolume = this.safeString(ticker, 'A');
        const bid = this.safeString(ticker, 'b');
        const bidVolume = this.safeString(ticker, 'B');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'ask': ask,
            'askVolume': askVolume,
            'bid': bid,
            'bidVolume': bidVolume,
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name backpack#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://docs.backpack.exchange/#tag/Streams/Public/K-Line
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const result = await this.watchOHLCVForSymbols([[symbol, timeframe]], since, limit, params);
        return result[symbol][timeframe];
    }
    /**
     * @method
     * @name backpack#unWatchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.backpack.exchange/#tag/Streams/Public/K-Line
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async unWatchOHLCV(symbol, timeframe = '1m', params = {}) {
        return await this.unWatchOHLCVForSymbols([[symbol, timeframe]], params);
    }
    /**
     * @method
     * @name backpack#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://docs.backpack.exchange/#tag/Streams/Public/K-Line
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCVForSymbols(symbolsAndTimeframes, since = undefined, limit = undefined, params = {}) {
        const symbolsLength = symbolsAndTimeframes.length;
        if (symbolsLength === 0 || !Array.isArray(symbolsAndTimeframes[0])) {
            throw new errors.ArgumentsRequired(this.id + " watchOHLCVForSymbols() requires a an array of symbols and timeframes, like  ['ETH/USDC', '1m']");
        }
        await this.loadMarkets();
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const symbolAndTimeframe = symbolsAndTimeframes[i];
            const marketId = this.safeString(symbolAndTimeframe, 0);
            const market = this.market(marketId);
            const tf = this.safeString(symbolAndTimeframe, 1);
            const interval = this.safeString(this.timeframes, tf, tf);
            topics.push('kline.' + interval + '.' + market['id']);
            messageHashes.push('candles:' + market['symbol'] + ':' + interval);
        }
        const [symbol, timeframe, candles] = await this.watchPublic(topics, messageHashes, params);
        if (this.newUpdates) {
            limit = candles.getLimit(symbol, limit);
        }
        const filtered = this.filterBySinceLimit(candles, since, limit, 0, true);
        return this.createOHLCVObject(symbol, timeframe, filtered);
    }
    /**
     * @method
     * @name backpack#unWatchOHLCVForSymbols
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.backpack.exchange/#tag/Streams/Public/K-Line
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async unWatchOHLCVForSymbols(symbolsAndTimeframes, params = {}) {
        const symbolsLength = symbolsAndTimeframes.length;
        if (symbolsLength === 0 || !Array.isArray(symbolsAndTimeframes[0])) {
            throw new errors.ArgumentsRequired(this.id + " unWatchOHLCVForSymbols() requires a an array of symbols and timeframes, like  ['ETH/USDC', '1m']");
        }
        await this.loadMarkets();
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const symbolAndTimeframe = symbolsAndTimeframes[i];
            const marketId = this.safeString(symbolAndTimeframe, 0);
            const market = this.market(marketId);
            const tf = this.safeString(symbolAndTimeframe, 1);
            const interval = this.safeString(this.timeframes, tf, tf);
            topics.push('kline.' + interval + '.' + market['id']);
            messageHashes.push('unsubscribe:candles:' + market['symbol'] + ':' + interval);
        }
        return await this.watchPublic(topics, messageHashes, params, true);
    }
    handleOHLCV(client, message) {
        //
        //     {
        //         data: {
        //             E: '1754519557526056',
        //             T: '2025-08-07T00:00:00',
        //             X: false,
        //             c: '3680.520000000',
        //             e: 'kline',
        //             h: '3681.370000000',
        //             l: '3667.650000000',
        //             n: 255,
        //             o: '3670.150000000',
        //             s: 'ETH_USDC',
        //             t: '2025-08-06T22:00:00',
        //             v: '62.2621000'
        //         },
        //         stream: 'kline.2h.ETH_USDC'
        //     }
        //
        const data = this.safeDict(message, 'data', {});
        const marketId = this.safeString(data, 's');
        const market = this.market(marketId);
        const symbol = market['symbol'];
        const stream = this.safeString(message, 'stream');
        const parts = stream.split('.');
        const timeframe = this.safeString(parts, 1);
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            const stored = new Cache.ArrayCacheByTimestamp(limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const ohlcv = this.ohlcvs[symbol][timeframe];
        const parsed = this.parseWsOHLCV(data);
        ohlcv.append(parsed);
        const messageHash = 'candles:' + symbol + ':' + timeframe;
        client.resolve([symbol, timeframe, ohlcv], messageHash);
    }
    parseWsOHLCV(ohlcv, market = undefined) {
        //
        //     {
        //         E: '1754519557526056',
        //         T: '2025-08-07T00:00:00',
        //         X: false,
        //         c: '3680.520000000',
        //         e: 'kline',
        //         h: '3681.370000000',
        //         l: '3667.650000000',
        //         n: 255,
        //         o: '3670.150000000',
        //         s: 'ETH_USDC',
        //         t: '2025-08-06T22:00:00',
        //         v: '62.2621000'
        //     },
        //
        return [
            this.parse8601(this.safeString(ohlcv, 'T')),
            this.safeNumber(ohlcv, 'o'),
            this.safeNumber(ohlcv, 'h'),
            this.safeNumber(ohlcv, 'l'),
            this.safeNumber(ohlcv, 'c'),
            this.safeNumber(ohlcv, 'v'),
        ];
    }
    /**
     * @method
     * @name backpack#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Trade
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        return await this.watchTradesForSymbols([symbol], since, limit, params);
    }
    /**
     * @method
     * @name backpack#unWatchTrades
     * @description unWatches from the stream channel
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Trade
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async unWatchTrades(symbol, params = {}) {
        return await this.unWatchTradesForSymbols([symbol], params);
    }
    /**
     * @method
     * @name backpack#watchTradesForSymbols
     * @description watches information on multiple trades made in a market
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Trade
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTradesForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new errors.ArgumentsRequired(this.id + ' watchTradesForSymbols() requires a non-empty array of symbols');
        }
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId(symbol);
            topics.push('trade.' + marketId);
            messageHashes.push('trades:' + symbol);
        }
        const trades = await this.watchPublic(topics, messageHashes, params);
        if (this.newUpdates) {
            const first = this.safeValue(trades, 0);
            const tradeSymbol = this.safeString(first, 'symbol');
            limit = trades.getLimit(tradeSymbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    /**
     * @method
     * @name backpack#unWatchTradesForSymbols
     * @description unWatches from the stream channel
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Trade
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async unWatchTradesForSymbols(symbols, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new errors.ArgumentsRequired(this.id + ' unWatchTradesForSymbols() requires a non-empty array of symbols');
        }
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId(symbol);
            topics.push('trade.' + marketId);
            messageHashes.push('unsubscribe:trades:' + symbol);
        }
        return await this.watchPublic(topics, messageHashes, params, true);
    }
    handleTrades(client, message) {
        //
        //     {
        //         data: {
        //             E: '1754601477746429',
        //             T: '1754601477744000',
        //             a: '5121860761',
        //             b: '5121861755',
        //             e: 'trade',
        //             m: false,
        //             p: '3870.25',
        //             q: '0.0008',
        //             s: 'ETH_USDC_PERP',
        //             t: 10782547
        //         },
        //         stream: 'trade.ETH_USDC_PERP'
        //     }
        //
        const data = this.safeDict(message, 'data', {});
        const marketId = this.safeString(data, 's');
        const market = this.market(marketId);
        const symbol = market['symbol'];
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            const stored = new Cache.ArrayCache(limit);
            this.trades[symbol] = stored;
        }
        const cache = this.trades[symbol];
        const trade = this.parseWsTrade(data, market);
        cache.append(trade);
        const messageHash = 'trades:' + symbol;
        client.resolve(cache, messageHash);
        client.resolve(cache, 'trades');
    }
    parseWsTrade(trade, market = undefined) {
        //
        //     {
        //         E: '1754601477746429',
        //         T: '1754601477744000',
        //         a: '5121860761',
        //         b: '5121861755',
        //         e: 'trade',
        //         m: false,
        //         p: '3870.25',
        //         q: '0.0008',
        //         s: 'ETH_USDC_PERP',
        //         t: 10782547
        //     }
        //
        const microseconds = this.safeInteger(trade, 'E');
        const timestamp = this.parseToInt(microseconds / 1000);
        const id = this.safeString(trade, 't');
        const marketId = this.safeString(trade, 's');
        market = this.safeMarket(marketId, market);
        const isMaker = this.safeBool(trade, 'm');
        const side = isMaker ? 'sell' : 'buy';
        const takerOrMaker = isMaker ? 'maker' : 'taker';
        const price = this.safeString(trade, 'p');
        const amount = this.safeString(trade, 'q');
        let orderId = undefined;
        if (side === 'buy') {
            orderId = this.safeString(trade, 'b');
        }
        else {
            orderId = this.safeString(trade, 'a');
        }
        return this.safeTrade({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': {
                'currency': undefined,
                'cost': undefined,
            },
        }, market);
    }
    /**
     * @method
     * @name backpack#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Depth
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
     * @name backpack#watchOrderBookForSymbols
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Depth
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] either '/market/level2' or '/spotMarket/level2Depth5' or '/spotMarket/level2Depth50' default is '/market/level2'
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols(symbols, limit = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        const marketIds = this.marketIds(symbols);
        const messageHashes = [];
        const topics = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            messageHashes.push('orderbook:' + symbol);
            const marketId = marketIds[i];
            const topic = 'depth.' + marketId;
            topics.push(topic);
        }
        const orderbook = await this.watchPublic(topics, messageHashes, params);
        return orderbook.limit(); // todo check if limit is needed
    }
    /**
     * @method
     * @name backpack#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBook(symbol, params = {}) {
        return await this.unWatchOrderBookForSymbols([symbol], params);
    }
    /**
     * @method
     * @name backpack#unWatchOrderBookForSymbols
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string[]} symbols unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] either '/market/level2' or '/spotMarket/level2Depth5' or '/spotMarket/level2Depth50' default is '/market/level2'
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBookForSymbols(symbols, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        const marketIds = this.marketIds(symbols);
        const messageHashes = [];
        const topics = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            messageHashes.push('unsubscribe:orderbook:' + symbol);
            const marketId = marketIds[i];
            const topic = 'depth.' + marketId;
            topics.push(topic);
        }
        return await this.watchPublic(topics, messageHashes, params, true);
    }
    handleOrderBook(client, message) {
        //
        // initial snapshot is fetched with ccxt's fetchOrderBook
        // the feed does not include a snapshot, just the deltas
        //
        //     {
        //         "data": {
        //             "E": "1754903057555305",
        //             "T": "1754903057554352",
        //             "U": 1345937436,
        //             "a": [],
        //             "b": [],
        //             "e": "depth",
        //             "s": "ETH_USDC",
        //             "u": 1345937436
        //         },
        //         "stream": "depth.ETH_USDC"
        //     }
        //
        const data = this.safeDict(message, 'data', {});
        const marketId = this.safeString(data, 's');
        const symbol = this.safeSymbol(marketId);
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook();
        }
        const storedOrderBook = this.orderbooks[symbol];
        const nonce = this.safeInteger(storedOrderBook, 'nonce');
        const deltaNonce = this.safeInteger(data, 'u');
        const messageHash = 'orderbook:' + symbol;
        if (nonce === undefined) {
            const cacheLength = storedOrderBook.cache.length;
            // the rest API is very delayed
            // usually it takes at least 9 deltas to resolve
            const snapshotDelay = this.handleOption('watchOrderBook', 'snapshotDelay', 10);
            if (cacheLength === snapshotDelay) {
                this.spawn(this.loadOrderBook, client, messageHash, symbol, null, {});
            }
            storedOrderBook.cache.push(data);
            return;
        }
        else if (nonce >= deltaNonce) {
            return;
        }
        this.handleDelta(storedOrderBook, data);
        client.resolve(storedOrderBook, messageHash);
    }
    handleDelta(orderbook, delta) {
        const timestamp = this.parseToInt(this.safeInteger(delta, 'T') / 1000);
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601(timestamp);
        orderbook['nonce'] = this.safeInteger(delta, 'u');
        const bids = this.safeDict(delta, 'b', []);
        const asks = this.safeDict(delta, 'a', []);
        const storedBids = orderbook['bids'];
        const storedAsks = orderbook['asks'];
        this.handleBidAsks(storedBids, bids);
        this.handleBidAsks(storedAsks, asks);
    }
    handleBidAsks(bookSide, bidAsks) {
        for (let i = 0; i < bidAsks.length; i++) {
            const bidAsk = this.parseBidAsk(bidAsks[i]);
            bookSide.storeArray(bidAsk);
        }
    }
    getCacheIndex(orderbook, cache) {
        const firstDelta = this.safeDict(cache, 0);
        const nonce = this.safeInteger(orderbook, 'nonce');
        const firstDeltaStart = this.safeInteger(firstDelta, 'sequenceStart');
        if (nonce < firstDeltaStart - 1) {
            return -1;
        }
        for (let i = 0; i < cache.length; i++) {
            const delta = cache[i];
            const deltaStart = this.safeInteger(delta, 'sequenceStart');
            const deltaEnd = this.safeInteger(delta, 'sequenceEnd');
            if ((nonce >= deltaStart - 1) && (nonce < deltaEnd)) {
                return i;
            }
        }
        return cache.length;
    }
    /**
     * @method
     * @name backpack#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.backpack.exchange/#tag/Streams/Private/Order-update
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
        }
        let topic = 'account.orderUpdate';
        let messageHash = 'orders';
        if (market !== undefined) {
            topic = 'account.orderUpdate.' + market['id'];
            messageHash = 'orders:' + symbol;
        }
        const orders = await this.watchPrivate([topic], [messageHash], params);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    /**
     * @method
     * @name backpack#unWatchOrders
     * @description unWatches information on multiple orders made by the user
     * @see https://docs.backpack.exchange/#tag/Streams/Private/Order-update
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async unWatchOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
        }
        let topic = 'account.orderUpdate';
        let messageHash = 'unsubscribe:orders';
        if (market !== undefined) {
            topic = 'account.orderUpdate.' + market['id'];
            messageHash = 'unsubscribe:orders:' + symbol;
        }
        return await this.watchPrivate([topic], [messageHash], params, true);
    }
    handleOrder(client, message) {
        //
        //     {
        //         data: {
        //             E: '1754939110175843',
        //             O: 'USER',
        //             Q: '4.30',
        //             S: 'Bid',
        //             T: '1754939110174703',
        //             V: 'RejectTaker',
        //             X: 'New',
        //             Z: '0',
        //             e: 'orderAccepted',
        //             f: 'GTC',
        //             i: '5406825793',
        //             o: 'MARKET',
        //             q: '0.0010',
        //             r: false,
        //             s: 'ETH_USDC',
        //             t: null,
        //             z: '0'
        //         },
        //         stream: 'account.orderUpdate.ETH_USDC'
        //     }
        //
        const messageHash = 'orders';
        const data = this.safeDict(message, 'data', {});
        const marketId = this.safeString(data, 's');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const parsed = this.parseWsOrder(data, market);
        let orders = this.orders;
        if (orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            orders = new Cache.ArrayCacheBySymbolById(limit);
            this.orders = orders;
        }
        orders.append(parsed);
        client.resolve(orders, messageHash);
        const symbolSpecificMessageHash = messageHash + ':' + symbol;
        client.resolve(orders, symbolSpecificMessageHash);
    }
    parseWsOrder(order, market = undefined) {
        //
        //     {
        //         E: '1754939110175879',
        //         L: '4299.16',
        //         N: 'ETH',
        //         O: 'USER',
        //         Q: '4.30',
        //         S: 'Bid',
        //         T: '1754939110174705',
        //         V: 'RejectTaker',
        //         X: 'Filled',
        //         Z: '4.299160',
        //         e: 'orderFill',
        //         f: 'GTC',
        //         i: '5406825793',
        //         l: '0.0010',
        //         m: false,
        //         n: '0.000001',
        //         o: 'MARKET',
        //         q: '0.0010',
        //         r: false,
        //         s: 'ETH_USDC',
        //         t: 2888471,
        //         z: '0.0010'
        //     },
        //
        const id = this.safeString(order, 'i');
        const clientOrderId = this.safeString(order, 'c');
        const microseconds = this.safeInteger(order, 'E');
        const timestamp = this.parseToInt(microseconds / 1000);
        const status = this.parseWsOrderStatus(this.safeString(order, 'X'), market);
        const marketId = this.safeString(order, 's');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const type = this.safeStringLower(order, 'o');
        const timeInForce = this.safeString(order, 'f');
        const side = this.parseWsOrderSide(this.safeString(order, 'S'));
        const price = this.safeString(order, 'p');
        const triggerPrice = this.safeNumber(order, 'P');
        const amount = this.safeString(order, 'q');
        const cost = this.safeString(order, 'Z');
        const filled = this.safeString(order, 'l');
        let fee = undefined;
        const feeCurrency = this.safeString(order, 'N');
        if (feeCurrency !== undefined) {
            fee = {
                'currency': feeCurrency,
                'cost': undefined,
            };
        }
        return this.safeOrder({
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': triggerPrice,
            'average': undefined,
            'amount': amount,
            'cost': cost,
            'filled': filled,
            'remaining': undefined,
            'fee': fee,
            'trades': undefined,
            'info': order,
        }, market);
    }
    parseWsOrderStatus(status, market = undefined) {
        const statuses = {
            'New': 'open',
            'Filled': 'closed',
            'Cancelled': 'canceled',
            'Expired': 'canceled',
            'PartiallyFilled': 'open',
            'TriggerPending': 'open',
            'TriggerFailed': 'rejected',
        };
        return this.safeString(statuses, status, status);
    }
    parseWsOrderSide(side) {
        const sides = {
            'Bid': 'buy',
            'Ask': 'sell',
        };
        return this.safeString(sides, side, side);
    }
    /**
     * @method
     * @name backpack#watchPositions
     * @description watch all open positions
     * @see https://docs.backpack.exchange/#tag/Streams/Private/Position-update
     * @param {string[]} [symbols] list of unified market symbols to watch positions for
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const messageHashes = [];
        const topics = [];
        if (symbols !== undefined) {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                messageHashes.push('positions' + ':' + symbol);
                topics.push('account.positionUpdate.' + this.marketId(symbol));
            }
        }
        else {
            messageHashes.push('positions');
            topics.push('account.positionUpdate');
        }
        const positions = await this.watchPrivate(topics, messageHashes, params);
        if (this.newUpdates) {
            return positions;
        }
        return this.filterBySymbolsSinceLimit(this.positions, symbols, since, limit, true);
    }
    /**
     * @method
     * @name backpack#unWatchPositions
     * @description unWatches from the stream channel
     * @see https://docs.backpack.exchange/#tag/Streams/Private/Position-update
     * @param {string[]} [symbols] list of unified market symbols to watch positions for
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async unWatchPositions(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const messageHashes = [];
        const topics = [];
        if (symbols !== undefined) {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                messageHashes.push('unsubscribe:positions' + ':' + symbol);
                topics.push('account.positionUpdate.' + this.marketId(symbol));
            }
        }
        else {
            messageHashes.push('unsubscribe:positions');
            topics.push('account.positionUpdate');
        }
        return await this.watchPrivate(topics, messageHashes, params, true);
    }
    handlePositions(client, message) {
        //
        //     {
        //         data: {
        //             B: '4236.36',
        //             E: '1754943862040486',
        //             M: '4235.88650933',
        //             P: '-0.000473',
        //             Q: '0.0010',
        //             T: '1754943862040487',
        //             b: '4238.479',
        //             e: 'positionOpened',
        //             f: '0.02',
        //             i: 5411399049,
        //             l: '0',
        //             m: '0.0125',
        //             n: '4.23588650933',
        //             p: '0',
        //             q: '0.0010',
        //             s: 'ETH_USDC_PERP'
        //         },
        //         stream: 'account.positionUpdate'
        //     }
        //
        const messageHash = 'positions';
        const data = this.safeDict(message, 'data', {});
        if (this.positions === undefined) {
            this.positions = new Cache.ArrayCacheBySymbolById();
        }
        const cache = this.positions;
        const parsedPosition = this.parseWsPosition(data);
        const microseconds = this.safeInteger(data, 'E');
        const timestamp = this.parseToInt(microseconds / 1000);
        parsedPosition['timestamp'] = timestamp;
        parsedPosition['datetime'] = this.iso8601(timestamp);
        cache.append(parsedPosition);
        const symbolSpecificMessageHash = messageHash + ':' + parsedPosition['symbol'];
        client.resolve([parsedPosition], messageHash);
        client.resolve([parsedPosition], symbolSpecificMessageHash);
    }
    parseWsPosition(position, market = undefined) {
        //
        //     {
        //         B: '4236.36',
        //         E: '1754943862040486',
        //         M: '4235.88650933',
        //         P: '-0.000473',
        //         Q: '0.0010',
        //         T: '1754943862040487',
        //         b: '4238.479',
        //         e: 'positionOpened',
        //         f: '0.02',
        //         i: 5411399049,
        //         l: '0',
        //         m: '0.0125',
        //         n: '4.23588650933',
        //         p: '0',
        //         q: '0.0010',
        //         s: 'ETH_USDC_PERP'
        //     }
        //
        const id = this.safeString(position, 'i');
        const marketId = this.safeString(position, 's');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const notional = this.safeString(position, 'n');
        const liquidationPrice = this.safeString(position, 'l');
        const entryPrice = this.safeString(position, 'b');
        const realizedPnl = this.safeString(position, 'p');
        const unrealisedPnl = this.safeString(position, 'P');
        const contracts = this.safeString(position, 'Q');
        const markPrice = this.safeString(position, 'M');
        const netQuantity = this.safeNumber(position, 'q');
        let hedged = false;
        let side = 'long';
        if (netQuantity < 0) {
            side = 'short';
        }
        if (netQuantity === undefined) {
            hedged = undefined;
            side = undefined;
        }
        const microseconds = this.safeInteger(position, 'E');
        const timestamp = this.parseToInt(microseconds / 1000);
        const maintenanceMarginPercentage = this.safeNumber(position, 'm');
        const initialMarginPercentage = this.safeNumber(position, 'f');
        return this.safePosition({
            'info': position,
            'id': id,
            'symbol': symbol,
            'notional': notional,
            'marginMode': undefined,
            'liquidationPrice': liquidationPrice,
            'entryPrice': entryPrice,
            'realizedPnl': realizedPnl,
            'unrealizedPnl': unrealisedPnl,
            'percentage': undefined,
            'contracts': contracts,
            'contractSize': undefined,
            'markPrice': markPrice,
            'side': side,
            'hedged': hedged,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': maintenanceMarginPercentage,
            'collateral': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': initialMarginPercentage,
            'leverage': undefined,
            'marginRatio': undefined,
        });
    }
    handleMessage(client, message) {
        if (!this.handleErrorMessage(client, message)) {
            return;
        }
        const data = this.safeDict(message, 'data');
        const event = this.safeString(data, 'e');
        if (event === 'ticker') {
            this.handleTicker(client, message);
        }
        else if (event === 'bookTicker') {
            this.handleBidAsk(client, message);
        }
        else if (event === 'kline') {
            this.handleOHLCV(client, message);
        }
        else if (event === 'trade') {
            this.handleTrades(client, message);
        }
        else if (event === 'depth') {
            this.handleOrderBook(client, message);
        }
        else if (event === 'orderAccepted' || event === 'orderUpdate' || event === 'orderFill' || event === 'orderCancelled' || event === 'orderExpired' || event === 'orderModified' || event === 'triggerPlaced' || event === 'triggerFailed') {
            this.handleOrder(client, message);
        }
        else if (event === 'positionAdjusted' || event === 'positionOpened' || event === 'positionClosed' || event === 'positionUpdated') {
            this.handlePositions(client, message);
        }
    }
    handleErrorMessage(client, message) {
        //
        //     {
        //         id: null,
        //         error: {
        //             code: 4006,
        //             message: 'Invalid stream'
        //         }
        //     }
        //
        const error = this.safeDict(message, 'error', {});
        const code = this.safeInteger(error, 'code');
        try {
            if (code !== undefined) {
                const msg = this.safeString(error, 'message');
                throw new errors.ExchangeError(this.id + ' ' + msg);
            }
            return true;
        }
        catch (e) {
            client.reject(e);
        }
        return true;
    }
}

exports["default"] = backpack;
