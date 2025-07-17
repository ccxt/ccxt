//  ---------------------------------------------------------------------------
import defxRest from '../defx.js';
import { ArgumentsRequired, ExchangeError } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
//  ---------------------------------------------------------------------------
export default class defx extends defxRest {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchBidsAsks': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchMyTrades': false,
                'watchOrders': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': true,
            },
            'urls': {
                'test': {
                    'ws': {
                        'public': 'wss://stream.testnet.defx.com/pricefeed',
                        'private': 'wss://ws.testnet.defx.com/user',
                    },
                },
                'api': {
                    'ws': {
                        'public': 'wss://marketfeed.api.defx.com/pricefeed',
                        'private': 'wss://userfeed.api.defx.com/user',
                    },
                },
            },
            'options': {
                'listenKeyRefreshRate': 3540000,
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
                        '12h': '12h',
                        '1d': '1d',
                        '1w': '1w',
                        '1M': '1M',
                    },
                },
            },
            'streaming': {},
            'exceptions': {},
        });
    }
    async watchPublic(topics, messageHashes, params = {}) {
        await this.loadMarkets();
        const url = this.urls['api']['ws']['public'];
        const request = {
            'method': 'SUBSCRIBE',
            'topics': topics,
        };
        const message = this.extend(request, params);
        return await this.watchMultiple(url, messageHashes, message, messageHashes);
    }
    async unWatchPublic(topics, messageHashes, params = {}) {
        await this.loadMarkets();
        const url = this.urls['api']['ws']['public'];
        const request = {
            'method': 'UNSUBSCRIBE',
            'topics': topics,
        };
        const message = this.extend(request, params);
        return await this.watchMultiple(url, messageHashes, message, messageHashes);
    }
    /**
     * @method
     * @name defx#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
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
     * @name defx#unWatchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
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
     * @name defx#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCVForSymbols(symbolsAndTimeframes, since = undefined, limit = undefined, params = {}) {
        const symbolsLength = symbolsAndTimeframes.length;
        if (symbolsLength === 0 || !Array.isArray(symbolsAndTimeframes[0])) {
            throw new ArgumentsRequired(this.id + " watchOHLCVForSymbols() requires a an array of symbols and timeframes, like  [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]");
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
            topics.push('symbol:' + market['id'] + ':ohlc:' + interval);
            messageHashes.push('candles:' + interval + ':' + market['symbol']);
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
     * @name defx#unWatchOHLCVForSymbols
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async unWatchOHLCVForSymbols(symbolsAndTimeframes, params = {}) {
        const symbolsLength = symbolsAndTimeframes.length;
        if (symbolsLength === 0 || !Array.isArray(symbolsAndTimeframes[0])) {
            throw new ArgumentsRequired(this.id + " unWatchOHLCVForSymbols() requires a an array of symbols and timeframes, like  [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]");
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
            topics.push('symbol:' + market['id'] + ':ohlc:' + interval);
            messageHashes.push('candles:' + interval + ':' + market['symbol']);
        }
        return await this.unWatchPublic(topics, messageHashes, params);
    }
    handleOHLCV(client, message) {
        //
        // {
        //     "topic": "symbol:BTC_USDC:ohlc:3m",
        //     "event": "ohlc",
        //     "timestamp": 1730794277104,
        //     "data": {
        //         "symbol": "BTC_USDC",
        //         "window": "3m",
        //         "open": "57486.90000000",
        //         "high": "57486.90000000",
        //         "low": "57486.90000000",
        //         "close": "57486.90000000",
        //         "volume": "0.000",
        //         "quoteAssetVolume": "0.00000000",
        //         "takerBuyAssetVolume": "0.000",
        //         "takerBuyQuoteAssetVolume": "0.00000000",
        //         "numberOfTrades": 0,
        //         "start": 1730794140000,
        //         "end": 1730794320000,
        //         "isClosed": false
        //     }
        // }
        //
        const data = this.safeDict(message, 'data', {});
        const marketId = this.safeString(data, 'symbol');
        const market = this.market(marketId);
        const symbol = market['symbol'];
        const timeframe = this.safeString(data, 'window');
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            const stored = new ArrayCacheByTimestamp(limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const ohlcv = this.ohlcvs[symbol][timeframe];
        const parsed = this.parseOHLCV(data);
        ohlcv.append(parsed);
        const messageHash = 'candles:' + timeframe + ':' + symbol;
        client.resolve([symbol, timeframe, ohlcv], messageHash);
    }
    /**
     * @method
     * @name defx#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const topic = 'symbol:' + market['id'] + ':24hrTicker';
        const messageHash = 'ticker:' + symbol;
        return await this.watchPublic([topic], [messageHash], params);
    }
    /**
     * @method
     * @name defx#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchTicker(symbol, params = {}) {
        return await this.unWatchTickers([symbol], params);
    }
    /**
     * @method
     * @name defx#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId(symbol);
            topics.push('symbol:' + marketId + ':24hrTicker');
            messageHashes.push('ticker:' + symbol);
        }
        await this.watchPublic(topics, messageHashes, params);
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    /**
     * @method
     * @name defx#unWatchTickers
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
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
            topics.push('symbol:' + marketId + ':24hrTicker');
            messageHashes.push('ticker:' + symbol);
        }
        return await this.unWatchPublic(topics, messageHashes, params);
    }
    handleTicker(client, message) {
        //
        // {
        //     "topic": "symbol:BTC_USDC:24hrTicker",
        //     "event": "24hrTicker",
        //     "timestamp": 1730862543095,
        //     "data": {
        //         "symbol": "BTC_USDC",
        //         "priceChange": "17114.70000000",
        //         "priceChangePercent": "29.77",
        //         "weightedAvgPrice": "6853147668",
        //         "lastPrice": "74378.90000000",
        //         "lastQty": "0.107",
        //         "bestBidPrice": "61987.60000000",
        //         "bestBidQty": "0.005",
        //         "bestAskPrice": "84221.60000000",
        //         "bestAskQty": "0.015",
        //         "openPrice": "57486.90000000",
        //         "highPrice": "88942.60000000",
        //         "lowPrice": "47364.20000000",
        //         "volume": "28.980",
        //         "quoteVolume": "1986042.19424035",
        //         "openTime": 1730776080000,
        //         "closeTime": 1730862540000,
        //         "openInterestBase": "67.130",
        //         "openInterestQuote": "5008005.40800000"
        //     }
        // }
        //
        this.handleBidAsk(client, message);
        const data = this.safeDict(message, 'data', {});
        const parsedTicker = this.parseTicker(data);
        const symbol = parsedTicker['symbol'];
        const timestamp = this.safeInteger(message, 'timestamp');
        parsedTicker['timestamp'] = timestamp;
        parsedTicker['datetime'] = this.iso8601(timestamp);
        this.tickers[symbol] = parsedTicker;
        const messageHash = 'ticker:' + symbol;
        client.resolve(parsedTicker, messageHash);
    }
    /**
     * @method
     * @name defx#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
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
            topics.push('symbol:' + marketId + ':24hrTicker');
            messageHashes.push('bidask:' + symbol);
        }
        await this.watchPublic(topics, messageHashes, params);
        return this.filterByArray(this.bidsasks, 'symbol', symbols);
    }
    handleBidAsk(client, message) {
        const data = this.safeDict(message, 'data', {});
        const parsedTicker = this.parseWsBidAsk(data);
        const symbol = parsedTicker['symbol'];
        const timestamp = this.safeInteger(message, 'timestamp');
        parsedTicker['timestamp'] = timestamp;
        parsedTicker['datetime'] = this.iso8601(timestamp);
        this.bidsasks[symbol] = parsedTicker;
        const messageHash = 'bidask:' + symbol;
        client.resolve(parsedTicker, messageHash);
    }
    parseWsBidAsk(ticker, market = undefined) {
        const marketId = this.safeString(ticker, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = this.safeString(market, 'symbol');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'ask': this.safeString(ticker, 'bestAskPrice'),
            'askVolume': this.safeString(ticker, 'bestAskQty'),
            'bid': this.safeString(ticker, 'bestBidPrice'),
            'bidVolume': this.safeString(ticker, 'bestBidQty'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name defx#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
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
     * @name defx#unWatchTrades
     * @description unWatches from the stream channel
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async unWatchTrades(symbol, params = {}) {
        return await this.unWatchTradesForSymbols([symbol], params);
    }
    /**
     * @method
     * @name defx#watchTradesForSymbols
     * @description watches information on multiple trades made in a market
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
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
            throw new ArgumentsRequired(this.id + ' watchTradesForSymbols() requires a non-empty array of symbols');
        }
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId(symbol);
            topics.push('symbol:' + marketId + ':trades');
            messageHashes.push('trade:' + symbol);
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
     * @name defx#unWatchTradesForSymbols
     * @description unWatches from the stream channel
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async unWatchTradesForSymbols(symbols, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired(this.id + ' unWatchTradesForSymbols() requires a non-empty array of symbols');
        }
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId(symbol);
            topics.push('symbol:' + marketId + ':trades');
            messageHashes.push('trade:' + symbol);
        }
        return await this.unWatchPublic(topics, messageHashes, params);
    }
    handleTrades(client, message) {
        //
        // {
        //     "topic": "symbol:SOL_USDC:trades",
        //     "event": "trades",
        //     "timestamp": 1730967426331,
        //     "data": {
        //         "buyerMaker": true,
        //         "price": "188.38700000",
        //         "qty": "1.00",
        //         "symbol": "SOL_USDC",
        //         "timestamp": 1730967426328
        //     }
        // }
        //
        const data = this.safeDict(message, 'data', {});
        const parsedTrade = this.parseTrade(data);
        const symbol = parsedTrade['symbol'];
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            const stored = new ArrayCache(limit);
            this.trades[symbol] = stored;
        }
        const trades = this.trades[symbol];
        trades.append(parsedTrade);
        const messageHash = 'trade:' + symbol;
        client.resolve(trades, messageHash);
    }
    /**
     * @method
     * @name defx#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
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
     * @name defx#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string} symbol unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBook(symbol, params = {}) {
        return await this.unWatchOrderBookForSymbols([symbol], params);
    }
    /**
     * @method
     * @name defx#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols(symbols, limit = undefined, params = {}) {
        await this.loadMarkets();
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired(this.id + ' watchOrderBookForSymbols() requires a non-empty array of symbols');
        }
        symbols = this.marketSymbols(symbols);
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId(symbol);
            topics.push('symbol:' + marketId + ':depth:20:0.001');
            messageHashes.push('orderbook:' + symbol);
        }
        const orderbook = await this.watchPublic(topics, messageHashes, params);
        return orderbook.limit();
    }
    /**
     * @method
     * @name defx#unWatchOrderBookForSymbols
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string[]} symbols unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBookForSymbols(symbols, params = {}) {
        await this.loadMarkets();
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired(this.id + ' unWatchOrderBookForSymbols() requires a non-empty array of symbols');
        }
        symbols = this.marketSymbols(symbols);
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId(symbol);
            topics.push('symbol:' + marketId + ':depth:20:0.001');
            messageHashes.push('orderbook:' + symbol);
        }
        return await this.unWatchPublic(topics, messageHashes, params);
    }
    handleOrderBook(client, message) {
        //
        // {
        //     "topic": "symbol:SOL_USDC:depth:20:0.01",
        //     "event": "depth",
        //     "timestamp": 1731030695319,
        //     "data": {
        //         "symbol": "SOL_USDC",
        //         "timestamp": 1731030695319,
        //         "lastTradeTimestamp": 1731030275258,
        //         "level": "20",
        //         "slab": "0.01",
        //         "bids": [
        //             {
        //                 "price": "198.27000000",
        //                 "qty": "1.52"
        //             }
        //         ],
        //         "asks": [
        //             {
        //                 "price": "198.44000000",
        //                 "qty": "6.61"
        //             }
        //         ]
        //     }
        // }
        //
        const data = this.safeDict(message, 'data', {});
        const marketId = this.safeString(data, 'symbol');
        const market = this.market(marketId);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger(data, 'timestamp');
        const snapshot = this.parseOrderBook(data, symbol, timestamp, 'bids', 'asks', 'price', 'qty');
        if (!(symbol in this.orderbooks)) {
            const ob = this.orderBook(snapshot);
            this.orderbooks[symbol] = ob;
        }
        const orderbook = this.orderbooks[symbol];
        orderbook.reset(snapshot);
        const messageHash = 'orderbook:' + symbol;
        client.resolve(orderbook, messageHash);
    }
    async keepAliveListenKey(params = {}) {
        const listenKey = this.safeString(this.options, 'listenKey');
        if (listenKey === undefined) {
            // A network error happened: we can't renew a listen key that does not exist.
            return;
        }
        try {
            await this.v1PrivatePutApiUsersSocketListenKeysListenKey({ 'listenKey': listenKey }); // extend the expiry
        }
        catch (error) {
            const url = this.urls['api']['ws']['private'] + '?listenKey=' + listenKey;
            const client = this.client(url);
            const messageHashes = Object.keys(client.futures);
            for (let j = 0; j < messageHashes.length; j++) {
                const messageHash = messageHashes[j];
                client.reject(error, messageHash);
            }
            this.options['listenKey'] = undefined;
            this.options['lastAuthenticatedTime'] = 0;
            return;
        }
        // whether or not to schedule another listenKey keepAlive request
        const listenKeyRefreshRate = this.safeInteger(this.options, 'listenKeyRefreshRate', 3540000);
        this.delay(listenKeyRefreshRate, this.keepAliveListenKey, params);
    }
    async authenticate(params = {}) {
        const time = this.milliseconds();
        const lastAuthenticatedTime = this.safeInteger(this.options, 'lastAuthenticatedTime', 0);
        const listenKeyRefreshRate = this.safeInteger(this.options, 'listenKeyRefreshRate', 3540000); // 1 hour
        if (time - lastAuthenticatedTime > listenKeyRefreshRate) {
            const response = await this.v1PrivatePostApiUsersSocketListenKeys();
            this.options['listenKey'] = this.safeString(response, 'listenKey');
            this.options['lastAuthenticatedTime'] = time;
            this.delay(listenKeyRefreshRate, this.keepAliveListenKey, params);
        }
    }
    /**
     * @method
     * @name defx#watchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.postman.com/defxcode/defx-public-apis/ws-raw-request/667939b2f00f79161bb47809
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        await this.loadMarkets();
        await this.authenticate();
        const baseUrl = this.urls['api']['ws']['private'];
        const messageHash = 'WALLET_BALANCE_UPDATE';
        const url = baseUrl + '?listenKey=' + this.options['listenKey'];
        return await this.watch(url, messageHash, undefined, messageHash);
    }
    handleBalance(client, message) {
        //
        // {
        //     "event": "WALLET_BALANCE_UPDATE",
        //     "timestamp": 1711015961397,
        //     "data": {
        //         "asset": "USDC", "balance": "27.64712963"
        //     }
        // }
        //
        const messageHash = this.safeString(message, 'event');
        const data = this.safeDict(message, 'data', []);
        const timestamp = this.safeInteger(message, 'timestamp');
        if (this.balance === undefined) {
            this.balance = {};
        }
        this.balance['info'] = data;
        this.balance['timestamp'] = timestamp;
        this.balance['datetime'] = this.iso8601(timestamp);
        const currencyId = this.safeString(data, 'asset');
        const code = this.safeCurrencyCode(currencyId);
        const account = (code in this.balance) ? this.balance[code] : this.account();
        account['free'] = this.safeString(data, 'balance');
        this.balance[code] = account;
        this.balance = this.safeBalance(this.balance);
        client.resolve(this.balance, messageHash);
    }
    /**
     * @method
     * @name defx#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://www.postman.com/defxcode/defx-public-apis/ws-raw-request/667939b2f00f79161bb47809
     * @param {string} [symbol] unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        await this.authenticate();
        const baseUrl = this.urls['api']['ws']['private'];
        let messageHash = 'orders';
        if (symbol !== undefined) {
            const market = this.market(symbol);
            messageHash += ':' + market['symbol'];
        }
        const url = baseUrl + '?listenKey=' + this.options['listenKey'];
        const orders = await this.watch(url, messageHash, undefined, messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    handleOrder(client, message) {
        //
        // {
        //     "event": "ORDER_UPDATE",
        //     "timestamp": 1731417961446,
        //     "data": {
        //         "orderId": "766738557656630928",
        //         "symbol": "SOL_USDC",
        //         "side": "SELL",
        //         "type": "MARKET",
        //         "status": "FILLED",
        //         "clientOrderId": "0193208d-717b-7811-a80e-c036e220ad9b",
        //         "reduceOnly": false,
        //         "postOnly": false,
        //         "timeInForce": "GTC",
        //         "isTriggered": false,
        //         "createdAt": "2024-11-12T13:26:00.829Z",
        //         "updatedAt": "2024-11-12T13:26:01.436Z",
        //         "avgPrice": "209.60000000",
        //         "cumulativeQuote": "104.80000000",
        //         "totalFee": "0.05764000",
        //         "executedQty": "0.50",
        //         "origQty": "0.50",
        //         "role": "TAKER",
        //         "pnl": "0.00000000",
        //         "lastFillPnL": "0.00000000",
        //         "lastFillPrice": "209.60000000",
        //         "lastFillQty": "0.50",
        //         "linkedOrderParentType": null,
        //         "workingType": null
        //     }
        // }
        //
        const channel = 'orders';
        const data = this.safeDict(message, 'data', {});
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById(limit);
        }
        const orders = this.orders;
        const parsedOrder = this.parseOrder(data);
        orders.append(parsedOrder);
        const messageHash = channel + ':' + parsedOrder['symbol'];
        client.resolve(orders, channel);
        client.resolve(orders, messageHash);
    }
    /**
     * @method
     * @name defx#watchPositions
     * @description watch all open positions
     * @see https://www.postman.com/defxcode/defx-public-apis/ws-raw-request/667939b2f00f79161bb47809
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {number} [since] since timestamp
     * @param {number} [limit] limit
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        await this.authenticate();
        symbols = this.marketSymbols(symbols);
        const baseUrl = this.urls['api']['ws']['private'];
        const channel = 'positions';
        const url = baseUrl + '?listenKey=' + this.options['listenKey'];
        let newPosition = undefined;
        if (symbols !== undefined) {
            const messageHashes = [];
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                messageHashes.push(channel + ':' + symbol);
            }
            newPosition = await this.watchMultiple(url, messageHashes, undefined, messageHashes);
        }
        else {
            newPosition = await this.watch(url, channel, undefined, channel);
        }
        if (this.newUpdates) {
            return newPosition;
        }
        return this.filterBySymbolsSinceLimit(this.positions, symbols, since, limit, true);
    }
    handlePositions(client, message) {
        //
        // {
        //     "event": "POSITION_UPDATE",
        //     "timestamp": 1731417961456,
        //     "data": {
        //         "positionId": "0193208d-735d-7fe9-90bd-8bc6d6bc1eda",
        //         "createdAt": 1289847904328,
        //         "symbol": "SOL_USDC",
        //         "positionSide": "SHORT",
        //         "entryPrice": "209.60000000",
        //         "quantity": "0.50",
        //         "status": "ACTIVE",
        //         "marginAsset": "USDC",
        //         "marginAmount": "15.17475649",
        //         "realizedPnL": "0.00000000"
        //     }
        // }
        //
        const channel = 'positions';
        const data = this.safeDict(message, 'data', {});
        if (this.positions === undefined) {
            this.positions = new ArrayCacheBySymbolById();
        }
        const cache = this.positions;
        const parsedPosition = this.parsePosition(data);
        const timestamp = this.safeInteger(message, 'timestamp');
        parsedPosition['timestamp'] = timestamp;
        parsedPosition['datetime'] = this.iso8601(timestamp);
        cache.append(parsedPosition);
        const messageHash = channel + ':' + parsedPosition['symbol'];
        client.resolve([parsedPosition], channel);
        client.resolve([parsedPosition], messageHash);
    }
    handleMessage(client, message) {
        const error = this.safeString(message, 'code');
        if (error !== undefined) {
            const errorMsg = this.safeString(message, 'msg');
            throw new ExchangeError(this.id + ' ' + errorMsg);
        }
        const event = this.safeString(message, 'event');
        if (event !== undefined) {
            const methods = {
                'ohlc': this.handleOHLCV,
                '24hrTicker': this.handleTicker,
                'trades': this.handleTrades,
                'depth': this.handleOrderBook,
                'WALLET_BALANCE_UPDATE': this.handleBalance,
                'ORDER_UPDATE': this.handleOrder,
                'POSITION_UPDATE': this.handlePositions,
            };
            const exacMethod = this.safeValue(methods, event);
            if (exacMethod !== undefined) {
                exacMethod.call(this, client, message);
            }
        }
    }
}
