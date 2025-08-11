
//  ---------------------------------------------------------------------------

import backpackRest from '../backpack.js';
import { ArgumentsRequired } from '../base/errors.js';
import type { Dict, Int, Market, OHLCV, OrderBook, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import { ArrayCache, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class backpack extends backpackRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': true,
                'watchOrders': false,
                'watchMyTrades': false,
                'watchTicker': true,
                'watchTickers': true,
                'watchBidsAsks': true,
                'watchBalance': false,
                'createOrderWs': false,
                'editOrderWs': false,
                'cancelOrderWs': false,
                'cancelOrdersWs': false,
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
                'timeframes': {
                },
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 119000,
            },
        });
    }

    async watchPublic (topics, messageHashes, params = {}, unwatch = false) {
        await this.loadMarkets ();
        const url = this.urls['api']['ws']['public'];
        const method = unwatch ? 'UNSUBSCRIBE' : 'SUBSCRIBE';
        const request: Dict = {
            'method': method,
            'params': topics,
        };
        const message = this.deepExtend (request, params);
        return await this.watchMultiple (url, messageHashes, message, messageHashes);
    }

    /**
     * @method
     * @name crybackpackptocom#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const topic = 'ticker' + '.' + market['id'];
        const messageHash = 'ticker' + ':' + symbol;
        return await this.watchPublic ([ topic ], [ messageHash ], params);
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
    async unWatchTicker (symbol: string, params = {}): Promise<any> {
        return await this.unWatchTickers ([ symbol ], params);
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
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        const messageHashes = [];
        const topics = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId (symbol);
            messageHashes.push ('ticker:' + symbol);
            topics.push ('ticker.' + marketId);
        }
        await this.watchPublic (topics, messageHashes, params);
        return this.filterByArray (this.tickers, 'symbol', symbols);
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
    async unWatchTickers (symbols: Strings = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId (symbol);
            topics.push ('ticker.' + marketId);
            messageHashes.push ('ticker:' + symbol);
        }
        return await this.watchPublic (topics, messageHashes, params, true);
    }

    handleTicker (client: Client, message) {
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
        const ticker = this.safeDict (message, 'data', {});
        const marketId = this.safeString (ticker, 's');
        const market = this.safeMarket (marketId);
        const symbol = this.safeSymbol (marketId, market);
        const parsedTicker = this.parseWsTicker (ticker, market);
        const messageHash = 'ticker' + ':' + symbol;
        this.tickers[symbol] = parsedTicker;
        client.resolve (parsedTicker, messageHash);
    }

    parseWsTicker (ticker: Dict, market: Market = undefined): Ticker {
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
        const microseconds = this.safeInteger (ticker, 'E');
        const timestamp = this.parseToInt (microseconds / 1000);
        const marketId = this.safeString (ticker, 's');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeString (ticker, 'c');
        const open = this.safeString (ticker, 'o');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'h'),
            'low': this.safeNumber (ticker, 'l'),
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
            'baseVolume': this.safeString (ticker, 'v'),
            'quoteVolume': this.safeString (ticker, 'V'),
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
    async watchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId (symbol);
            topics.push ('bookTicker.' + marketId);
            messageHashes.push ('bidask:' + symbol);
        }
        await this.watchPublic (topics, messageHashes, params);
        return this.filterByArray (this.bidsasks, 'symbol', symbols);
    }

    handleBidAsk (client: Client, message) {
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
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 's');
        const market = this.safeMarket (marketId);
        const symbol = this.safeSymbol (marketId, market);
        const parsedBidAsk = this.parseWsBidAsk (data, market);
        const messageHash = 'bidask' + ':' + symbol;
        this.bidsasks[symbol] = parsedBidAsk;
        client.resolve (parsedBidAsk, messageHash);
    }

    parseWsBidAsk (ticker, market = undefined) {
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
        const marketId = this.safeString (ticker, 's');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeString (market, 'symbol');
        const microseconds = this.safeInteger (ticker, 'E');
        const timestamp = this.parseToInt (microseconds / 1000);
        const ask = this.safeString (ticker, 'a');
        const askVolume = this.safeString (ticker, 'A');
        const bid = this.safeString (ticker, 'b');
        const bidVolume = this.safeString (ticker, 'B');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
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
    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        const result = await this.watchOHLCVForSymbols ([ [ symbol, timeframe ] ], since, limit, params);
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
    async unWatchOHLCV (symbol: string, timeframe = '1m', params = {}): Promise<any> {
        return await this.unWatchOHLCVForSymbols ([ [ symbol, timeframe ] ], params);
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
    async watchOHLCVForSymbols (symbolsAndTimeframes: string[][], since: Int = undefined, limit: Int = undefined, params = {}) {
        const symbolsLength = symbolsAndTimeframes.length;
        if (symbolsLength === 0 || !Array.isArray (symbolsAndTimeframes[0])) {
            throw new ArgumentsRequired (this.id + " watchOHLCVForSymbols() requires a an array of symbols and timeframes, like  ['ETH/USDC', '1m']");
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
            topics.push ('kline.' + interval + '.' + market['id']);
            messageHashes.push ('candles:' + interval + ':' + market['symbol']);
        }
        const [ symbol, timeframe, candles ] = await this.watchPublic (topics, messageHashes, params);
        if (this.newUpdates) {
            limit = candles.getLimit (symbol, limit);
        }
        const filtered = this.filterBySinceLimit (candles, since, limit, 0, true);
        return this.createOHLCVObject (symbol, timeframe, filtered);
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
    async unWatchOHLCVForSymbols (symbolsAndTimeframes: string[][], params = {}): Promise<any> {
        const symbolsLength = symbolsAndTimeframes.length;
        if (symbolsLength === 0 || !Array.isArray (symbolsAndTimeframes[0])) {
            throw new ArgumentsRequired (this.id + " unWatchOHLCVForSymbols() requires a an array of symbols and timeframes, like  ['ETH/USDC', '1m']");
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
            topics.push ('kline.' + interval + '.' + market['id']);
            messageHashes.push ('candles:' + interval + ':' + market['symbol']);
        }
        return await this.watchPublic (topics, messageHashes, params, true);
    }

    handleOHLCV (client: Client, message) {
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
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 's');
        const market = this.market (marketId);
        const symbol = market['symbol'];
        const stream = this.safeString (message, 'stream');
        const parts = stream.split ('.');
        const timeframe = this.safeString (parts, 1);
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            const stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const ohlcv = this.ohlcvs[symbol][timeframe];
        const parsed = this.parseWsOHLCV (data);
        ohlcv.append (parsed);
        const messageHash = 'candles:' + timeframe + ':' + symbol;
        client.resolve ([ symbol, timeframe, ohlcv ], messageHash);
    }

    parseWsOHLCV (ohlcv, market = undefined): OHLCV {
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
            this.parse8601 (this.safeString (ohlcv, 'T')),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber (ohlcv, 'v'),
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
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
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
    async unWatchTrades (symbol: string, params = {}): Promise<any> {
        return await this.unWatchTradesForSymbols ([ symbol ], params);
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
    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
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
            topics.push ('trade.' + marketId);
            messageHashes.push ('trades:' + symbol);
        }
        const trades = await this.watchPublic (topics, messageHashes, params);
        if (this.newUpdates) {
            const first = this.safeValue (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
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
    async unWatchTradesForSymbols (symbols: string[], params = {}): Promise<any> {
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
            topics.push ('trade.' + marketId);
            messageHashes.push ('trades:' + symbol);
        }
        return await this.watchPublic (topics, messageHashes, params, true);
    }

    handleTrades (client: Client, message) {
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
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 's');
        const market = this.market (marketId);
        const symbol = market['symbol'];
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            const stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const cache = this.trades[symbol];
        const trade = this.parseWsTrade (data, market);
        cache.append (trade);
        const messageHash = 'trades:' + symbol;
        client.resolve (cache, messageHash);
        client.resolve (cache, 'trades');
    }

    parseWsTrade (trade, market = undefined) {
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
        const microseconds = this.safeInteger (trade, 'E');
        const timestamp = this.parseToInt (microseconds / 1000);
        const id = this.safeString (trade, 't');
        const marketId = this.safeString (trade, 's');
        market = this.safeMarket (marketId, market);
        const isMaker = this.safeBool (trade, 'm');
        const side = isMaker ? 'sell' : 'buy';
        const takerOrMaker = isMaker ? 'maker' : 'taker';
        const price = this.safeString (trade, 'p');
        const amount = this.safeString (trade, 'q');
        let orderId = undefined;
        if (side === 'buy') {
            orderId = this.safeString (trade, 'b');
        } else {
            orderId = this.safeString (trade, 'a');
        }
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
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
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        return await this.watchOrderBookForSymbols ([ symbol ], limit, params);
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
    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        const marketIds = this.marketIds (symbols);
        const messageHashes = [];
        const topics = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            messageHashes.push ('orderbook:' + symbol);
            const marketId = marketIds[i];
            const topic = 'depth.' + marketId;
            topics.push (topic);
        }
        const orderbook = await this.watchPublic (topics, messageHashes, params);
        return orderbook.limit (); // todo check if limit is needed
    }

    /**
     * @method
     * @name backpack#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Depth
     * @param {string} symbol unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBook (symbol: string, params = {}): Promise<any> {
        return await this.unWatchOrderBookForSymbols ([ symbol ], params);
    }

    handleOrderBook (client: Client, message) {
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
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 's');
        const symbol = this.safeSymbol (marketId);
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ();
        }
        const storedOrderBook = this.orderbooks[symbol];
        const nonce = this.safeInteger (storedOrderBook, 'nonce');
        const deltaNonce = this.safeInteger (data, 'u');
        const messageHash = 'orderbook:' + symbol;
        if (nonce === undefined) {
            const cacheLength = storedOrderBook.cache.length;
            // the rest API is very delayed
            // usually it takes at least 9 deltas to resolve
            const snapshotDelay = this.handleOption ('watchOrderBook', 'snapshotDelay', 10);
            if (cacheLength === snapshotDelay) {
                this.spawn (this.loadOrderBook, client, messageHash, symbol, null, {});
            }
            storedOrderBook.cache.push (data);
            return;
        } else if (nonce >= deltaNonce) {
            return;
        }
        this.handleDelta (storedOrderBook, data);
        client.resolve (storedOrderBook, messageHash);
    }

    handleDelta (orderbook, delta) {
        const timestamp = this.safeTimestamp (delta, 'T');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        orderbook['nonce'] = this.safeInteger (delta, 'u');
        const bids = this.safeDict (delta, 'b', []);
        const asks = this.safeDict (delta, 'a', []);
        const storedBids = orderbook['bids'];
        const storedAsks = orderbook['asks'];
        this.handleBidAsks (storedBids, bids);
        this.handleBidAsks (storedAsks, asks);
    }

    handleBidAsks (bookSide, bidAsks) {
        for (let i = 0; i < bidAsks.length; i++) {
            const bidAsk = this.parseBidAsk (bidAsks[i]);
            bookSide.storeArray (bidAsk);
        }
    }

    getCacheIndex (orderbook, cache) {
        const firstDelta = this.safeDict (cache, 0);
        const nonce = this.safeInteger (orderbook, 'nonce');
        const firstDeltaStart = this.safeInteger (firstDelta, 'sequenceStart');
        if (nonce < firstDeltaStart - 1) {
            return -1;
        }
        for (let i = 0; i < cache.length; i++) {
            const delta = cache[i];
            const deltaStart = this.safeInteger (delta, 'sequenceStart');
            const deltaEnd = this.safeInteger (delta, 'sequenceEnd');
            if ((nonce >= deltaStart - 1) && (nonce < deltaEnd)) {
                return i;
            }
        }
        return cache.length;
    }

    handleMessage (client: Client, message) {
        // add handleError message
        // { id: null, error: { code: 4006, message: 'Invalid stream' } }
        const data = this.safeDict (message, 'data');
        const event = this.safeString (data, 'e');
        const methods: Dict = {
            'ticker': this.handleTicker,
            'bookTicker': this.handleBidAsk,
            'kline': this.handleOHLCV,
            'trade': this.handleTrades,
        };
        const method = this.safeValue (methods, event);
        if (method !== undefined) {
            method.call (this, client, message);
        }
        if (event === 'ticker') {
            this.handleTicker (client, message);
        } else if (event === 'bookTicker') {
            this.handleBidAsk (client, message);
        } else if (event === 'kline') {
            this.handleOHLCV (client, message);
        } else if (event === 'trade') {
            this.handleTrades (client, message);
        } else if (event === 'depth') {
            this.handleOrderBook (client, message);
        }
    }
}
