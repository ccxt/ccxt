//  ---------------------------------------------------------------------------

import nadoRest from '../nado.js';
import { ArgumentsRequired, ExchangeError } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import { Precise } from '../base/Precise.js';
import { keccak_256 as keccak } from '@noble/hashes/sha3.js';
import type { Bool, Dict, Int, OHLCV, Order, OrderBook, Position, Str, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class nado extends nadoRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchBidsAsks': true,
                'watchFundingRate': false,
                'watchFundingRates': false,
                'watchLiquidations': false,
                'watchLiquidationsForSymbols': false,
                'watchMyTrades': true,
                'unWatchBidsAsks': true,
                'unWatchMyTrades': true,
                'unWatchOHLCV': true,
                'unWatchOHLCVForSymbols': true,
                'unWatchOrderBook': true,
                'unWatchOrderBookForSymbols': true,
                'unWatchOrders': true,
                'unWatchPositions': true,
                'unWatchTicker': true,
                'unWatchTickers': true,
                'unWatchTrades': true,
                'unWatchTradesForSymbols': true,
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
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 30000,
            },
            'options': {
                'tradesLimit': 1000,
            },
            'urls': {
                'api': {
                    'ws': {
                        'gateway': 'wss://gateway.prod.nado.xyz/v1/ws',
                        'subscriptions': 'wss://gateway.prod.nado.xyz/v1/subscribe',
                    },
                },
                'test': {
                    'ws': {
                        'gateway': 'wss://gateway.test.nado.xyz/v1/ws',
                        'subscriptions': 'wss://gateway.test.nado.xyz/v1/subscribe',
                    },
                },
            },
        });
    }

    /**
     * @method
     * @name nado#watchTrades
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description watches information on multiple trades made in a market
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'trade:' + market['symbol'];
        const trades = await this.watchPublic ('trade', market, messageHash, params);
        if (this.newUpdates) {
            limit = trades.getLimit (market['symbol'], limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    /**
     * @method
     * @name nado#unWatchTrades
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches information on multiple trades made in a market
     * @param {string} symbol unified symbol of the market to unwatch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    async unWatchTrades (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        return await this.unWatchTradesForSymbols ([ symbol ], params);
    }

    /**
     * @method
     * @name nado#watchTradesForSymbols
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description get the list of most recent trades for a list of symbols
     * @param {string[]} symbols unified symbols of the markets to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' watchTradesForSymbols() requires a non-empty array of symbols');
        }
        symbols = this.marketSymbols (symbols, undefined, false, true, true);
        const markets = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            markets.push (market);
            messageHashes.push ('trade:' + market['symbol']);
        }
        const trades = await this.watchPublicMultiple ('trade', markets, messageHashes, params);
        if (this.newUpdates) {
            const first = this.safeDict (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    /**
     * @method
     * @name nado#unWatchTradesForSymbols
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches information on multiple trades made in a list of markets
     * @param {string[]} symbols unified symbols of the markets to unwatch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    async unWatchTradesForSymbols (symbols: string[], params = {}): Promise<any> {
        await this.loadMarkets ();
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' unWatchTradesForSymbols() requires a non-empty array of symbols');
        }
        symbols = this.marketSymbols (symbols, undefined, false, true, true);
        const markets = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            markets.push (market);
            messageHashes.push ('trade:' + market['symbol']);
        }
        return await this.unWatchPublicMultiple ('trade', markets, messageHashes, params);
    }

    /**
     * @method
     * @name nado#watchOrderBook
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {OrderBook} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'orderbook:' + market['symbol'];
        if (!(market['symbol'] in this.orderbooks)) {
            const snapshot = await this.fetchOrderBook (symbol, limit);
            this.orderbooks[market['symbol']] = this.orderBook (snapshot, limit);
        }
        const orderbook = await this.watchPublic ('book_depth', market, messageHash, params);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name nado#unWatchOrderBook
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to unwatch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    async unWatchOrderBook (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        return await this.unWatchOrderBookForSymbols ([ symbol ], params);
    }

    /**
     * @method
     * @name nado#watchOrderBookForSymbols
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for a list of symbols
     * @param {string[]} symbols unified symbols of the markets to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {OrderBook} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' watchOrderBookForSymbols() requires a non-empty array of symbols');
        }
        symbols = this.marketSymbols (symbols, undefined, false, true, true);
        const markets = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const messageHash = 'orderbook:' + market['symbol'];
            markets.push (market);
            messageHashes.push (messageHash);
            if (!(market['symbol'] in this.orderbooks)) {
                const snapshot = await this.fetchOrderBook (symbol, limit);
                this.orderbooks[market['symbol']] = this.orderBook (snapshot, limit);
            }
        }
        const orderbook = await this.watchPublicMultiple ('book_depth', markets, messageHashes, params);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name nado#unWatchOrderBookForSymbols
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for a list of symbols
     * @param {string[]} symbols unified symbols of the markets to unwatch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    async unWatchOrderBookForSymbols (symbols: string[], params = {}): Promise<any> {
        await this.loadMarkets ();
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' unWatchOrderBookForSymbols() requires a non-empty array of symbols');
        }
        symbols = this.marketSymbols (symbols, undefined, false, true, true);
        const markets = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            markets.push (market);
            messageHashes.push ('orderbook:' + market['symbol']);
        }
        return await this.unWatchPublicMultiple ('book_depth', markets, messageHashes, params);
    }

    /**
     * @method
     * @name nado#watchOHLCV
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'ohlcv:' + timeframe + ':' + market['symbol'];
        const request = {
            'granularity': this.safeInteger (this.timeframes, timeframe, this.parseTimeframe (timeframe)),
        };
        const result = await this.watchPublic ('latest_candlestick', market, messageHash, this.extend (request, params));
        const stored = result[2];
        if (this.newUpdates) {
            limit = stored.getLimit (market['symbol'], limit);
        }
        return this.filterBySinceLimit (stored, since, limit, 0, true);
    }

    /**
     * @method
     * @name nado#watchOHLCVForSymbols
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of multiple markets
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to watch OHLCV data for, example [['BTC/USDT0:USDT0', '1m'], ['ETH/USDT0:USDT0', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of {@link https://docs.ccxt.com/#/?id=ohlcv-structure OHLCV} structures indexed by market symbols
     */
    async watchOHLCVForSymbols (symbolsAndTimeframes: string[][], since: Int = undefined, limit: Int = undefined, params = {}) {
        const symbolsLength = symbolsAndTimeframes.length;
        if (symbolsLength === 0 || !Array.isArray (symbolsAndTimeframes[0])) {
            throw new ArgumentsRequired (this.id + " watchOHLCVForSymbols() requires a an array of symbols and timeframes, like  [['BTC/USDT0:USDT0', '1m'], ['ETH/USDT0:USDT0', '5m']]");
        }
        await this.loadMarkets ();
        const markets = [];
        const messageHashes = [];
        const subscriptionParams = [];
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const symbolAndTimeframe = symbolsAndTimeframes[i];
            const marketSymbol = this.safeString (symbolAndTimeframe, 0);
            const timeframe = this.safeString (symbolAndTimeframe, 1, '1m');
            const market = this.market (marketSymbol);
            markets.push (market);
            messageHashes.push ('ohlcv:' + timeframe + ':' + market['symbol']);
            subscriptionParams.push (this.extend ({
                'granularity': this.safeInteger (this.timeframes, timeframe, this.parseTimeframe (timeframe)),
            }, params));
        }
        const [ resultSymbol, resultTimeframe, stored ] = await this.watchPublicMultiple ('latest_candlestick', markets, messageHashes, params, subscriptionParams);
        if (this.newUpdates) {
            limit = stored.getLimit (resultSymbol, limit);
        }
        const filtered = this.filterBySinceLimit (stored, since, limit, 0, true);
        return this.createOHLCVObject (resultSymbol, resultTimeframe, filtered);
    }

    /**
     * @method
     * @name nado#unWatchOHLCV
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to unwatch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    async unWatchOHLCV (symbol: string, timeframe: string = '1m', params = {}): Promise<any> {
        await this.loadMarkets ();
        return await this.unWatchOHLCVForSymbols ([ [ symbol, timeframe ] ], params);
    }

    /**
     * @method
     * @name nado#unWatchOHLCVForSymbols
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of multiple markets
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to unwatch OHLCV data for, example [['BTC/USDT0:USDT0', '1m'], ['ETH/USDT0:USDT0', '5m']]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    async unWatchOHLCVForSymbols (symbolsAndTimeframes: string[][], params = {}): Promise<any> {
        const symbolsLength = symbolsAndTimeframes.length;
        if (symbolsLength === 0 || !Array.isArray (symbolsAndTimeframes[0])) {
            throw new ArgumentsRequired (this.id + " unWatchOHLCVForSymbols() requires a an array of symbols and timeframes, like  [['BTC/USDT0:USDT0', '1m'], ['ETH/USDT0:USDT0', '5m']]");
        }
        await this.loadMarkets ();
        const markets = [];
        const messageHashes = [];
        const subscriptionParams = [];
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const symbolAndTimeframe = symbolsAndTimeframes[i];
            const marketSymbol = this.safeString (symbolAndTimeframe, 0);
            const timeframe = this.safeString (symbolAndTimeframe, 1, '1m');
            const market = this.market (marketSymbol);
            markets.push (market);
            messageHashes.push ('ohlcv:' + timeframe + ':' + market['symbol']);
            subscriptionParams.push (this.extend ({
                'granularity': this.safeInteger (this.timeframes, timeframe, this.parseTimeframe (timeframe)),
            }, params));
        }
        return await this.unWatchPublicMultiple ('latest_candlestick', markets, messageHashes, params, subscriptionParams);
    }

    /**
     * @method
     * @name nado#watchTicker
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description watches a price ticker with the best bid and ask for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const tickers = await this.watchTickers ([ symbol ], params);
        return tickers[symbol];
    }

    /**
     * @method
     * @name nado#unWatchTicker
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches a price ticker with the best bid and ask for a specific market
     * @param {string} symbol unified symbol of the market to unwatch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    async unWatchTicker (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        return await this.unWatchTickers ([ symbol ], params);
    }

    /**
     * @method
     * @name nado#watchTickers
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description watches price tickers with the best bid and ask for all markets of a specific list
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true, true, true);
        let market = undefined;
        let messageHash = 'ticker';
        let streamType = 'all_bbo';
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength === 1) {
                market = this.market (symbols[0]);
                messageHash = 'ticker:' + market['symbol'];
                streamType = 'best_bid_offer';
            }
        }
        const ticker = await this.watchPublic (streamType, market, messageHash, params);
        if (this.newUpdates) {
            if (messageHash === 'ticker') {
                return this.filterByArray (ticker, 'symbol', symbols);
            }
            const tickers: Dict = {};
            tickers[ticker['symbol']] = ticker;
            return tickers;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    /**
     * @method
     * @name nado#unWatchTickers
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches price tickers with the best bid and ask for all markets of a specific list
     * @param {string[]} [symbols] unified symbols of the markets to unwatch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    async unWatchTickers (symbols: Strings = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true, true, true);
        let market = undefined;
        let messageHash = 'ticker';
        let streamType = 'all_bbo';
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength === 1) {
                market = this.market (symbols[0]);
                messageHash = 'ticker:' + market['symbol'];
                streamType = 'best_bid_offer';
            }
        }
        return await this.unWatchPublic (streamType, market, messageHash, params);
    }

    /**
     * @method
     * @name nado#watchBidsAsks
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbols of the markets to fetch the bids and asks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true, true, true);
        let market = undefined;
        let messageHash = 'bidask';
        let streamType = 'all_bbo';
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength === 1) {
                market = this.market (symbols[0]);
                messageHash = 'bidask:' + market['symbol'];
                streamType = 'best_bid_offer';
            }
        }
        const ticker = await this.watchPublic (streamType, market, messageHash, params);
        if (this.newUpdates) {
            if (messageHash === 'bidask') {
                return this.filterByArray (ticker, 'symbol', symbols);
            }
            const tickers: Dict = {};
            tickers[ticker['symbol']] = ticker;
            return tickers;
        }
        return this.filterByArray (this.bidsasks, 'symbol', symbols);
    }

    /**
     * @method
     * @name nado#unWatchBidsAsks
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches best bid & ask for symbols
     * @param {string[]} symbols unified symbols of the markets to unwatch the bids and asks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    async unWatchBidsAsks (symbols: Strings = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true, true, true);
        let market = undefined;
        let messageHash = 'bidask';
        let streamType = 'all_bbo';
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength === 1) {
                market = this.market (symbols[0]);
                messageHash = 'bidask:' + market['symbol'];
                streamType = 'best_bid_offer';
            }
        }
        return await this.unWatchPublic (streamType, market, messageHash, params);
    }

    /**
     * @method
     * @name nado#watchOrders
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/authentication
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/events
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        await this.authenticate (this.extend ({}, params));
        let market = undefined;
        let messageHash = 'orders';
        let productId = null;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
            productId = this.parseToInt (market['id']);
        }
        let subaccount = undefined;
        [ subaccount, params ] = this.handleOptionAndParams (params, 'watchOrders', 'subaccount', 'default');
        const sender = this.createSubaccount (this.walletAddress, subaccount);
        const stream: Dict = {
            'type': 'order_update',
            'subaccount': sender,
            'product_id': productId,
        };
        const orders = await this.watchPrivate ('order_update', stream, messageHash, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    /**
     * @method
     * @name nado#unWatchOrders
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/authentication
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    async unWatchOrders (symbol: Str = undefined, params = {}): Promise<any> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        await this.authenticate (this.extend ({}, params));
        let market = undefined;
        let messageHash = 'orders';
        let productId = null;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
            productId = this.parseToInt (market['id']);
        }
        let subaccount = undefined;
        [ subaccount, params ] = this.handleOptionAndParams (params, 'unWatchOrders', 'subaccount', 'default');
        const sender = this.createSubaccount (this.walletAddress, subaccount);
        const stream: Dict = {
            'type': 'order_update',
            'subaccount': sender,
            'product_id': productId,
        };
        return await this.unWatchPrivate (stream, messageHash, params);
    }

    /**
     * @method
     * @name nado#watchMyTrades
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/authentication
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/events
     * @description watches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        await this.authenticate (this.extend ({}, params));
        let market = undefined;
        let messageHash = 'myTrades';
        let productId = null;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
            productId = this.parseToInt (market['id']);
        }
        let subaccount = undefined;
        [ subaccount, params ] = this.handleOptionAndParams (params, 'watchMyTrades', 'subaccount', 'default');
        const sender = this.createSubaccount (this.walletAddress, subaccount);
        const stream: Dict = {
            'type': 'fill',
            'subaccount': sender,
            'product_id': productId,
        };
        const trades = await this.watchPrivate ('fill', stream, messageHash, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    /**
     * @method
     * @name nado#unWatchMyTrades
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/authentication
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    async unWatchMyTrades (symbol: Str = undefined, params = {}): Promise<any> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        await this.authenticate (this.extend ({}, params));
        let market = undefined;
        let messageHash = 'myTrades';
        let productId = null;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
            productId = this.parseToInt (market['id']);
        }
        let subaccount = undefined;
        [ subaccount, params ] = this.handleOptionAndParams (params, 'unWatchMyTrades', 'subaccount', 'default');
        const sender = this.createSubaccount (this.walletAddress, subaccount);
        const stream: Dict = {
            'type': 'fill',
            'subaccount': sender,
            'product_id': productId,
        };
        return await this.unWatchPrivate (stream, messageHash, params);
    }

    /**
     * @method
     * @name nado#watchPositions
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/authentication
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/events
     * @description watches information on user positions
     * @param {string[]} [symbols] unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of position structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        await this.authenticate (this.extend ({}, params));
        symbols = this.marketSymbols (symbols, undefined, false, true, true);
        let messageHash = 'positions';
        let productId = null;
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength === 1) {
                const market = this.market (symbols[0]);
                messageHash += ':' + market['symbol'];
                productId = this.parseToInt (market['id']);
            }
        }
        let subaccount = undefined;
        [ subaccount, params ] = this.handleOptionAndParams (params, 'watchPositions', 'subaccount', 'default');
        const sender = this.createSubaccount (this.walletAddress, subaccount);
        const stream: Dict = {
            'type': 'position_change',
            'subaccount': sender,
            'product_id': productId,
        };
        const positions = await this.watchPrivate ('position_change', stream, messageHash, params);
        if (this.newUpdates) {
            return positions;
        }
        return this.filterBySymbolsSinceLimit (this.positions, symbols, since, limit, true);
    }

    /**
     * @method
     * @name nado#unWatchPositions
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/authentication
     * @see https://docs.nado.xyz/developer-resources/api/subscriptions/streams
     * @description unWatches information on user positions
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the exchange response
     */
    async unWatchPositions (symbols: Strings = undefined, params = {}): Promise<any> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        await this.authenticate (this.extend ({}, params));
        symbols = this.marketSymbols (symbols, undefined, false, true, true);
        let messageHash = 'positions';
        let productId = null;
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength === 1) {
                const market = this.market (symbols[0]);
                messageHash += ':' + market['symbol'];
                productId = this.parseToInt (market['id']);
            }
        }
        let subaccount = undefined;
        [ subaccount, params ] = this.handleOptionAndParams (params, 'unWatchPositions', 'subaccount', 'default');
        const sender = this.createSubaccount (this.walletAddress, subaccount);
        const stream: Dict = {
            'type': 'position_change',
            'subaccount': sender,
            'product_id': productId,
        };
        return await this.unWatchPrivate (stream, messageHash, params);
    }

    async watchPublic (streamType, market, messageHash: string, params = {}) {
        const url = this.urls['api']['ws']['subscriptions'];
        const stream: Dict = {
            'type': streamType,
        };
        if (market !== undefined) {
            stream['product_id'] = this.parseToInt (market['id']);
        }
        const request: Dict = {
            'method': 'subscribe',
            'stream': this.deepExtend (stream, params),
            'id': this.nonce (),
        };
        const subscription = {
            'streamType': streamType,
            'symbol': this.safeString (market, 'symbol'),
        };
        return await this.watch (url, messageHash, request, messageHash, subscription);
    }

    async watchPrivate (streamType, stream, messageHash: string, params = {}) {
        const url = this.urls['api']['ws']['subscriptions'];
        const client = this.client (url);
        const clientSubscription = this.safeValue (client.subscriptions, messageHash);
        if (clientSubscription !== undefined) {
            return await this.watch (url, messageHash);
        }
        const id = this.nonce ();
        const subscribeHash = 'subscribe:' + messageHash;
        const request: Dict = {
            'method': 'subscribe',
            'stream': this.deepExtend (stream, params),
            'id': id,
        };
        const subscription = {
            'streamType': streamType,
        };
        client.subscriptions['subscription:' + this.numberToString (id)] = {
            'subscribeHash': subscribeHash,
        };
        this.watchMultiple (url, [ subscribeHash ], request, [ messageHash ], subscription);
        return await this.watch (url, messageHash);
    }

    async unWatchPrivate (stream, messageHash: string, params = {}) {
        const url = this.urls['api']['ws']['subscriptions'];
        const id = this.nonce ();
        const unsubscribeHash = 'unsubscribe:' + messageHash;
        const request: Dict = {
            'method': 'unsubscribe',
            'stream': this.deepExtend (stream, params),
            'id': id,
        };
        const subscription = {
            'id': id,
            'messageHash': messageHash,
        };
        const client = this.client (url);
        client.subscriptions['unsubscription:' + this.numberToString (id)] = {
            'messageHash': messageHash,
            'unsubscribeHash': unsubscribeHash,
        };
        return await this.watch (url, unsubscribeHash, request, unsubscribeHash, subscription);
    }

    async authenticate (params = {}) {
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws']['subscriptions'];
        const client = this.client (url);
        const messageHash = 'authenticated';
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated !== undefined) {
            const future = this.safeValue (client.futures, messageHash);
            if (future !== undefined) {
                return await future;
            }
            return authenticated;
        }
        let recvWindow = undefined;
        [ recvWindow, params ] = this.handleOptionAndParams (params, 'authenticate', 'recvWindow', 5000);
        let subaccount = undefined;
        [ subaccount, params ] = this.handleOptionAndParams (params, 'authenticate', 'subaccount', 'default');
        const id = this.nonce ();
        const sender = this.createSubaccount (this.walletAddress, subaccount);
        const expiration = this.sum (this.milliseconds (), recvWindow);
        const tx = {
            'sender': sender,
            'expiration': this.numberToString (expiration),
        };
        const contracts = await this.queryContracts ();
        const chainId = this.safeString (contracts, 'chain_id');
        const endpointAddress = this.safeString (contracts, 'endpoint_addr');
        if (endpointAddress === undefined) {
            throw new ExchangeError (this.id + ' authenticate() requires endpoint_addr from contracts query');
        }
        const signature = this.signStreamAuthentication (tx, chainId, endpointAddress);
        const request: Dict = {
            'method': 'authenticate',
            'id': id,
            'tx': tx,
            'signature': signature,
        };
        client.subscriptions['authentication:' + this.numberToString (id)] = messageHash;
        return await this.watch (url, messageHash, this.extend (request, params), messageHash);
    }

    signStreamAuthentication (tx, chainId, endpointAddress: string) {
        const domain: Dict = {
            'name': 'Nado',
            'version': '0.0.1',
            'chainId': chainId,
            'verifyingContract': endpointAddress,
        };
        const messageTypes: Dict = {
            'StreamAuthentication': [
                { 'name': 'sender', 'type': 'bytes32' },
                { 'name': 'expiration', 'type': 'uint64' },
            ],
        };
        const encoded = this.ethEncodeStructuredData (domain, messageTypes, tx);
        const hash = '0x' + this.hash (encoded, keccak, 'hex');
        return this.signHash (hash, this.privateKey);
    }

    createPublicSubscriptionRequest (method: string, streamType, market = undefined, id: Int = undefined, params = {}) {
        const stream: Dict = {
            'type': streamType,
        };
        if (market !== undefined) {
            stream['product_id'] = this.parseToInt (market['id']);
        }
        return {
            'method': method,
            'stream': this.deepExtend (stream, params),
            'id': id,
        };
    }

    async watchPublicMultiple (streamType, markets, messageHashes: string[], params = {}, subscriptionParams = undefined) {
        const url = this.urls['api']['ws']['subscriptions'];
        const client = this.client (url);
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const clientSubscription = this.safeValue (client.subscriptions, messageHash);
            if (clientSubscription === undefined) {
                const market = markets[i];
                const id = this.nonce ();
                const subscribeHash = 'subscribe:' + messageHash;
                const requestParams = (subscriptionParams === undefined) ? params : subscriptionParams[i];
                const request = this.createPublicSubscriptionRequest ('subscribe', streamType, market, id, requestParams);
                const subscription = {
                    'streamType': streamType,
                    'symbol': this.safeString (market, 'symbol'),
                };
                client.subscriptions['subscription:' + this.numberToString (id)] = {
                    'subscribeHash': subscribeHash,
                };
                this.watchMultiple (url, [ subscribeHash ], request, [ messageHash ], subscription);
            }
        }
        const future = this.watchMultiple (url, messageHashes, undefined);
        return await future;
    }

    async unWatchPublic (streamType, market, messageHash: string, params = {}) {
        const url = this.urls['api']['ws']['subscriptions'];
        const id = this.nonce ();
        const request = this.createPublicSubscriptionRequest ('unsubscribe', streamType, market, id, params);
        const subscription = {
            'id': id,
            'messageHash': messageHash,
        };
        const unsubscribeHash = 'unsubscribe:' + messageHash;
        const client = this.client (url);
        client.subscriptions['unsubscription:' + this.numberToString (id)] = {
            'messageHash': messageHash,
            'unsubscribeHash': unsubscribeHash,
        };
        return await this.watch (url, unsubscribeHash, request, unsubscribeHash, subscription);
    }

    async unWatchPublicMultiple (streamType, markets, messageHashes: string[], params = {}, subscriptionParams = undefined) {
        const url = this.urls['api']['ws']['subscriptions'];
        const client = this.client (url);
        const results = [];
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const id = this.nonce ();
            const unsubscribeHash = 'unsubscribe:' + messageHash;
            const requestParams = (subscriptionParams === undefined) ? params : subscriptionParams[i];
            const request = this.createPublicSubscriptionRequest ('unsubscribe', streamType, markets[i], id, requestParams);
            const subscription = {
                'id': id,
                'messageHash': messageHash,
            };
            client.subscriptions['unsubscription:' + this.numberToString (id)] = {
                'messageHash': messageHash,
                'unsubscribeHash': unsubscribeHash,
            };
            results.push (await this.watchMultiple (url, [ unsubscribeHash ], request, [ unsubscribeHash ], subscription));
        }
        return results;
    }

    parseWsTimestamp (message: Dict, key: string): Int {
        const value = this.safeString (message, key);
        if (value === undefined) {
            return undefined;
        }
        const length = value.length;
        if (length > 13) {
            return this.parseToInt (value.slice (0, length - 6));
        }
        return this.safeInteger (message, key);
    }

    parseWsTrade (trade: Dict, market = undefined): Trade {
        //
        //     {
        //         "type": "trade",
        //         "timestamp": "1676151190656903000",
        //         "product_id": 1,
        //         "price": "25000000000000000000000",
        //         "taker_qty": "1000000000000000000",
        //         "maker_qty": "1000000000000000000",
        //         "is_taker_buyer": true
        //     }
        //
        const marketId = this.safeString (trade, 'product_id');
        market = this.safeMarket (marketId, market);
        const timestamp = this.parseWsTimestamp (trade, 'timestamp');
        const isTakerBuyer = this.safeBool (trade, 'is_taker_buyer');
        let side = undefined;
        if (isTakerBuyer !== undefined) {
            side = isTakerBuyer ? 'buy' : 'sell';
        }
        return this.safeTrade ({
            'info': trade,
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': 'taker',
            'price': this.parseX18 (this.safeString (trade, 'price')),
            'amount': this.parseX18 (this.safeString (trade, 'taker_qty')),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    parseWsMyTrade (trade: Dict, market = undefined): Trade {
        //
        //     {
        //         "type": "fill",
        //         "timestamp": "1695081920633151000",
        //         "product_id": 1,
        //         "subaccount": "0x...",
        //         "order_digest": "0x...",
        //         "appendix": "1",
        //         "filled_qty": "18000000000000000",
        //         "remaining_qty": "82000000000000000",
        //         "original_qty": "100000000000000000",
        //         "price": "25000000000000000000000",
        //         "is_taker": true,
        //         "is_bid": true,
        //         "fee": "4500000000000000",
        //         "submission_idx": 1,
        //         "id": 100
        //     }
        //
        const marketId = this.safeString (trade, 'product_id');
        market = this.safeMarket (marketId, market);
        const timestamp = this.parseWsTimestamp (trade, 'timestamp');
        const isBid = this.safeBool (trade, 'is_bid');
        let side = undefined;
        if (isBid !== undefined) {
            side = isBid ? 'buy' : 'sell';
        }
        const isTaker = this.safeBool (trade, 'is_taker');
        let takerOrMaker = undefined;
        if (isTaker !== undefined) {
            takerOrMaker = isTaker ? 'taker' : 'maker';
        }
        const feeCost = this.parseX18 (this.safeString (trade, 'fee'));
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': market['quote'],
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': this.safeString (trade, 'order_digest'),
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.parseX18 (this.safeString (trade, 'price')),
            'amount': this.parseX18 (this.safeString (trade, 'filled_qty')),
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    handleTrade (client: Client, message) {
        const marketId = this.safeString (message, 'product_id');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'trade:' + symbol;
        let trades = this.trades[symbol];
        if (trades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            trades = new ArrayCache (limit);
            this.trades[symbol] = trades;
        }
        const trade = this.parseWsTrade (message, market);
        trades.append (trade);
        client.resolve (trades, messageHash);
    }

    handleMyTrade (client: Client, message) {
        const trade = this.parseWsMyTrade (message);
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const trades = this.myTrades;
        trades.append (trade);
        const symbol = trade['symbol'];
        client.resolve (trades, 'myTrades');
        client.resolve (trades, 'myTrades:' + symbol);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         "type": "latest_candlestick",
        //         "timestamp": "1782179760",
        //         "product_id": 2,
        //         "granularity": 60,
        //         "open_x18": "64148000000000000000000",
        //         "high_x18": "64148000000000000000000",
        //         "low_x18": "64148000000000000000000",
        //         "close_x18": "64148000000000000000000",
        //         "volume": "24250000000000000"
        //     }
        //
        const marketId = this.safeString (message, 'product_id');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const granularity = this.safeInteger (message, 'granularity');
        const timeframe = this.findTimeframe (granularity);
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        let stored = this.ohlcvs[symbol][timeframe];
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const parsed = this.parseOHLCV (message, market);
        stored.append (parsed);
        const messageHash = 'ohlcv:' + timeframe + ':' + symbol;
        client.resolve ([ symbol, timeframe, stored ], messageHash);
    }

    parseWsOrder (order: Dict, market = undefined): Order {
        //
        //     {
        //         "type": "order_update",
        //         "timestamp": "1695081920633151000",
        //         "product_id": 1,
        //         "digest": "0xf7712b63ccf70358db8f201e9bf33977423e7a63f6a16f6dab180bdd580f7c6c",
        //         "amount": "82000000000000000",
        //         "reason": "filled",
        //         "filled_qty": "18000000000000000",
        //         "filled_price": "25000000000000000000000",
        //         "id": 100
        //     }
        //
        const marketId = this.safeString (order, 'product_id');
        market = this.safeMarket (marketId, market);
        const timestamp = this.parseWsTimestamp (order, 'timestamp');
        const id = this.safeString (order, 'digest');
        const amountString = this.safeString (order, 'amount');
        let remaining = undefined;
        if (amountString !== undefined) {
            remaining = this.parseX18 (amountString);
        }
        const filled = this.parseX18 (this.safeString (order, 'filled_qty'));
        const average = this.parseX18 (this.safeString (order, 'filled_price'));
        const reason = this.safeString (order, 'reason');
        let status = undefined;
        if (reason === 'placed') {
            status = 'open';
        } else if (reason === 'filled') {
            status = 'open';
            if ((amountString !== undefined) && Precise.stringEq (amountString, '0')) {
                status = 'closed';
            }
        } else if (reason === 'cancelled') {
            status = 'canceled';
        }
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': (filled === undefined) ? undefined : timestamp,
            'lastUpdateTimestamp': timestamp,
            'symbol': market['symbol'],
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': undefined,
            'price': undefined,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': undefined,
            'cost': undefined,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    handleOrder (client: Client, message) {
        const order = this.parseWsOrder (message);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (order);
        const symbol = order['symbol'];
        client.resolve (orders, 'orders');
        client.resolve (orders, 'orders:' + symbol);
    }

    parseWsPosition (position: Dict, market = undefined): Position {
        //
        //     {
        //         "type": "position_change",
        //         "timestamp": "1695081920633151000",
        //         "product_id": 2,
        //         "subaccount": "0x15f43d1f2dee81424afd891943262aa90f22cc2a64656661756c740000000000",
        //         "isolated": false,
        //         "amount": "100000000000000000",
        //         "v_quote_amount": "-3033500000000000000000",
        //         "reason": "match_orders"
        //     }
        //
        const marketId = this.safeString (position, 'product_id');
        market = this.safeMarket (marketId, market);
        const timestamp = this.parseWsTimestamp (position, 'timestamp');
        const amountString = this.safeString (position, 'amount');
        const vQuoteAmount = this.safeString (position, 'v_quote_amount');
        let side = undefined;
        let contracts = undefined;
        let entryPrice = undefined;
        if (amountString !== undefined) {
            if (Precise.stringGt (amountString, '0')) {
                side = 'long';
            } else if (Precise.stringLt (amountString, '0')) {
                side = 'short';
            }
            const absoluteAmount = Precise.stringAbs (amountString);
            contracts = this.parseX18 (absoluteAmount);
            if ((vQuoteAmount !== undefined) && !Precise.stringEquals (absoluteAmount, '0')) {
                entryPrice = this.parseNumber (Precise.stringDiv (Precise.stringAbs (vQuoteAmount), absoluteAmount));
            }
        }
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'isolated': this.safeBool (position, 'isolated'),
            'hedged': false,
            'side': side,
            'contracts': contracts,
            'contractSize': this.safeNumber (market, 'contractSize'),
            'entryPrice': entryPrice,
            'markPrice': undefined,
            'notional': undefined,
            'leverage': undefined,
            'collateral': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'unrealizedPnl': undefined,
            'liquidationPrice': undefined,
            'marginMode': undefined,
            'marginRatio': undefined,
            'percentage': undefined,
        });
    }

    handlePosition (client: Client, message) {
        const marketId = this.safeString (message, 'product_id');
        const market = this.safeMarket (marketId);
        if (!this.safeBool (market, 'contract', false)) {
            return;
        }
        const position = this.parseWsPosition (message, market);
        if (this.positions === undefined) {
            this.positions = new ArrayCacheBySymbolBySide ();
        }
        const positions = this.positions;
        const side = this.safeString (position, 'side');
        if (side === undefined) {
            positions.append (this.extend ({}, position, { 'side': 'long' }));
            positions.append (this.extend ({}, position, { 'side': 'short' }));
        } else {
            positions.append (position);
        }
        const symbol = position['symbol'];
        client.resolve (positions, 'positions');
        client.resolve (positions, 'positions:' + symbol);
    }

    parseWsBidAsk (bidask: Dict, market = undefined): Ticker {
        //
        //     {
        //         "type": "best_bid_offer",
        //         "timestamp": "1676151190656903000",
        //         "product_id": 1,
        //         "bid_price": "24990000000000000000000",
        //         "bid_qty": "5000000000000000000",
        //         "ask_price": "25010000000000000000000",
        //         "ask_qty": "3000000000000000000"
        //     }
        //
        const marketId = this.safeString (bidask, 'product_id');
        market = this.safeMarket (marketId, market);
        const timestamp = this.parseWsTimestamp (bidask, 'timestamp');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'ask': this.parseX18 (this.safeString (bidask, 'ask_price')),
            'askVolume': this.parseX18 (this.safeString (bidask, 'ask_qty')),
            'bid': this.parseX18 (this.safeString (bidask, 'bid_price')),
            'bidVolume': this.parseX18 (this.safeString (bidask, 'bid_qty')),
            'info': bidask,
        }, market);
    }

    handleBidAsk (client: Client, message) {
        const ticker = this.parseWsBidAsk (message);
        const symbol = ticker['symbol'];
        this.bidsasks[symbol] = ticker;
        this.tickers[symbol] = ticker;
        const tickers: Dict = {};
        tickers[symbol] = ticker;
        client.resolve (ticker, 'bidask:' + symbol);
        client.resolve (ticker, 'ticker:' + symbol);
        client.resolve (tickers, 'bidask');
        client.resolve (tickers, 'ticker');
    }

    parseWsAllBidsAsks (message: Dict): Tickers {
        //
        //     {
        //         "type": "all_bbo",
        //         "time": "1781750134714",
        //         "bbos": {
        //             "2": { "bid": "64924000000000000000000", "ask": "64935000000000000000000" }
        //         }
        //     }
        //
        const timestamp = this.safeInteger (message, 'time');
        const bbos = this.safeDict (message, 'bbos', {});
        const marketIds = Object.keys (bbos);
        const result: Dict = {};
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket (marketId);
            const bbo = this.safeDict (bbos, marketId, {});
            const ticker = this.safeTicker ({
                'symbol': market['symbol'],
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'ask': this.parseX18 (this.safeString (bbo, 'ask')),
                'bid': this.parseX18 (this.safeString (bbo, 'bid')),
                'info': bbo,
            }, market);
            const symbol = market['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    handleAllBidsAsks (client: Client, message) {
        const tickers = this.parseWsAllBidsAsks (message);
        const symbols = Object.keys (tickers);
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const ticker = tickers[symbol];
            this.bidsasks[symbol] = ticker;
            this.tickers[symbol] = ticker;
            client.resolve (ticker, 'bidask:' + symbol);
            client.resolve (ticker, 'ticker:' + symbol);
        }
        client.resolve (tickers, 'bidask');
        client.resolve (tickers, 'ticker');
    }

    parseWsOrderBookDeltas (deltas) {
        const result = [];
        for (let i = 0; i < deltas.length; i++) {
            const delta = deltas[i];
            result.push ([
                this.parseX18 (this.safeString (delta, 0)),
                this.parseX18 (this.safeString (delta, 1)),
            ]);
        }
        return result;
    }

    handleDelta (bookside, delta) {
        const bidAsk = [
            this.parseX18 (this.safeString (delta, 0)),
            this.parseX18 (this.safeString (delta, 1)),
        ];
        bookside.storeArray (bidAsk);
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         "type": "book_depth",
        //         "min_timestamp": "1683805381879572835",
        //         "max_timestamp": "1683805381879572835",
        //         "last_max_timestamp": "1683805381771464799",
        //         "product_id": 1,
        //         "bids": [["21594490000000000000000", "51007390115411548"]],
        //         "asks": [["21694490000000000000000", "0"]]
        //     }
        //
        const marketId = this.safeString (message, 'product_id');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ();
        }
        const orderbook = this.orderbooks[symbol];
        const asks = this.parseWsOrderBookDeltas (this.safeList (message, 'asks', []));
        const bids = this.parseWsOrderBookDeltas (this.safeList (message, 'bids', []));
        this.handleDeltas (orderbook['asks'], asks);
        this.handleDeltas (orderbook['bids'], bids);
        const timestamp = this.parseWsTimestamp (message, 'max_timestamp');
        orderbook['symbol'] = symbol;
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        orderbook['maxTimestamp'] = this.safeString (message, 'max_timestamp');
        const messageHash = 'orderbook:' + symbol;
        client.resolve (orderbook, messageHash);
    }

    handleSubscription (client: Client, message) {
        const id = this.safeString (message, 'id');
        const subscription = this.safeDict (client.subscriptions, 'subscription:' + id);
        if (subscription !== undefined) {
            const subscribeHash = this.safeString (subscription, 'subscribeHash');
            delete client.subscriptions['subscription:' + id];
            client.resolve (message, subscribeHash);
        }
    }

    handleAuthentication (client: Client, message) {
        const id = this.safeString (message, 'id');
        const messageHash = this.safeString (client.subscriptions, 'authentication:' + id);
        if (messageHash !== undefined) {
            delete client.subscriptions['authentication:' + id];
            client.subscriptions[messageHash] = true;
            client.resolve (message, messageHash);
        }
    }

    handleUnsubscription (client: Client, message) {
        const id = this.safeString (message, 'id');
        const unsubscription = this.safeDict (client.subscriptions, 'unsubscription:' + id);
        if (unsubscription !== undefined) {
            const messageHash = this.safeString (unsubscription, 'messageHash');
            const unsubscribeHash = this.safeString (unsubscription, 'unsubscribeHash');
            delete client.subscriptions['unsubscription:' + id];
            this.cleanUnsubscription (client, messageHash, unsubscribeHash);
            this.handleUnsubscriptionCache (messageHash);
            client.resolve (message, unsubscribeHash);
            return;
        }
        const subscriptions = Object.keys (client.subscriptions);
        for (let i = 0; i < subscriptions.length; i++) {
            const unsubscribeHash = subscriptions[i];
            const subscription = client.subscriptions[unsubscribeHash];
            const subscriptionId = this.safeString (subscription, 'id');
            if (subscriptionId !== id) {
                continue;
            }
            const messageHash = this.safeString (subscription, 'messageHash');
            this.cleanUnsubscription (client, messageHash, unsubscribeHash);
            this.handleUnsubscriptionCache (messageHash);
            client.resolve (message, unsubscribeHash);
            return;
        }
    }

    handleUnsubscriptionCache (messageHash: string) {
        if (messageHash.indexOf ('trade:') === 0) {
            const symbol = messageHash.replace ('trade:', '');
            delete this.trades[symbol];
        } else if (messageHash.indexOf ('orderbook:') === 0) {
            const symbol = messageHash.replace ('orderbook:', '');
            delete this.orderbooks[symbol];
        } else if (messageHash.indexOf ('ohlcv:') === 0) {
            const parts = messageHash.split (':');
            const timeframe = this.safeString (parts, 1);
            const symbol = this.safeString (parts, 2);
            if ((symbol in this.ohlcvs) && (timeframe in this.ohlcvs[symbol])) {
                delete this.ohlcvs[symbol][timeframe];
            }
        } else if (messageHash.indexOf ('ticker:') === 0) {
            const symbol = messageHash.replace ('ticker:', '');
            delete this.tickers[symbol];
        } else if (messageHash === 'ticker') {
            const symbols = Object.keys (this.tickers);
            for (let i = 0; i < symbols.length; i++) {
                delete this.tickers[symbols[i]];
            }
        } else if (messageHash.indexOf ('bidask:') === 0) {
            const symbol = messageHash.replace ('bidask:', '');
            delete this.bidsasks[symbol];
        } else if (messageHash === 'bidask') {
            const symbols = Object.keys (this.bidsasks);
            for (let i = 0; i < symbols.length; i++) {
                delete this.bidsasks[symbols[i]];
            }
        } else if (messageHash.indexOf ('orders') === 0) {
            this.orders = undefined;
        } else if (messageHash.indexOf ('myTrades') === 0) {
            this.myTrades = undefined;
        } else if (messageHash.indexOf ('positions') === 0) {
            this.positions = undefined;
        }
    }

    ping (client: Client) {
        return {
            'method': 'ping',
            'id': this.nonce (),
            'client_time': this.numberToString (this.milliseconds ()),
        };
    }

    handlePong (client: Client, message) {
        //
        //     {
        //         "result": {
        //             "method": "pong",
        //             "server_time": "1780000000123",
        //             "client_time": "1780000000000"
        //         },
        //         "id": 10
        //     }
        //
        const result = this.safeDict (message, 'result', {});
        client.lastPong = this.safeInteger (result, 'server_time', this.milliseconds ());
        return message;
    }

    handleErrorMessage (client: Client, message): Bool {
        const error = this.safeValue (message, 'error');
        const status = this.safeString (message, 'status');
        if ((error === undefined) && (status !== 'failure')) {
            return false;
        }
        const feedback = this.id + ' ' + this.json (message);
        const id = this.safeString (message, 'id');
        if ((id !== undefined) && (id in client.futures)) {
            client.reject (feedback, id);
        } else {
            client.reject (feedback);
        }
        return true;
    }

    handleMessage (client: Client, message) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const id = this.safeString (message, 'id');
        const hasResult = ('result' in message);
        const result = message['result'];
        if ((id !== undefined) && hasResult) {
            const authentication = this.safeValue (client.subscriptions, 'authentication:' + id);
            if (authentication !== undefined) {
                this.handleAuthentication (client, message);
                return;
            }
            const subscription = this.safeValue (client.subscriptions, 'subscription:' + id);
            if (subscription !== undefined) {
                this.handleSubscription (client, message);
                return;
            }
            if (result === null) {
                this.handleUnsubscription (client, message);
                return;
            }
            this.handleSubscription (client, message);
            return;
        }
        const method = this.safeString (result, 'method');
        if (method === 'pong') {
            this.handlePong (client, message);
            return;
        }
        const type = this.safeString (message, 'type');
        const methods = {
            'trade': this.handleTrade,
            'all_bbo': this.handleAllBidsAsks,
            'best_bid_offer': this.handleBidAsk,
            'book_depth': this.handleOrderBook,
            'fill': this.handleMyTrade,
            'latest_candlestick': this.handleOHLCV,
            'order_update': this.handleOrder,
            'position_change': this.handlePosition,
        };
        const handler = this.safeValue (methods, type);
        if (handler !== undefined) {
            handler.call (this, client, message);
        }
    }
}
