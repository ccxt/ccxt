
//  ---------------------------------------------------------------------------

import asterRest from '../aster.js';
import { ArgumentsRequired } from '../base/errors.js';
import type { Strings, Tickers, Dict, Ticker, Int, Market, Trade, OrderBook, OHLCV } from '../base/types.js';
import { ArrayCache, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class aster extends asterRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchBidsAsks': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchMarkPrice': true,
                'watchMarkPrices': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': true,
                'unWatchTicker': true,
                'unWatchTickers': true,
                'unWatchMarkPrice': true,
                'unWatchMarkPrices': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://fstream.asterdex.com/stream',
                },
            },
            'options': {},
            'streaming': {},
            'exceptions': {},
        });
    }

    /**
     * @method
     * @name aster#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#individual-symbol-ticker-streams
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        params['callerMethodName'] = 'watchTicker';
        await this.loadMarkets ();
        symbol = this.safeSymbol (symbol);
        const tickers = await this.watchTickers ([ symbol ], params);
        return tickers[symbol];
    }

    /**
     * @method
     * @name aster#unWatchTicker
     * @description unWatches a price ticker
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#individual-symbol-ticker-streams
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchTicker (symbol: string, params = {}): Promise<any> {
        params['callerMethodName'] = 'unWatchTicker';
        return await this.unWatchTickers ([ symbol ], params);
    }

    /**
     * @method
     * @name aster#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#individual-symbol-ticker-streams
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const symbolsLength = symbols.length;
        let methodName = undefined;
        [ methodName, params ] = this.handleParamString (params, 'callerMethodName', 'watchTickers');
        params = this.omit (params, 'callerMethodName');
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires a non-empty array of symbols');
        }
        const url = this.urls['api']['ws'];
        const subscriptionArgs = [];
        const messageHashes = [];
        const request: Dict = {
            'method': 'SUBSCRIBE',
            'params': subscriptionArgs,
        };
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            subscriptionArgs.push (this.safeStringLower (market, 'id') + '@ticker');
            messageHashes.push ('ticker:' + market['symbol']);
        }
        const newTicker = await this.watchMultiple (url, messageHashes, this.extend (request, params), messageHashes);
        if (this.newUpdates) {
            const result: Dict = {};
            result[newTicker['symbol']] = newTicker;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    /**
     * @method
     * @name aster#unWatchTickers
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#individual-symbol-ticker-streams
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchTickers (symbols: Strings = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const symbolsLength = symbols.length;
        let methodName = undefined;
        [ methodName, params ] = this.handleParamString (params, 'callerMethodName', 'unWatchTickers');
        params = this.omit (params, 'callerMethodName');
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires a non-empty array of symbols');
        }
        const url = this.urls['api']['ws'];
        const subscriptionArgs = [];
        const messageHashes = [];
        const request: Dict = {
            'method': 'UNSUBSCRIBE',
            'params': subscriptionArgs,
        };
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            subscriptionArgs.push (this.safeStringLower (market, 'id') + '@ticker');
            messageHashes.push ('unsubscribe:ticker:' + market['symbol']);
        }
        return await this.watchMultiple (url, messageHashes, this.extend (request, params), messageHashes);
    }

    /**
     * @method
     * @name aster#watchMarkPrice
     * @description watches a mark price for a specific market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#mark-price-stream
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.use1sFreq] *default is true* if set to true, the mark price will be updated every second, otherwise every 3 seconds
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchMarkPrice (symbol: string, params = {}): Promise<Ticker> {
        params['callerMethodName'] = 'watchMarkPrice';
        await this.loadMarkets ();
        symbol = this.safeSymbol (symbol);
        const tickers = await this.watchMarkPrices ([ symbol ], params);
        return tickers[symbol];
    }

    /**
     * @method
     * @name aster#unWatchMarkPrice
     * @description unWatches a mark price for a specific market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#mark-price-stream
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.use1sFreq] *default is true* if set to true, the mark price will be updated every second, otherwise every 3 seconds
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchMarkPrice (symbol: string, params = {}): Promise<any> {
        params['callerMethodName'] = 'unWatchMarkPrice';
        return await this.unWatchMarkPrices ([ symbol ], params);
    }

    /**
     * @method
     * @name aster#watchMarkPrices
     * @description watches the mark price for all markets
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#mark-price-stream
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.use1sFreq] *default is true* if set to true, the mark price will be updated every second, otherwise every 3 seconds
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchMarkPrices (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const symbolsLength = symbols.length;
        let methodName = undefined;
        [ methodName, params ] = this.handleParamString (params, 'callerMethodName', 'watchMarkPrices');
        params = this.omit (params, 'callerMethodName');
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires a non-empty array of symbols');
        }
        const url = this.urls['api']['ws'];
        const subscriptionArgs = [];
        const messageHashes = [];
        symbols = this.marketSymbols (symbols, undefined, false, true, true);
        const request: Dict = {
            'method': 'SUBSCRIBE',
            'params': subscriptionArgs,
        };
        const use1sFreq = this.safeBool (params, 'use1sFreq', true);
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const suffix = (use1sFreq) ? '@1s' : '';
            subscriptionArgs.push (this.safeStringLower (market, 'id') + '@markPrice' + suffix);
            messageHashes.push ('ticker:' + market['symbol']);
        }
        const newTicker = await this.watchMultiple (url, messageHashes, this.extend (request, params), messageHashes);
        if (this.newUpdates) {
            const result = {};
            result[newTicker['symbol']] = newTicker;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    /**
     * @method
     * @name aster#unWatchMarkPrices
     * @description watches the mark price for all markets
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#mark-price-stream
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.use1sFreq] *default is true* if set to true, the mark price will be updated every second, otherwise every 3 seconds
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchMarkPrices (symbols: Strings = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const symbolsLength = symbols.length;
        let methodName = undefined;
        [ methodName, params ] = this.handleParamString (params, 'callerMethodName', 'unWatchMarkPrices');
        params = this.omit (params, 'callerMethodName');
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires a non-empty array of symbols');
        }
        const url = this.urls['api']['ws'];
        const subscriptionArgs = [];
        const messageHashes = [];
        symbols = this.marketSymbols (symbols, undefined, false, true, true);
        const request: Dict = {
            'method': 'UNSUBSCRIBE',
            'params': subscriptionArgs,
        };
        const use1sFreq = this.safeBool (params, 'use1sFreq', true);
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const suffix = (use1sFreq) ? '@1s' : '';
            subscriptionArgs.push (this.safeStringLower (market, 'id') + '@markPrice' + suffix);
            messageHashes.push ('unsubscribe:ticker:' + market['symbol']);
        }
        return await this.watchMultiple (url, messageHashes, this.extend (request, params), messageHashes);
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         "stream": "trumpusdt@ticker",
        //         "data": {
        //             "e": "24hrTicker",
        //             "E": 1754451187277,
        //             "s": "CAKEUSDT",
        //             "p": "-0.08800",
        //             "P": "-3.361",
        //             "w": "2.58095",
        //             "c": "2.53000",
        //             "Q": "5",
        //             "o": "2.61800",
        //             "h": "2.64700",
        //             "l": "2.52400",
        //             "v": "15775",
        //             "q": "40714.46000",
        //             "O": 1754364780000,
        //             "C": 1754451187274,
        //             "F": 6571389,
        //             "L": 6574507,
        //             "n": 3119
        //         }
        //     }
        //     {
        //         "stream": "btcusdt@markPrice",
        //         "data": {
        //             "e": "markPriceUpdate",
        //             "E": 1754660466000,
        //             "s": "BTCUSDT",
        //             "p": "116809.60000000",
        //             "P": "116595.54012838",
        //             "i": "116836.93534884",
        //             "r": "0.00010000",
        //             "T": 1754668800000
        //         }
        //     }
        //
        const ticker = this.safeDict (message, 'data');
        const parsed = this.parseWsTicker (ticker);
        const symbol = parsed['symbol'];
        const messageHash = 'ticker:' + symbol;
        this.tickers[symbol] = parsed;
        client.resolve (this.tickers[symbol], messageHash);
    }

    parseWsTicker (message) {
        const event = this.safeString (message, 'e');
        const part = event.split ('@');
        const channel = this.safeString (part, 1);
        const marketId = this.safeString (message, 's');
        const timestamp = this.safeInteger (message, 'E');
        const market = this.safeMarket (marketId);
        const last = this.safeString (message, 'c');
        if (channel === 'markPriceUpdate') {
            return this.safeTicker ({
                'symbol': market['symbol'],
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'info': message,
                'markPrice': this.safeString (message, 'p'),
                'indexPrice': this.safeString (message, 'i'),
            });
        }
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (message, 'h'),
            'low': this.safeString (message, 'l'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': this.safeString (message, 'w'),
            'open': this.safeString (message, 'o'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeString (message, 'p'),
            'percentage': this.safeString (message, 'P'),
            'average': undefined,
            'baseVolume': this.safeString (message, 'v'),
            'quoteVolume': this.safeString (message, 'q'),
            'info': message,
        }, market);
    }

    /**
     * @method
     * @name aster#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#individual-symbol-book-ticker-streams
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' watchBidsAsks() requires a non-empty array of symbols');
        }
        const url = this.urls['api']['ws'];
        const subscriptionArgs = [];
        const messageHashes = [];
        symbols = this.marketSymbols (symbols, undefined, false, true, true);
        const request: Dict = {
            'method': 'SUBSCRIBE',
            'params': subscriptionArgs,
        };
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            subscriptionArgs.push (this.safeStringLower (market, 'id') + '@bookTicker');
            messageHashes.push ('bidask:' + market['symbol']);
        }
        const newTicker = await this.watchMultiple (url, messageHashes, this.extend (request, params), messageHashes);
        if (this.newUpdates) {
            const result = {};
            result[newTicker['symbol']] = newTicker;
            return result;
        }
        return this.filterByArray (this.bidsasks, 'symbol', symbols);
    }

    handleBidAsk (client: Client, message) {
        //
        //     {
        //         "stream": "btcusdt@bookTicker",
        //         "data": {
        //             "e": "bookTicker",
        //             "u": 157240846459,
        //             "s": "BTCUSDT",
        //             "b": "122046.7",
        //             "B": "1.084",
        //             "a": "122046.8",
        //             "A": "0.001",
        //             "T": 1754896692922,
        //             "E": 1754896692926
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const ticker = this.parseWsBidAsk (data);
        const symbol = ticker['symbol'];
        this.bidsasks[symbol] = ticker;
        const messageHash = 'bidask:' + symbol;
        client.resolve (ticker, messageHash);
    }

    parseWsBidAsk (message, market = undefined) {
        const timestamp = this.safeInteger (message, 'T');
        const marketId = this.safeString (message, 's');
        market = this.safeMarket (marketId, market);
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'ask': this.safeString (message, 'a'),
            'askVolume': this.safeString (message, 'A'),
            'bid': this.safeString (message, 'b'),
            'bidVolume': this.safeString (message, 'B'),
            'info': message,
        }, market);
    }

    /**
     * @method
     * @name aster#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#aggregate-trade-streams
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        params['callerMethodName'] = 'watchTrades';
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    /**
     * @method
     * @name aster#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#aggregate-trade-streams
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const symbolsLength = symbols.length;
        let methodName = undefined;
        [ methodName, params ] = this.handleParamString (params, 'callerMethodName', 'watchTradesForSymbols');
        params = this.omit (params, 'callerMethodName');
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires a non-empty array of symbols');
        }
        const url = this.urls['api']['ws'];
        const subscriptionArgs = [];
        const messageHashes = [];
        symbols = this.marketSymbols (symbols, undefined, false, true, true);
        const request: Dict = {
            'method': 'SUBSCRIBE',
            'params': subscriptionArgs,
        };
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            subscriptionArgs.push (this.safeStringLower (market, 'id') + '@aggTrade');
            messageHashes.push ('trade:' + market['symbol']);
        }
        const trades = await this.watchMultiple (url, messageHashes, this.extend (request, params), messageHashes);
        if (this.newUpdates) {
            const first = this.safeValue (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrade (client: Client, message) {
        //
        //     {
        //         "stream": "btcusdt@aggTrade",
        //         "data": {
        //             "e": "aggTrade",
        //             "E": 1754551358681,
        //             "a": 20505890,
        //             "s": "BTCUSDT",
        //             "p": "114783.7",
        //             "q": "0.020",
        //             "f": 26024678,
        //             "l": 26024682,
        //             "T": 1754551358528,
        //             "m": false
        //         }
        //     }
        //
        const trade = this.safeDict (message, 'data');
        const parsed = this.parseWsTrade (trade);
        const symbol = parsed['symbol'];
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        stored.append (parsed);
        const messageHash = 'trade' + ':' + symbol;
        client.resolve (stored, messageHash);
    }

    parseWsTrade (trade: Dict, market: Market = undefined): Trade {
        const marketId = this.safeString (trade, 's');
        const timestamp = this.safeInteger (trade, 'T');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const amountString = this.safeString (trade, 'q');
        const priceString = this.safeString (trade, 'p');
        const isMaker = this.safeBool (trade, 'm');
        let takerOrMaker = undefined;
        if (isMaker !== undefined) {
            takerOrMaker = isMaker ? 'maker' : 'taker';
        }
        return this.safeTrade ({
            'id': this.safeString (trade, 'a'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': undefined,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name aster#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#partial-book-depth-streams
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        params['callerMethodName'] = 'watchOrderBook';
        return await this.watchOrderBookForSymbols ([ symbol ], limit, params);
    }

    /**
     * @method
     * @name aster#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#partial-book-depth-streams
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const symbolsLength = symbols.length;
        let methodName = undefined;
        [ methodName, params ] = this.handleParamString (params, 'callerMethodName', 'watchOrderBookForSymbols');
        params = this.omit (params, 'callerMethodName');
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires a non-empty array of symbols');
        }
        const url = this.urls['api']['ws'];
        const subscriptionArgs = [];
        const messageHashes = [];
        symbols = this.marketSymbols (symbols, undefined, false, true, true);
        const request: Dict = {
            'method': 'SUBSCRIBE',
            'params': subscriptionArgs,
        };
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            subscriptionArgs.push (this.safeStringLower (market, 'id') + '@depth20');
            messageHashes.push ('orderbook:' + market['symbol']);
        }
        const orderbook = await this.watchMultiple (url, messageHashes, this.extend (request, params), messageHashes);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         "stream": "btcusdt@depth20",
        //         "data": {
        //             "e": "depthUpdate",
        //             "E": 1754556878284,
        //             "T": 1754556878031,
        //             "s": "BTCUSDT",
        //             "U": 156391349814,
        //             "u": 156391349814,
        //             "pu": 156391348236,
        //             "b": [
        //                 [
        //                     "114988.3",
        //                     "0.147"
        //                 ]
        //             ],
        //             "a": [
        //                 [
        //                     "114988.4",
        //                     "1.060"
        //                 ]
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data');
        const marketId = this.safeString (data, 's');
        const timestamp = this.safeInteger (data, 'T');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ();
        }
        const orderbook = this.orderbooks[symbol];
        const snapshot = this.parseOrderBook (data, symbol, timestamp, 'b', 'a');
        orderbook.reset (snapshot);
        const messageHash = 'orderbook' + ':' + symbol;
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    /**
     * @method
     * @name aster#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#klinecandlestick-streams
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        params['callerMethodName'] = 'watchOHLCV';
        await this.loadMarkets ();
        symbol = this.safeSymbol (symbol);
        const result = await this.watchOHLCVForSymbols ([ [ symbol, timeframe ] ], since, limit, params);
        return result[symbol][timeframe];
    }

    /**
     * @method
     * @name aster#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#klinecandlestick-streams
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCVForSymbols (symbolsAndTimeframes: string[][], since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const symbolsLength = symbolsAndTimeframes.length;
        let methodName = undefined;
        [ methodName, params ] = this.handleParamString (params, 'callerMethodName', 'watchOHLCVForSymbols');
        params = this.omit (params, 'callerMethodName');
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires a non-empty array of symbols');
        }
        const url = this.urls['api']['ws'];
        const subscriptionArgs = [];
        const messageHashes = [];
        const request: Dict = {
            'method': 'SUBSCRIBE',
            'params': subscriptionArgs,
        };
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const data = symbolsAndTimeframes[i];
            let symbolString = this.safeString (data, 0);
            const market = this.market (symbolString);
            symbolString = market['symbol'];
            const unfiedTimeframe = this.safeString (data, 1);
            const timeframeId = this.safeString (this.timeframes, unfiedTimeframe, unfiedTimeframe);
            subscriptionArgs.push (this.safeStringLower (market, 'id') + '@kline_' + timeframeId);
            messageHashes.push ('ohlcv:' + market['symbol'] + ':' + unfiedTimeframe);
        }
        const [ symbol, timeframe, stored ] = await this.watchMultiple (url, messageHashes, this.extend (request, params), messageHashes);
        if (this.newUpdates) {
            limit = stored.getLimit (symbol, limit);
        }
        const filtered = this.filterBySinceLimit (stored, since, limit, 0, true);
        return this.createOHLCVObject (symbol, timeframe, filtered);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         "stream": "btcusdt@kline_1m",
        //         "data": {
        //             "e": "kline",
        //             "E": 1754655777119,
        //             "s": "BTCUSDT",
        //             "k": {
        //                 "t": 1754655720000,
        //                 "T": 1754655779999,
        //                 "s": "BTCUSDT",
        //                 "i": "1m",
        //                 "f": 26032629,
        //                 "L": 26032629,
        //                 "o": "116546.9",
        //                 "c": "116546.9",
        //                 "h": "116546.9",
        //                 "l": "116546.9",
        //                 "v": "0.011",
        //                 "n": 1,
        //                 "x": false,
        //                 "q": "1282.0159",
        //                 "V": "0.000",
        //                 "Q": "0.0000",
        //                 "B": "0"
        //             }
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data');
        const marketId = this.safeString (data, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const kline = this.safeDict (data, 'k');
        const timeframeId = this.safeString (kline, 'i');
        const timeframe = this.findTimeframe (timeframeId);
        const ohlcvsByTimeframe = this.safeValue (this.ohlcvs, symbol);
        if (ohlcvsByTimeframe === undefined) {
            this.ohlcvs[symbol] = {};
        }
        if (this.safeValue (ohlcvsByTimeframe, timeframe) === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new ArrayCacheByTimestamp (limit);
        }
        const stored = this.ohlcvs[symbol][timeframe];
        const parsed = this.parseWsOHLCV (kline);
        stored.append (parsed);
        const messageHash = 'ohlcv:' + symbol + ':' + timeframe;
        const resolveData = [ symbol, timeframe, stored ];
        client.resolve (resolveData, messageHash);
    }

    parseWsOHLCV (ohlcv, market = undefined): OHLCV {
        return [
            this.safeInteger (ohlcv, 't'),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber (ohlcv, 'v'),
        ];
    }

    handleMessage (client: Client, message) {
        const stream = this.safeString (message, 'stream');
        if (stream !== undefined) {
            const part = stream.split ('@');
            let topic = this.safeString (part, 1, '');
            const part2 = topic.split ('_');
            topic = this.safeString (part2, 0, '');
            const methods: Dict = {
                'ticker': this.handleTicker,
                'aggTrade': this.handleTrade,
                'depth5': this.handleOrderBook,
                'depth10': this.handleOrderBook,
                'depth20': this.handleOrderBook,
                'kline': this.handleOHLCV,
                'markPrice': this.handleTicker,
                'bookTicker': this.handleBidAsk,
            };
            const method = this.safeValue (methods, topic);
            if (method !== undefined) {
                method.call (this, client, message);
            }
        }
    }
}
