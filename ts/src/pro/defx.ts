//  ---------------------------------------------------------------------------

import defxRest from '../defx.js';
import { ArgumentsRequired, ExchangeError } from '../base/errors.js';
import { ArrayCache, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import type { Int, OHLCV, Dict, Ticker, Trade, OrderBook, Strings, Tickers } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class defx extends defxRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchTicker': true,
                'watchTickers': true,
                'watchBidsAsks': false,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchMyTrades': false,
                'watchOrders': false,
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
            'streaming': {
            },
            'exceptions': {
            },
        });
    }

    async watchPublic (topics, messageHashes, params = {}) {
        await this.loadMarkets ();
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'method': 'SUBSCRIBE',
            'topics': topics,
        };
        const message = this.extend (request, params);
        return await this.watchMultiple (url, messageHashes, message, messageHashes);
    }

    async unWatchPublic (topics, messageHashes, params = {}) {
        await this.loadMarkets ();
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'method': 'UNSUBSCRIBE',
            'topics': topics,
        };
        const message = this.extend (request, params);
        return await this.watchMultiple (url, messageHashes, message, messageHashes);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
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
        const result = await this.watchOHLCVForSymbols ([ [ symbol, timeframe ] ], since, limit, params);
        return result[symbol][timeframe];
    }

    async unWatchOHLCV (symbol: string, timeframe = '1m', params = {}): Promise<any> {
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
        return await this.unWatchOHLCVForSymbols ([ [ symbol, timeframe ] ], params);
    }

    async watchOHLCVForSymbols (symbolsAndTimeframes: string[][], since: Int = undefined, limit: Int = undefined, params = {}) {
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
        const symbolsLength = symbolsAndTimeframes.length;
        if (symbolsLength === 0 || !Array.isArray (symbolsAndTimeframes[0])) {
            throw new ArgumentsRequired (this.id + " watchOHLCVForSymbols() requires a an array of symbols and timeframes, like  [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]");
        }
        await this.loadMarkets ();
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const symbolAndTimeframe = symbolsAndTimeframes[i];
            const marketId = this.safeString (symbolAndTimeframe, 0);
            const market = this.market (marketId);
            const tf = this.safeString (symbolAndTimeframe, 1);
            const interval = this.safeString (this.timeframes, tf, tf);
            topics.push ('symbol:' + market['id'] + ':ohlc:' + interval);
            messageHashes.push ('candles:' + interval + ':' + market['symbol']);
        }
        const [ symbol, timeframe, candles ] = await this.watchPublic (topics, messageHashes, params);
        if (this.newUpdates) {
            limit = candles.getLimit (symbol, limit);
        }
        const filtered = this.filterBySinceLimit (candles, since, limit, 0, true);
        return this.createOHLCVObject (symbol, timeframe, filtered);
    }

    async unWatchOHLCVForSymbols (symbolsAndTimeframes: string[][], params = {}): Promise<any> {
        /**
         * @method
         * @name defx#unWatchOHLCVForSymbols
         * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
         * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        const symbolsLength = symbolsAndTimeframes.length;
        if (symbolsLength === 0 || !Array.isArray (symbolsAndTimeframes[0])) {
            throw new ArgumentsRequired (this.id + " unWatchOHLCVForSymbols() requires a an array of symbols and timeframes, like  [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]");
        }
        await this.loadMarkets ();
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const symbolAndTimeframe = symbolsAndTimeframes[i];
            const marketId = this.safeString (symbolAndTimeframe, 0);
            const market = this.market (marketId);
            const tf = this.safeString (symbolAndTimeframe, 1);
            const interval = this.safeString (this.timeframes, tf, tf);
            topics.push ('symbol:' + market['id'] + ':ohlc:' + interval);
            messageHashes.push ('candles:' + interval + ':' + market['symbol']);
        }
        return await this.unWatchPublic (topics, messageHashes, params);
    }

    handleOHLCV (client: Client, message) {
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
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        const market = this.market (marketId);
        const symbol = market['symbol'];
        const timeframe = this.safeString (data, 'window');
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            const stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const ohlcv = this.ohlcvs[symbol][timeframe];
        const parsed = this.parseOHLCV (data);
        ohlcv.append (parsed);
        const messageHash = 'candles:' + timeframe + ':' + symbol;
        client.resolve ([ symbol, timeframe, ohlcv ], messageHash);
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name defx#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const topic = 'symbol:' + market['id'] + ':24hrTicker';
        const messageHash = 'ticker:' + symbol;
        return await this.watchPublic ([ topic ], [ messageHash ], params);
    }

    async unWatchTicker (symbol: string, params = {}): Promise<any> {
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
        return await this.unWatchTickers ([ symbol ], params);
    }

    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name defx#watchTickers
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
         * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
         * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId (symbol);
            topics.push ('symbol:' + marketId + ':24hrTicker');
            messageHashes.push ('ticker:' + symbol);
        }
        await this.watchPublic (topics, messageHashes, params);
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    async unWatchTickers (symbols: Strings = undefined, params = {}): Promise<any> {
        /**
         * @method
         * @name defx#unWatchTickers
         * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
         * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
         * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId (symbol);
            topics.push ('symbol:' + marketId + ':24hrTicker');
            messageHashes.push ('ticker:' + symbol);
        }
        return await this.unWatchPublic (topics, messageHashes, params);
    }

    handleTicker (client: Client, message) {
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
        const data = this.safeDict (message, 'data', {});
        const parsedTicker = this.parseTicker (data);
        const symbol = parsedTicker['symbol'];
        const timestamp = this.safeInteger (message, 'timestamp');
        parsedTicker['timestamp'] = timestamp;
        parsedTicker['datetime'] = this.iso8601 (timestamp);
        this.tickers[symbol] = parsedTicker;
        const messageHash = 'ticker:' + symbol;
        client.resolve (this.tickers[symbol], messageHash);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
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
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    async unWatchTrades (symbol: string, params = {}): Promise<any> {
        /**
         * @method
         * @name defx#unWatchTradesForSymbols
         * @description unWatches from the stream channel
         * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        return await this.unWatchTradesForSymbols ([ symbol ], params);
    }

    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
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
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' watchTradesForSymbols() requires a non-empty array of symbols');
        }
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId (symbol);
            topics.push ('symbol:' + marketId + ':trades');
            messageHashes.push ('trade:' + symbol);
        }
        const trades = await this.watchPublic (topics, messageHashes, params);
        if (this.newUpdates) {
            const first = this.safeValue (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async unWatchTradesForSymbols (symbols: string[], params = {}): Promise<any> {
        /**
         * @method
         * @name defx#unWatchTradesForSymbols
         * @description unWatches from the stream channel
         * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' unWatchTradesForSymbols() requires a non-empty array of symbols');
        }
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId (symbol);
            topics.push ('symbol:' + marketId + ':trades');
            messageHashes.push ('trade:' + symbol);
        }
        return await this.unWatchPublic (topics, messageHashes, params);
    }

    handleTrades (client: Client, message) {
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
        const data = this.safeDict (message, 'data', {});
        const parsedTrade = this.parseTrade (data);
        const symbol = parsedTrade['symbol'];
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            const stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const trades = this.trades[symbol];
        trades.append (parsedTrade);
        const messageHash = 'trade:' + symbol;
        client.resolve (trades, messageHash);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
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
        return await this.watchOrderBookForSymbols ([ symbol ], limit, params);
    }

    async unWatchOrderBook (symbol: string, params = {}): Promise<any> {
        /**
         * @method
         * @name defx#unWatchOrderBook
         * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
         * @param {string} symbol unified array of symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        return await this.unWatchOrderBookForSymbols ([ symbol ], params);
    }

    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
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
        await this.loadMarkets ();
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' watchOrderBookForSymbols() requires a non-empty array of symbols');
        }
        symbols = this.marketSymbols (symbols);
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId (symbol);
            topics.push ('symbol:' + marketId + ':depth:20:0.001');
            messageHashes.push ('orderbook:' + symbol);
        }
        const orderbook = await this.watchPublic (topics, messageHashes, params);
        return orderbook.limit ();
    }

    async unWatchOrderBookForSymbols (symbols: string[], params = {}): Promise<any> {
        /**
         * @method
         * @name defx#unWatchOrderBookForSymbols
         * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
         * @param {string[]} symbols unified array of symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' unWatchOrderBookForSymbols() requires a non-empty array of symbols');
        }
        symbols = this.marketSymbols (symbols);
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId (symbol);
            topics.push ('symbol:' + marketId + ':depth:20:0.001');
            messageHashes.push ('orderbook:' + symbol);
        }
        return await this.unWatchPublic (topics, messageHashes, params);
    }

    handleOrderBook (client: Client, message) {
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
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        const market = this.market (marketId);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (data, 'timestamp');
        const snapshot = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks', 'price', 'qty');
        if (!(symbol in this.orderbooks)) {
            const ob = this.orderBook (snapshot);
            this.orderbooks[symbol] = ob;
        }
        const orderbook = this.orderbooks[symbol];
        orderbook.reset (snapshot);
        const messageHash = 'orderbook:' + symbol;
        client.resolve (orderbook, messageHash);
    }

    handleMessage (client: Client, message) {
        const error = this.safeString (message, 'code');
        if (error !== undefined) {
            const errorMsg = this.safeString (message, 'msg');
            throw new ExchangeError (this.id + ' ' + errorMsg);
        }
        const event = this.safeString (message, 'event');
        if (event !== undefined) {
            const methods: Dict = {
                'ohlc': this.handleOHLCV,
                '24hrTicker': this.handleTicker,
                'trades': this.handleTrades,
                'depth': this.handleOrderBook,
            };
            const exacMethod = this.safeValue (methods, event);
            if (exacMethod !== undefined) {
                exacMethod.call (this, client, message);
            }
        }
    }
}
