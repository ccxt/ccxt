//  ---------------------------------------------------------------------------

import bydfiRest from '../bydfi.js';
import { Precise } from '../base/Precise.js';
import { ArgumentsRequired, ExchangeError } from '../base/errors.js';
import type { Dict, Int, Market, OHLCV, Order, OrderBook, Position, Str, Strings, Ticker, Tickers } from '../base/types.js';
import { ArrayCacheBySymbolById, ArrayCacheBySymbolBySide, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import Client from '../base/ws/Client.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';

//  ---------------------------------------------------------------------------

export default class bydfi extends bydfiRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchBidsAsks': false,
                'watchMyTrades': false,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOrders': true,
                'watchOrdersForSymbols': true,
                'watchPositions': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': false,
                'watchTradesForSymbols': false,
                'unwatchBidsAsks': false,
                'unwatchOHLCV': true,
                'unwatchOHLCVForSymbols': true,
                'unwatchOrderBook': true,
                'unwatchOrderBookForSymbols': true,
                'unwatchTicker': true,
                'unwatchTickers': true,
                'unWatchTrades': false,
                'unWatchTradesForSymbols': false,
                'unWatchOrders': false,
                'unWatchOrdersForSymbols': false,
                'unWatchPositions': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://stream.bydfi.com/v1/public/swap',
                },
            },
            'options': {
                'watchOrderBookForSymbols': {
                    'depth': '100', // 10, 50, 100
                    'frequency': '1000ms', // 100ms, 1000ms
                },
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
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 12000, // todo check interval
            },
        });
    }

    ping (client: Client) {
        return {
            'id': this.requestId (),
            'method': 'ping',
        };
    }

    requestId () {
        this.lockId ();
        const reqid = this.sum (this.safeInteger (this.options, 'reqid', 0), 1);
        this.options['reqid'] = reqid;
        this.unlockId ();
        return reqid;
    }

    async watchPublic (messageHashes, channels, params = {}, subscription = {}) {
        const url = this.urls['api']['ws'];
        const id = this.requestId ();
        const subscriptionParams: Dict = {
            'id': id,
        };
        const unsubscribe = this.safeBool (params, 'unsubscribe', false);
        let method = 'SUBSCRIBE';
        if (unsubscribe) {
            method = 'UNSUBSCRIBE';
            params = this.omit (params, 'unsubscribe');
            subscriptionParams['unsubscribe'] = true;
            subscriptionParams['messageHashes'] = messageHashes;
        }
        const message: Dict = {
            'id': id,
            'method': method,
            'params': channels,
        };
        return await this.watchMultiple (url, messageHashes, this.deepExtend (message, params), messageHashes, this.extend (subscriptionParams, subscription));
    }

    async watchPrivate (messageHashes, params = {}) {
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws'];
        const subHash = 'private';
        const client = this.client (url);
        const privateSubscription = this.safeValue (client.subscriptions, subHash);
        const subscription: Dict = {};
        if (privateSubscription === undefined) {
            const id = this.requestId ();
            const timestamp = this.milliseconds ().toString ();
            const payload = this.apiKey + timestamp;
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256, 'hex');
            const request: Dict = {
                'id': id,
                'method': 'LOGIN',
                'params': {
                    'apiKey': this.apiKey,
                    'timestamp': timestamp,
                    'sign': signature,
                },
            };
            params = this.deepExtend (request, params);
            subscription['id'] = id;
        }
        return await this.watchMultiple (url, messageHashes, params, [ 'private' ], subscription);
    }

    /**
     * @method
     * @name bydfi#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://developers.bydfi.com/en/swap/websocket-market#ticker-by-symbol
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const messageHash = 'ticker::' + symbol;
        const channel = marketId + '@ticker';
        return await this.watchPublic ([ messageHash ], [ channel ], params);
    }

    /**
     * @method
     * @name bydfi#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://developers.bydfi.com/en/swap/websocket-market#ticker-by-symbol
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async unWatchTicker (symbol: string, params = {}): Promise<any> {
        return await this.unWatchTickers ([ symbol ], params);
    }

    /**
     * @method
     * @name bydfi#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://developers.bydfi.com/en/swap/websocket-market#ticker-by-symbol
     * @see https://developers.bydfi.com/en/swap/websocket-market#market-wide-ticker
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true);
        const messageHashes = [];
        const messageHash = 'ticker::';
        const channels = [];
        const channel = '@ticker';
        if (symbols === undefined) {
            messageHashes.push (messageHash + 'all');
            channels.push ('!ticker@arr');
        } else {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const marketId = this.marketId (symbol);
                messageHashes.push (messageHash + symbol);
                channels.push (marketId + channel);
            }
        }
        await this.watchPublic (messageHashes, channels, params);
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    /**
     * @method
     * @name bydfi#unWatchTickers
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://developers.bydfi.com/en/swap/websocket-market#ticker-by-symbol
     * @see https://developers.bydfi.com/en/swap/websocket-market#market-wide-ticker
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async unWatchTickers (symbols: Strings = undefined, params = {}): Promise<any> {
        symbols = this.marketSymbols (symbols, undefined, true);
        const messageHashes = [];
        const messageHash = 'unsubscribe::ticker::';
        const channels = [];
        const channel = '@ticker';
        const subscription: Dict = {
            'topic': 'ticker',
        };
        if (symbols === undefined) {
            // all tickers and tickers for specific symbols are different channels
            // we need to unsubscribe from all ticker channels
            const subHashes = this.getMessageHashesForTickersUnsubscription ();
            subscription['subHashIsPrefix'] = true;
            for (let i = 0; i < subHashes.length; i++) {
                const subHash = this.safeString (subHashes, i);
                if (subHash !== undefined) {
                    const parts = subHash.split ('::');
                    const symbol = this.safeString (parts, 1);
                    if (symbol === 'all') {
                        continue;
                    }
                    const marketId = this.marketId (symbol);
                    channels.push (marketId + channel);
                }
            }
            messageHashes.push (messageHash);
            channels.push ('!ticker@arr');
        } else {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const marketId = this.marketId (symbol);
                messageHashes.push (messageHash + symbol);
                channels.push (marketId + channel);
            }
            subscription['symbols'] = symbols;
        }
        params = this.extend (params, { 'unsubscribe': true });
        return await this.watchPublic (messageHashes, channels, params, subscription);
    }

    getMessageHashesForTickersUnsubscription () {
        const url = this.urls['api']['ws']['public'];
        const client = this.client (url);
        const subscriptions = client.subscriptions;
        const messageHashes = [];
        const keys = Object.keys (subscriptions);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (key.indexOf ('ticker::') === 0) {
                messageHashes.push (key);
            }
        }
        return messageHashes;
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         "s": "KAS-USDT",
        //         "c": 0.04543,
        //         "e": "24hrTicker",
        //         "E": 1766528295905,
        //         "v": 98278925,
        //         "h": 0.04685,
        //         "l": 0.04404,
        //         "o": 0.04657
        //     }
        //
        const ticker = this.parseTicker (message);
        const symbol = ticker['symbol'];
        const messageHash = 'ticker::' + symbol;
        this.tickers[symbol] = ticker;
        client.resolve (this.tickers[symbol], messageHash);
        client.resolve (this.tickers, 'ticker::all');
    }

    /**
     * @method
     * @name bydfi#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://developers.bydfi.com/en/swap/websocket-market#candlestick-data
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
     * @name bydfi#unWatchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developers.bydfi.com/en/swap/websocket-market#candlestick-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async unWatchOHLCV (symbol: string, timeframe: string = '1m', params = {}): Promise<any> {
        return await this.unWatchOHLCVForSymbols ([ [ symbol, timeframe ] ], params);
    }

    /**
     * @method
     * @name bydfi#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://developers.bydfi.com/en/swap/websocket-market#candlestick-data
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
        const channels = [];
        const messageHashes = [];
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const symbolAndTimeframe = symbolsAndTimeframes[i];
            const marketId = this.safeString (symbolAndTimeframe, 0);
            const market = this.market (marketId);
            const tf = this.safeString (symbolAndTimeframe, 1);
            const timeframes = this.safeDict (this.options, 'timeframes', {});
            const interval = this.safeString (timeframes, tf, tf);
            channels.push (market['id'] + '@kline_' + interval);
            messageHashes.push ('ohlcv::' + market['symbol'] + '::' + interval);
        }
        const [ symbol, timeframe, candles ] = await this.watchPublic (messageHashes, channels, params);
        if (this.newUpdates) {
            limit = candles.getLimit (symbol, limit);
        }
        const filtered = this.filterBySinceLimit (candles, since, limit, 0, true);
        return this.createOHLCVObject (symbol, timeframe, filtered);
    }

    /**
     * @method
     * @name bydfi#unWatchOHLCVForSymbols
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developers.bydfi.com/en/swap/websocket-market#candlestick-data
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
        const channels = [];
        const messageHashes = [];
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const symbolAndTimeframe = symbolsAndTimeframes[i];
            const marketId = this.safeString (symbolAndTimeframe, 0);
            const market = this.market (marketId);
            const tf = this.safeString (symbolAndTimeframe, 1);
            const interval = this.safeString (this.timeframes, tf, tf);
            channels.push (market['id'] + '@kline_' + interval);
            messageHashes.push ('unsubscribe::ohlcv::' + market['symbol'] + '::' + interval);
        }
        params = this.extend (params, { 'unsubscribe': true });
        const subscription: Dict = {
            'topic': 'ohlcv',
            'symbolsAndTimeframes': symbolsAndTimeframes,
        };
        return await this.watchPublic (messageHashes, channels, params, subscription);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         "s": "ETH-USDC",
        //         "c": 2956.13,
        //         "t": 1766506860000,
        //         "T": 1766506920000,
        //         "e": "kline",
        //         "v": 3955,
        //         "h": 2956.41,
        //         "i": "1m",
        //         "l": 2956.05,
        //         "o": 2956.05
        //     }
        //
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const interval = this.safeString (message, 'i');
        const timeframes = this.safeDict (this.options, 'timeframes', {});
        const timeframe = this.findTimeframe (interval, timeframes);
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            const stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const ohlcv = this.ohlcvs[symbol][timeframe];
        const parsed = this.parseWsOHLCV (message);
        ohlcv.append (parsed);
        const messageHash = 'ohlcv::' + symbol + '::' + timeframe;
        client.resolve ([ symbol, timeframe, ohlcv ], messageHash);
    }

    /**
     * @method
     * @name bydfi#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developers.bydfi.com/en/swap/websocket-market#limited-depth-information
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (default and maxi is 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        return await this.watchOrderBookForSymbols ([ symbol ], limit, params);
    }

    /**
     * @method
     * @name bydfi#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developers.bydfi.com/en/swap/websocket-market#limited-depth-information
     * @param {string} symbol unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBook (symbol: string, params = {}): Promise<any> {
        return await this.unWatchOrderBookForSymbols ([ symbol ], params);
    }

    /**
     * @method
     * @name bydfi#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developers.bydfi.com/en/swap/websocket-market#limited-depth-information
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return (default and max is 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        let depth = '100';
        [ depth, params ] = this.handleOptionAndParams (params, 'watchOrderBookForSymbols', 'depth', depth);
        let frequency = '100ms';
        [ frequency, params ] = this.handleOptionAndParams (params, 'watchOrderBookForSymbols', 'frequency', frequency);
        let channelSuffix = '';
        if (frequency === '100ms') {
            channelSuffix = '@100ms';
        }
        const channels = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            channels.push (market['id'] + '@depth' + depth + channelSuffix);
            messageHashes.push ('orderbook::' + symbol);
        }
        const orderbook = await this.watchPublic (messageHashes, channels, params);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name bydfi#unWatchOrderBookForSymbols
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developers.bydfi.com/en/swap/websocket-market#limited-depth-information
     * @param {string[]} symbols unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] either '/market/level2' or '/spotMarket/level2Depth5' or '/spotMarket/level2Depth50' default is '/market/level2'
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBookForSymbols (symbols: string[], params = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        let depth = '100';
        [ depth, params ] = this.handleOptionAndParams (params, 'watchOrderBookForSymbols', 'depth', depth);
        let frequency = '100ms';
        [ frequency, params ] = this.handleOptionAndParams (params, 'watchOrderBookForSymbols', 'frequency', frequency);
        let channelSuffix = '';
        if (frequency === '100ms') {
            channelSuffix = '@100ms';
        }
        const channels = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            channels.push (market['id'] + '@depth' + depth + channelSuffix);
            messageHashes.push ('unsubscribe::orderbook::' + symbol);
        }
        const subscription: Dict = {
            'topic': 'orderbook',
            'symbols': symbols,
        };
        params = this.extend (params, { 'unsubscribe': true });
        return await this.watchPublic (messageHashes, channels, params, subscription);
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         "a": [ [ 150000, 15 ], ... ],
        //         "b": [ [ 90450.7, 3615 ], ... ],
        //         "s": "BTC-USDT",
        //         "e": "depthUpdate",
        //         "E": 1766577624512
        //     }
        //
        const marketId = this.safeString (message, 's');
        const symbol = this.safeSymbol (marketId);
        const timestamp = this.safeInteger (message, 'E');
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ();
        }
        const orderbook = this.orderbooks[symbol];
        const parsed = this.parseOrderBook (message, symbol, timestamp, 'b', 'a');
        orderbook.reset (parsed);
        const messageHash = 'orderbook::' + symbol;
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    /**
     * @method
     * @name bydfi#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://developers.bydfi.com/en/swap/websocket-account#order-trade-update-push
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        let symbols = undefined;
        if (symbol !== undefined) {
            symbols = [ symbol ];
        }
        return await this.watchOrdersForSymbols (symbols, since, limit, params);
    }

    /**
     * @method
     * @name bydfi#watchOrdersForSymbols
     * @description watches information on multiple orders made by the user
     * @see https://developers.bydfi.com/en/swap/websocket-account#order-trade-update-push
     * @param {string[]} symbols unified symbol of the market to fetch orders for
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async watchOrdersForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true);
        const messageHashes = [];
        if (symbols === undefined) {
            messageHashes.push ('orders');
        } else {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                messageHashes.push ('orders::' + symbol);
            }
        }
        const orders = await this.watchPrivate (messageHashes, params);
        if (this.newUpdates) {
            const first = this.safeValue (orders, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = orders.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (orders, since, limit, 'timestamp', true);
    }

    handleOrder (client: Client, message) {
        //
        //     {
        //         "T": 1766588450558,
        //         "E": 1766588450685,
        //         "e": "ORDER_TRADE_UPDATE",
        //         "o": {
        //             "S": "BUY",
        //             "ap": "0",
        //             "cpt": false,
        //             "ct": "future",
        //             "ev": "0",
        //             "fee": "0",
        //             "lv": 2,
        //             "mt": "isolated",
        //             "o": "7409609004526010368",
        //             "p": "1000",
        //             "ps": "BOTH",
        //             "pt": "ONE_WAY",
        //             "ro": false,
        //             "s": "ETH-USDC",
        //             "st": "NEW",
        //             "t": "LIMIT",
        //             "tp": "0",
        //             "u": "0.001",
        //             "v": "2"
        //         }
        //     }
        //
        const rawOrder = this.safeDict (message, 'o', {});
        const marketId = this.safeString (rawOrder, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let match = false;
        const messageHash = 'orders';
        const symbolMessageHash = messageHash + '::' + symbol;
        const messageHashes = this.findMessageHashes (client, messageHash);
        for (let i = 0; i < messageHashes.length; i++) {
            const hash = messageHashes[i];
            if (hash === symbolMessageHash || hash === messageHash) {
                match = true;
                break;
            }
        }
        if (match) {
            if (this.orders === undefined) {
                const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
                this.orders = new ArrayCacheBySymbolById (limit);
            }
            const orders = this.orders;
            const order = this.parseWsOrder (rawOrder, market);
            const lastUpdateTimestamp = this.safeInteger (message, 'T');
            order['lastUpdateTimestamp'] = lastUpdateTimestamp;
            orders.append (order);
            client.resolve (orders, messageHash);
            client.resolve (orders, symbolMessageHash);
        }
    }

    parseWsOrder (order: Dict, market: Market = undefined): Order {
        //
        //     {
        //         "S": "BUY",
        //         "ap": "0",
        //         "cpt": false,
        //         "ct": "future",
        //         "ev": "0",
        //         "fee": "0",
        //         "lv": 2,
        //         "mt": "isolated",
        //         "o": "7409609004526010368",
        //         "p": "1000",
        //         "ps": "BOTH",
        //         "pt": "ONE_WAY",
        //         "ro": false,
        //         "s": "ETH-USDC",
        //         "st": "NEW",
        //         "t": "LIMIT",
        //         "tp": "0",
        //         "u": "0.001",
        //         "v": "2"
        //     }
        //
        const marketId = this.safeString (order, 's');
        market = this.safeMarket (marketId, market);
        const rawStatus = this.safeString (order, 'st');
        const rawType = this.safeString (order, 't');
        let fee = undefined;
        const feeCost = this.safeString (order, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': Precise.stringAbs (feeCost),
                'currency': market['quote'],
            };
        }
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'o'),
            'clientOrderId': this.safeString (order, 'cid'),
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': undefined,
            'status': this.parseOrderStatus (rawStatus),
            'symbol': market['symbol'],
            'type': this.parseOrderType (rawType),
            'timeInForce': undefined,
            'postOnly': undefined,
            'reduceOnly': this.safeBool (order, 'ro'),
            'side': this.safeStringLower (order, 'S'),
            'price': this.safeString (order, 'p'),
            'triggerPrice': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
            'amount': this.safeString (order, 'v'),
            'filled': this.safeString (order, 'ev'),
            'remaining': this.safeString (order, 'qty'),
            'cost': undefined,
            'trades': undefined,
            'fee': fee,
            'average': this.omitZero (this.safeString (order, 'ap')),
        }, market);
    }

    /**
     * @method
     * @name bydfi#watchPositions
     * @description watch all open positions
     * @see https://developers.bydfi.com/en/swap/websocket-account#balance-and-position-update-push
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true);
        const messageHashes = [];
        const messageHash = 'positions';
        if (symbols === undefined) {
            messageHashes.push (messageHash);
        } else {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                messageHashes.push (messageHash + '::' + symbol);
            }
        }
        const positions = await this.watchPrivate (messageHashes, params);
        if (this.newUpdates) {
            return positions;
        }
        return this.filterBySymbolsSinceLimit (this.positions, symbols, since, limit, true);
    }

    handlePositions (client, message) {
        //
        //     {
        //         "a": {
        //             "B": [
        //                 {
        //                     "a": "USDC",
        //                     "ba": "0",
        //                     "im": "1.46282986",
        //                     "om": "0",
        //                     "tfm": "1.46282986",
        //                     "wb": "109.86879703"
        //                 }
        //             ],
        //             "m": "ORDER",
        //             "p": [
        //                 {
        //                     "S": "1",
        //                     "ap": "2925.81666667",
        //                     "c": "USDC",
        //                     "ct": "FUTURE",
        //                     "l": 2,
        //                     "lq": "1471.1840621072728637",
        //                     "lv": "0",
        //                     "ma": "0",
        //                     "mt": "ISOLATED",
        //                     "pm": "1.4628298566666665",
        //                     "pt": "ONEWAY",
        //                     "rp": "-0.00036721",
        //                     "s": "ETH-USDC",
        //                     "t": "0",
        //                     "uq": "0.001",
        //                     "v": "1"
        //                 }
        //             ]
        //         },
        //         "T": 1766592694451,
        //         "E": 1766592694554,
        //         "e": "ACCOUNT_UPDATE"
        //     }
        //
        const data = this.safeDict (message, 'a', {});
        const positionsData = this.safeList (data, 'p', []);
        const rawPosition = this.safeDict (positionsData, 0, {});
        const marketId = this.safeString (rawPosition, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'positions';
        const symbolMessageHash = messageHash + '::' + symbol;
        const messageHashes = this.findMessageHashes (client, messageHash);
        let match = false;
        for (let i = 0; i < messageHashes.length; i++) {
            const hash = messageHashes[i];
            if (hash === symbolMessageHash || hash === messageHash) {
                match = true;
                break;
            }
        }
        if (match) {
            if (this.positions === undefined) {
                this.positions = new ArrayCacheBySymbolBySide ();
            }
            const cache = this.positions;
            const parsedPosition = this.parseWsPosition (rawPosition, market);
            const timestamp = this.safeInteger (message, 'T');
            parsedPosition['timestamp'] = timestamp;
            parsedPosition['datetime'] = this.iso8601 (timestamp);
            cache.append (parsedPosition);
            const symbolSpecificMessageHash = messageHash + ':' + parsedPosition['symbol'];
            client.resolve ([ parsedPosition ], messageHash);
            client.resolve ([ parsedPosition ], symbolSpecificMessageHash);
        }
    }

    parseWsPosition (position, market = undefined) {
        //
        //     {
        //         "S": "1",
        //         "ap": "2925.81666667",
        //         "c": "USDC",
        //         "ct": "FUTURE",
        //         "l": 2,
        //         "lq": "1471.1840621072728637",
        //         "lv": "0",
        //         "ma": "0",
        //         "mt": "ISOLATED",
        //         "pm": "1.4628298566666665",
        //         "pt": "ONEWAY",
        //         "rp": "-0.00036721",
        //         "s": "ETH-USDC",
        //         "t": "0",
        //         "uq": "0.001",
        //         "v": "1"
        //     }
        //
        const marketId = this.safeString (position, 's');
        market = this.safeMarket (marketId, market);
        const rawPositionSide = this.safeString (position, 'S');
        const positionMode = this.safeString (position, 'pt');
        return this.safePosition ({
            'info': position,
            'id': this.safeString (position, 'id'),
            'symbol': market['symbol'],
            'entryPrice': this.parseNumber (this.safeString (position, 'ap')),
            'markPrice': undefined,
            'lastPrice': undefined,
            'notional': undefined,
            'collateral': undefined,
            'unrealizedPnl': undefined,
            'realizedPnl': this.parseNumber (this.safeString (position, 'rp')),
            'side': this.parseWsPositionSide (rawPositionSide),
            'contracts': this.parseNumber (this.safeString (position, 'v')),
            'contractSize': this.parseNumber (this.safeString (position, 'uq')),
            'timestamp': undefined,
            'datetime': undefined,
            'lastUpdateTimestamp': undefined,
            'hedged': (positionMode !== 'ONEWAY'),
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'initialMargin': this.parseNumber (this.safeString (position, 'pm')),
            'initialMarginPercentage': undefined,
            'leverage': this.safeInteger (position, 'l'),
            'liquidationPrice': this.parseNumber (this.safeString (position, 'lq')),
            'marginRatio': undefined,
            'marginMode': this.safeStringLower (position, 'mt'),
            'percentage': undefined,
        });
    }

    parseWsPositionSide (rawPositionSide: Str): Str {
        const sides = {
            '1': 'long',
            '2': 'short',
        };
        return this.safeString (sides, rawPositionSide, rawPositionSide);
    }

    handleSubscriptionStatus (client: Client, message) {
        //
        //     {
        //         "result": true,
        //         "id": 1
        //     }
        //
        const id = this.safeString (message, 'id');
        const subscriptionsById = this.indexBy (client.subscriptions, 'id');
        const subscription = this.safeDict (subscriptionsById, id, {});
        const isUnSubMessage = this.safeBool (subscription, 'unsubscribe', false);
        if (isUnSubMessage) {
            this.handleUnSubscription (client, subscription);
        }
        return message;
    }

    handleUnSubscription (client: Client, subscription: Dict) {
        const messageHashes = this.safeList (subscription, 'messageHashes', []);
        const subHashIsPrefix = this.safeBool (subscription, 'subHashIsPrefix', false);
        for (let i = 0; i < messageHashes.length; i++) {
            const unsubHash = messageHashes[i];
            const subHash = unsubHash.replace ('unsubscribe::', '');
            this.cleanUnsubscription (client, subHash, unsubHash, subHashIsPrefix);
        }
        this.cleanCache (subscription);
    }

    handlePong (client: Client, message) {
        //
        //     {
        //         "id": 1,
        //         "result": "pong"
        //     }
        //
        client.lastPong = this.milliseconds ();
        return message;
    }

    handleErrorMessage (client: Client, message) {
        //
        //     {
        //         "msg": "Service error",
        //         "code": "-1"
        //     }
        //
        const code = this.safeString (message, 'code');
        const msg = this.safeString (message, 'msg');
        const feedback = this.id + ' ' + this.json (message);
        this.throwExactlyMatchedException (this.exceptions['exact'], msg, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], msg, feedback);
        this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
        throw new ExchangeError (feedback);
    }

    handleMessage (client: Client, message) {
        const code = this.safeString (message, 'code');
        if (code !== undefined && (code !== '0')) {
            this.handleErrorMessage (client, message);
        }
        const result = this.safeString (message, 'result');
        if (result === 'pong') {
            this.handlePong (client, message);
        } else if (result !== undefined) {
            this.handleSubscriptionStatus (client, message);
        } else {
            const event = this.safeString (message, 'e');
            if (event === '24hrTicker') {
                this.handleTicker (client, message);
            } else if (event === 'kline') {
                this.handleOHLCV (client, message);
            } else if (event === 'depthUpdate') {
                this.handleOrderBook (client, message);
            } else if (event === 'ORDER_TRADE_UPDATE') {
                this.handleOrder (client, message);
            } else if (event === 'ACCOUNT_UPDATE') {
                const account = this.safeDict (message, 'a', {});
                // const balances = this.safeList (account, 'B', []);
                const positions = this.safeList (account, 'p', []);
                const positionsLength = positions.length;
                if (positionsLength > 0) {
                    this.handlePositions (client, message);
                }
            }
        }
    }
}
