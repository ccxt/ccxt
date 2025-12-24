//  ---------------------------------------------------------------------------

import bydfiRest from '../bydfi.js';
import { ArgumentsRequired, ExchangeError } from '../base/errors.js';
import type { Dict, Int, OHLCV, OrderBook, Strings, Ticker, Tickers } from '../base/types.js';
import { ArrayCacheByTimestamp } from '../base/ws/Cache.js';
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
                'watchOrderBook': false,
                'watchOrderBookForSymbols': false,
                'watchOrders': false,
                'watchPositions': false,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': false,
                'watchTradesForSymbols': false,
                'unwatchBidsAsks': false,
                'unwatchOHLCV': true,
                'unwatchOHLCVForSymbols': true,
                'unwatchOrderBook': false,
                'unwatchOrderBookForSymbols': false,
                'unwatchTicker': true,
                'unwatchTickers': true,
                'unWatchTrades': false,
                'unWatchTradesForSymbols': false,
                'unWatchOrders': false,
                'unWatchPositions': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://stream.bydfi.com/v1/public/swap',
                        'private': 'wss://stream.bydfi.com/v1/public/swap',
                    },
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
        const url = this.urls['api']['ws']['public'];
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

    async authenticate (params = {}) {
        this.checkRequiredCredentials ();
        const messageHash = 'authenticated';
        const url = this.urls['api']['ws']['private'];
        const client = this.client (url);
        const future = client.reusableFuture (messageHash);
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const timestamp = this.milliseconds ().toString ();
            const payload = this.apiKey + timestamp;
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256, 'hex');
            const request: Dict = {
                'id': this.requestId (),
                'method': 'LOGIN',
                'params': {
                    'apiKey': this.apiKey,
                    'timestamp': timestamp,
                    'sign': signature,
                },
            };
            this.watch (url, messageHash, this.deepExtend (request, params), messageHash, future);
        }
        return await future;
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
            return this.handleErrorMessage (client, message);
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
            }
        }
    }
}
