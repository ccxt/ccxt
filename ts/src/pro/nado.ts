//  ---------------------------------------------------------------------------

import nadoRest from '../nado.js';
import { ArgumentsRequired, ExchangeError, InvalidNonce, NotSupported } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import { Precise } from '../base/Precise.js';
import { keccak_256 as keccak } from '@noble/hashes/sha3.js';
import type { Bool, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class nado extends nadoRest {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'cancelAllOrdersWs': true,
                'cancelOrderWs': true,
                'cancelOrdersWs': true,
                'createOrderWs': true,
                'editOrderWs': true,
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
                'requestId': 0,
            },
            'urls': {
                'api': {
                    'ws': {
                        'gateway': 'wss://gateway.prod.nado.xyz/ws/v2',
                        'subscriptions': 'wss://gateway.prod.nado.xyz/v1/subscribe',
                    },
                },
                'test': {
                    'ws': {
                        'gateway': 'wss://gateway.test.nado.xyz/ws/v2',
                        'subscriptions': 'wss://gateway.test.nado.xyz/v1/subscribe',
                    },
                },
            },
        });
    }

    requestId (): Int {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
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
    override async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
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
    override async unWatchTrades (symbol: string, params = {}): Promise<any> {
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
    override async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' watchTradesForSymbols() requires a non-empty array of symbols');
        }
        symbols = this.marketSymbols (symbols, undefined, false, true, true);
        const markets: Market[] = [];
        const messageHashes: any[] = [];
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
    override async unWatchTradesForSymbols (symbols: string[], params = {}): Promise<any> {
        await this.loadMarkets ();
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' unWatchTradesForSymbols() requires a non-empty array of symbols');
        }
        symbols = this.marketSymbols (symbols, undefined, false, true, true);
        const markets: Market[] = [];
        const messageHashes: any[] = [];
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
     * @returns {OrderBook} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    override async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
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
    override async unWatchOrderBook (symbol: string, params = {}): Promise<any> {
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
     * @returns {OrderBook} an [order book structure]{@link https://docs.ccxt.com/#/?id=order-book-structure}
     */
    override async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' watchOrderBookForSymbols() requires a non-empty array of symbols');
        }
        symbols = this.marketSymbols (symbols, undefined, false, true, true);
        const markets: Market[] = [];
        const messageHashes: any[] = [];
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
    override async unWatchOrderBookForSymbols (symbols: string[], params = {}): Promise<any> {
        await this.loadMarkets ();
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' unWatchOrderBookForSymbols() requires a non-empty array of symbols');
        }
        symbols = this.marketSymbols (symbols, undefined, false, true, true);
        const markets: Market[] = [];
        const messageHashes: any[] = [];
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
    override async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
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
    override async watchOHLCVForSymbols (symbolsAndTimeframes: string[][], since: Int = undefined, limit: Int = undefined, params = {}) {
        const symbolsLength = symbolsAndTimeframes.length;
        if (symbolsLength === 0 || !Array.isArray (symbolsAndTimeframes[0])) {
            throw new ArgumentsRequired (this.id + " watchOHLCVForSymbols() requires a an array of symbols and timeframes, like  [['BTC/USDT0:USDT0', '1m'], ['ETH/USDT0:USDT0', '5m']]");
        }
        await this.loadMarkets ();
        const markets: Market[] = [];
        const messageHashes: any[] = [];
        const subscriptionParams: any[] = [];
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
    override async unWatchOHLCV (symbol: string, timeframe: string = '1m', params = {}): Promise<any> {
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
    override async unWatchOHLCVForSymbols (symbolsAndTimeframes: string[][], params = {}): Promise<any> {
        const symbolsLength = symbolsAndTimeframes.length;
        if (symbolsLength === 0 || !Array.isArray (symbolsAndTimeframes[0])) {
            throw new ArgumentsRequired (this.id + " unWatchOHLCVForSymbols() requires a an array of symbols and timeframes, like  [['BTC/USDT0:USDT0', '1m'], ['ETH/USDT0:USDT0', '5m']]");
        }
        await this.loadMarkets ();
        const markets: Market[] = [];
        const messageHashes: any[] = [];
        const subscriptionParams: any[] = [];
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
    override async watchTicker (symbol: string, params = {}): Promise<Ticker> {
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
    override async unWatchTicker (symbol: string, params = {}): Promise<any> {
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
    override async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true, true, true);
        let market: Market = undefined;
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
    override async unWatchTickers (symbols: Strings = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true, true, true);
        let market: Market = undefined;
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
    override async watchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true, true, true);
        let market: Market = undefined;
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
    override async unWatchBidsAsks (symbols: Strings = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true, true, true);
        let market: Market = undefined;
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
    override async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        await this.authenticate (this.extend ({}, params));
        let market: Market = undefined;
        let messageHash = 'orders';
        let productId: any = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
            productId = this.parseToInt (market['id']);
        }
        let subaccount: Str = undefined;
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
    override async unWatchOrders (symbol: Str = undefined, params = {}): Promise<any> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        await this.authenticate (this.extend ({}, params));
        let market: Market = undefined;
        let messageHash = 'orders';
        let productId: any = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
            productId = this.parseToInt (market['id']);
        }
        let subaccount: Str = undefined;
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
    override async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        await this.authenticate (this.extend ({}, params));
        let market: Market = undefined;
        let messageHash = 'myTrades';
        let productId: any = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
            productId = this.parseToInt (market['id']);
        }
        let subaccount: Str = undefined;
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
    override async unWatchMyTrades (symbol: Str = undefined, params = {}): Promise<any> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        await this.authenticate (this.extend ({}, params));
        let market: Market = undefined;
        let messageHash = 'myTrades';
        let productId: any = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
            productId = this.parseToInt (market['id']);
        }
        let subaccount: Str = undefined;
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
    override async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        await this.authenticate (this.extend ({}, params));
        symbols = this.marketSymbols (symbols, undefined, false, true, true);
        let messageHash = 'positions';
        let productId: any = undefined;
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength === 1) {
                const market = this.market (symbols[0]);
                messageHash += ':' + market['symbol'];
                productId = this.parseToInt (market['id']);
            }
        }
        let subaccount: Str = undefined;
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
    override async unWatchPositions (symbols: Strings = undefined, params = {}): Promise<any> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        await this.authenticate (this.extend ({}, params));
        symbols = this.marketSymbols (symbols, undefined, false, true, true);
        let messageHash = 'positions';
        let productId: any = undefined;
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength === 1) {
                const market = this.market (symbols[0]);
                messageHash += ':' + market['symbol'];
                productId = this.parseToInt (market['id']);
            }
        }
        let subaccount: Str = undefined;
        [ subaccount, params ] = this.handleOptionAndParams (params, 'unWatchPositions', 'subaccount', 'default');
        const sender = this.createSubaccount (this.walletAddress, subaccount);
        const stream: Dict = {
            'type': 'position_change',
            'subaccount': sender,
            'product_id': productId,
        };
        return await this.unWatchPrivate (stream, messageHash, params);
    }

    /**
     * @method
     * @name nado#createOrderWs
     * @description create a trade order over the v2 gateway WebSocket
     * @see https://docs.nado.xyz/developer-resources/api/gateway/websocket-v2
     * @see https://docs.nado.xyz/developer-resources/api/gateway/executes/place-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type must be 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {string|int} [params.expiration] order expiration timestamp in seconds, defaults to 4294967295
     * @param {string|int} [params.appendix] pre-encoded order appendix
     * @param {boolean} [params.reduceOnly] true if the order should only reduce position
     * @param {boolean} [params.postOnly] true to create a post-only order
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK', or 'PO'
     * @param {boolean} [params.spotLeverage] whether leverage should be used for spot, defaults to true, exchange-specific alias params.spot_leverage
     * @param {int} [params.id] client-provided request id used to correlate the out-of-order v2 response, autogenerated when omitted
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async createOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        params = this.extend ({ 'id': this.requestId () }, params);
        const requestIdString = this.safeString (params, 'id');
        if (requestIdString === undefined) {
            throw new ArgumentsRequired (this.id + ' ws execute requires params.id');
        }
        const request = await this.createOrderRequest (symbol, type, side, amount, price, params);
        const placeOrder = this.safeDict (request, 'place_order', {});
        if ('trigger' in placeOrder) {
            throw new NotSupported (this.id + ' createOrderWs() does not support trigger orders, use createOrder() instead');
        }
        if (requestIdString === undefined) {
            throw new ArgumentsRequired (this.id + ' requires params.id');
        }
        const response = await this.watchExecuteRequest (requestIdString, request);
        //
        //     {
        //         "status": "success",
        //         "signature": "0x...",
        //         "data": {
        //             "digest": "0x..."
        //         },
        //         "request_type": "execute_place_order",
        //         "id": 100
        //     }
        //
        return this.parseOrder (this.extend ({ 'place_order': placeOrder }, response), market);
    }

    /**
     * @method
     * @name nado#editOrderWs
     * @description edit a trade order over the v2 gateway WebSocket
     * @see https://docs.nado.xyz/developer-resources/api/gateway/websocket-v2
     * @see https://docs.nado.xyz/developer-resources/api/gateway/executes/cancel-and-place
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to edit an order in
     * @param {string} type must be 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {string|int} [params.expiration] order expiration timestamp in seconds, defaults to 4294967295
     * @param {string|int} [params.appendix] pre-encoded order appendix
     * @param {boolean} [params.reduceOnly] true if the order should only reduce position
     * @param {boolean} [params.postOnly] true to create a post-only order
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK', or 'PO'
     * @param {boolean} [params.spotLeverage] whether leverage should be used for spot, defaults to true, exchange-specific alias params.spot_leverage
     * @param {boolean} [params.placeRequiresUnfilled] when true, aborts the new order if the canceled order had partial fills or the cancel failed, exchange-specific alias params.place_requires_unfilled, defaults to true
     * @param {int} [params.id] client-provided request id used to correlate the out-of-order v2 response, autogenerated when omitted
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async editOrderWs (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}): Promise<Order> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        // for cancel_and_place the request id is echoed from the nested place_order object
        params = this.extend ({ 'id': this.requestId () }, params);
        const requestIdString = this.safeString (params, 'id');
        if (requestIdString === undefined) {
            throw new ArgumentsRequired (this.id + ' ws execute requires params.id');
        }
        const request = await this.editOrderRequest (id, symbol, type, side, amount, price, params);
        if (requestIdString === undefined) {
            throw new ArgumentsRequired (this.id + ' requires params.id');
        }
        const response = await this.watchExecuteRequest (requestIdString, request);
        //
        //     {
        //         "status": "success",
        //         "signature": "0x...",
        //         "data": {
        //             "digest": "0x..."
        //         },
        //         "request_type": "execute_cancel_and_place",
        //         "id": 100
        //     }
        //
        const cancelAndPlace = this.safeDict (request, 'cancel_and_place', {});
        const placeOrder = this.safeDict (cancelAndPlace, 'place_order', {});
        return this.parseOrder (this.extend ({ 'place_order': placeOrder }, response), market);
    }

    /**
     * @method
     * @name nado#cancelOrderWs
     * @description cancels an open order over the v2 gateway WebSocket
     * @see https://docs.nado.xyz/developer-resources/api/gateway/websocket-v2
     * @see https://docs.nado.xyz/developer-resources/api/gateway/executes/cancel-orders
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {string} [params.requiredUnfilledAmount] cancel only if the order's absolute remaining unfilled amount matches this amount, exchange-specific raw x18 alias params.required_unfilled_amount
     * @param {int} [params.id] client-provided request id used to correlate the out-of-order v2 response, autogenerated when omitted
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async cancelOrderWs (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        const orders = await this.cancelOrdersWs ([ id ], symbol, params);
        return this.safeDict (orders, 0) as Order;
    }

    /**
     * @method
     * @name nado#cancelOrdersWs
     * @description cancel multiple orders over the v2 gateway WebSocket
     * @see https://docs.nado.xyz/developer-resources/api/gateway/websocket-v2
     * @see https://docs.nado.xyz/developer-resources/api/gateway/executes/cancel-orders
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {string} [params.requiredUnfilledAmount] cancel only if the order's absolute remaining unfilled amount matches this amount, exchange-specific raw x18 alias params.required_unfilled_amount
     * @param {int} [params.id] client-provided request id used to correlate the out-of-order v2 response, autogenerated when omitted
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async cancelOrdersWs (ids: string[], symbol: Str = undefined, params = {}): Promise<Order[]> {
        this.checkRequiredCredentials ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrdersWs() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const trigger = this.safeBool2 (params, 'stop', 'trigger');
        if (trigger) {
            throw new NotSupported (this.id + ' cancelOrdersWs() does not support trigger orders, use cancelOrders() instead');
        }
        params = this.extend ({ 'id': this.requestId () }, params);
        const requestIdString = this.safeString (params, 'id');
        if (requestIdString === undefined) {
            throw new ArgumentsRequired (this.id + ' ws execute requires params.id');
        }
        const request = await this.cancelOrdersRequest (ids, symbol, params);
        if (requestIdString === undefined) {
            throw new ArgumentsRequired (this.id + ' requires params.id');
        }
        const response = await this.watchExecuteRequest (requestIdString, request);
        //
        //     {
        //         "status": "success",
        //         "signature": "0x...",
        //         "data": {
        //             "cancelled_orders": []
        //         },
        //         "request_type": "execute_cancel_orders",
        //         "id": 100
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const cancelledOrders = this.safeList (data, 'cancelled_orders', []);
        const result: any[] = [];
        for (let i = 0; i < cancelledOrders.length; i++) {
            result.push (this.parseOrder (this.extend ({ 'status': 'canceled' }, cancelledOrders[i]), market));
        }
        return result;
    }

    /**
     * @method
     * @name nado#cancelAllOrdersWs
     * @description cancel all open orders over the v2 gateway WebSocket
     * @see https://docs.nado.xyz/developer-resources/api/gateway/websocket-v2
     * @see https://docs.nado.xyz/developer-resources/api/gateway/executes/cancel-product-orders
     * @param {string} [symbol] unified market symbol, when undefined all orders for all products are canceled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {int} [params.id] client-provided request id used to correlate the out-of-order v2 response, autogenerated when omitted
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async cancelAllOrdersWs (symbol: Str = undefined, params = {}): Promise<Order[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const trigger = this.safeBool2 (params, 'stop', 'trigger');
        if (trigger) {
            throw new NotSupported (this.id + ' cancelAllOrdersWs() does not support trigger orders, use cancelAllOrders() instead');
        }
        params = this.extend ({ 'id': this.requestId () }, params);
        const requestIdString = this.safeString (params, 'id');
        if (requestIdString === undefined) {
            throw new ArgumentsRequired (this.id + ' ws execute requires params.id');
        }
        const request = await this.cancelAllOrdersRequest (symbol, params);
        if (requestIdString === undefined) {
            throw new ArgumentsRequired (this.id + ' requires params.id');
        }
        const response = await this.watchExecuteRequest (requestIdString, request);
        const data = this.safeDict (response, 'data', {});
        const cancelledOrders = this.safeList (data, 'cancelled_orders', []);
        const result: any[] = [];
        for (let i = 0; i < cancelledOrders.length; i++) {
            result.push (this.parseOrder (this.extend ({ 'status': 'canceled' }, cancelledOrders[i]), market));
        }
        return result;
    }

    async watchExecuteRequest (requestIdString: Str, request: any) {
        // the v2 gateway dispatches requests concurrently, so responses arrive
        // in completion order, not send order — every execute carries a unique
        // request id and its response is correlated by the echoed id
        if (requestIdString === undefined) {
            throw new ArgumentsRequired (this.id + ' watchExecuteRequest() requires requestIdString');
        }
        const url = this.urls['api']['ws']['gateway'];
        const messageHash = 'execute:' + requestIdString;
        return await this.watch (url, messageHash, request, messageHash);
    }

    async watchPublic (streamType: any, market: any, messageHash: string, params = {}) {
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
            'id': this.requestId (),
        };
        const subscribeHash = 'subscribe:' + this.json (request['stream']);
        const subscription = {
            'streamType': streamType,
            'symbol': this.safeString (market, 'symbol'),
        };
        const client = this.client (url);
        const clientSubscription = this.safeValue (client.subscriptions, subscribeHash);
        if (clientSubscription === undefined) {
            const id = this.safeString (request, 'id');
            client.subscriptions['subscription:' + id] = {
                'subscribeHash': subscribeHash,
            };
            this.watchMultiple (url, [ subscribeHash ], request, [ subscribeHash ], subscription);
        }
        return await this.watch (url, messageHash);
    }

    async watchPrivate (streamType: any, stream: any, messageHash: string, params = {}) {
        const url = this.urls['api']['ws']['subscriptions'];
        const client = this.client (url);
        const clientSubscription = this.safeValue (client.subscriptions, messageHash);
        if (clientSubscription !== undefined) {
            return await this.watch (url, messageHash);
        }
        const id = this.requestId ();
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

    async unWatchPrivate (stream: any, messageHash: string, params = {}) {
        const url = this.urls['api']['ws']['subscriptions'];
        const id = this.requestId ();
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
        let recvWindow: Int = undefined;
        [ recvWindow, params ] = this.handleOptionAndParams (params, 'authenticate', 'recvWindow', 5000);
        let subaccount: Str = undefined;
        [ subaccount, params ] = this.handleOptionAndParams (params, 'authenticate', 'subaccount', 'default');
        const id = this.requestId ();
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

    signStreamAuthentication (tx: any, chainId: any, endpointAddress: string) {
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

    createPublicSubscriptionRequest (method: string, streamType: any, market = undefined, id: Int = undefined, params = {}) {
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

    async watchPublicMultiple (streamType: any, markets: any, messageHashes: string[], params = {}, subscriptionParams: any = undefined) {
        const url = this.urls['api']['ws']['subscriptions'];
        const client = this.client (url);
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const clientSubscription = this.safeValue (client.subscriptions, messageHash);
            if (clientSubscription === undefined) {
                const market = markets[i];
                const id = this.requestId ();
                const requestParams = (subscriptionParams === undefined) ? params : subscriptionParams[i];
                const request = this.createPublicSubscriptionRequest ('subscribe', streamType, market, id, requestParams);
                const subscribeHash = 'subscribe:' + this.json (request['stream']);
                const streamSubscription = this.safeValue (client.subscriptions, subscribeHash);
                if (streamSubscription === undefined) {
                    const subscription = {
                        'streamType': streamType,
                        'symbol': this.safeString (market, 'symbol'),
                    };
                    client.subscriptions['subscription:' + this.numberToString (id)] = {
                        'subscribeHash': subscribeHash,
                    };
                    this.watchMultiple (url, [ subscribeHash ], request, [ subscribeHash ], subscription);
                }
            }
        }
        return await this.watchMultiple (url, messageHashes, undefined, messageHashes);
    }

    async unWatchPublic (streamType: any, market: any, messageHash: string, params = {}) {
        const url = this.urls['api']['ws']['subscriptions'];
        const id = this.requestId ();
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

    async unWatchPublicMultiple (streamType: any, markets: any, messageHashes: string[], params = {}, subscriptionParams: any = undefined) {
        const url = this.urls['api']['ws']['subscriptions'];
        const client = this.client (url);
        const results: any[] = [];
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const id = this.requestId ();
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

    override parseWsTrade (trade: Dict, market: Market = undefined): Trade {
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
        let side: Str = undefined;
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

    parseWsMyTrade (trade: Dict, market: Market = undefined): Trade {
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
        let side: Str = undefined;
        if (isBid !== undefined) {
            side = isBid ? 'buy' : 'sell';
        }
        const isTaker = this.safeBool (trade, 'is_taker');
        let takerOrMaker: Str = undefined;
        if (isTaker !== undefined) {
            takerOrMaker = isTaker ? 'taker' : 'maker';
        }
        const feeCost = this.parseX18 (this.safeString (trade, 'fee'));
        let fee: any = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': market['quote'],
            };
        }
        return this.safeTrade ({
            'info': trade,
            // the id is required: myTrades are cached by id, and fills with an undefined id
            // would overwrite each other in the cache, collapsing the history to the last fill
            'id': this.safeString2 (trade, 'id', 'submission_idx'),
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

    handleTrade (client: Client, message: any) {
        const marketId = this.safeString (message, 'product_id');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'trade:' + symbol;
        let trades = this.safeValue (this.trades, symbol);
        if (trades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            trades = new ArrayCache (limit);
            this.trades[symbol] = trades;
        }
        const trade = this.parseWsTrade (message, market);
        trades.append (trade);
        client.resolve (trades, messageHash);
    }

    handleMyTrade (client: Client, message: any) {
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

    handleOHLCV (client: Client, message: any) {
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
        if (timeframe === undefined) {
            return;
        }
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
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

    override parseWsOrder (order: Dict, market: Market = undefined): Order {
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
        let remaining: Num = undefined;
        if (amountString !== undefined) {
            remaining = this.parseX18 (amountString);
        }
        const filled = this.parseX18 (this.safeString (order, 'filled_qty'));
        const average = this.parseX18 (this.safeString (order, 'filled_price'));
        const reason = this.safeString (order, 'reason');
        let status: Str = undefined;
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

    handleOrder (client: Client, message: any) {
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

    parseWsPosition (position: Dict, market: Market = undefined): Position {
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
        let side: Str = undefined;
        let contracts: Num = undefined;
        let entryPrice: Num = undefined;
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

    handlePosition (client: Client, message: any) {
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
            const longPosition = this.extend ({}, position);
            longPosition['side'] = 'long';
            positions.append (longPosition);
            const shortPosition = this.extend ({}, position);
            shortPosition['side'] = 'short';
            positions.append (shortPosition);
        } else {
            positions.append (position);
        }
        const symbol = position['symbol'];
        client.resolve (positions, 'positions');
        client.resolve (positions, 'positions:' + symbol);
    }

    parseWsBidAsk (bidask: Dict, market: Market = undefined): Ticker {
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

    handleBidAsk (client: Client, message: any) {
        const ticker = this.parseWsBidAsk (message);
        const symbol = this.safeString (ticker, 'symbol');
        if (symbol === undefined) {
            return;
        }
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
            const bid = this.safeString (bbo, 'bid');
            const ask = this.safeString (bbo, 'ask');
            const maxPrice = '170141183460469231731687303715884105727';
            if (Precise.stringGt (bid, '0') && Precise.stringGt (ask, '0') && !Precise.stringEquals (bid, maxPrice) && !Precise.stringEquals (ask, maxPrice)) {
                const ticker = this.safeTicker ({
                    'symbol': market['symbol'],
                    'timestamp': timestamp,
                    'datetime': this.iso8601 (timestamp),
                    'ask': this.parseX18 (ask),
                    'bid': this.parseX18 (bid),
                    'info': bbo,
                }, market);
                const symbol = market['symbol'];
                result[symbol] = ticker;
            }
        }
        return result;
    }

    handleAllBidsAsks (client: Client, message: any) {
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

    override handleDelta (bookside: any, delta: any) {
        const bidAsk = [
            this.parseX18 (this.safeString (delta, 0)),
            this.parseX18 (this.safeString (delta, 1)),
        ];
        bookside.storeArray (bidAsk);
    }

    handleOrderBook (client: Client, message: any) {
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
            return;
        }
        const orderbook = this.orderbooks[symbol];
        const messageHash = 'orderbook:' + symbol;
        const maxTimestamp = this.safeString (orderbook, 'maxTimestamp');
        const lastMaxTimestamp = this.safeString (message, 'last_max_timestamp');
        if ((maxTimestamp !== undefined) && (lastMaxTimestamp !== undefined) && (maxTimestamp !== lastMaxTimestamp)) {
            const subscriptions = Object.keys (client.subscriptions);
            for (let i = 0; i < subscriptions.length; i++) {
                const subscriptionHash = subscriptions[i];
                const subscription = this.safeDict (client.subscriptions, subscriptionHash);
                const streamType = this.safeString (subscription, 'streamType');
                const subscriptionSymbol = this.safeString (subscription, 'symbol');
                if ((streamType === 'book_depth') && (subscriptionSymbol === symbol)) {
                    delete client.subscriptions[subscriptionHash];
                }
            }
            delete client.subscriptions[messageHash];
            delete this.orderbooks[symbol];
            const error = new InvalidNonce (this.id + ' watchOrderBook received invalid nonce');
            client.reject (error, messageHash);
            return;
        }
        const asks = this.safeList (message, 'asks', []);
        const bids = this.safeList (message, 'bids', []);
        this.handleDeltas (orderbook['asks'], asks);
        this.handleDeltas (orderbook['bids'], bids);
        const timestamp = this.parseWsTimestamp (message, 'max_timestamp');
        orderbook['symbol'] = symbol;
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        (orderbook as Dict)['maxTimestamp'] = this.safeString (message, 'max_timestamp');
        client.resolve (orderbook, messageHash);
    }

    handleExecuteResponse (client: Client, message: any) {
        //
        //     {
        //         "status": "success",
        //         "signature": "0x...",
        //         "data": {
        //             "digest": "0x..."
        //         },
        //         "request_type": "execute_place_order",
        //         "id": 100
        //     }
        //
        const id = this.safeString (message, 'id');
        if (id === undefined) {
            return;
        }
        const messageHash = 'execute:' + id;
        const subscription = this.safeValue (client.subscriptions, messageHash);
        if (subscription !== undefined) {
            delete client.subscriptions[messageHash];
        }
        client.resolve (message, messageHash);
    }

    handleSubscription (client: Client, message: any) {
        const id = this.safeString (message, 'id');
        const subscription = this.safeDict (client.subscriptions, 'subscription:' + id);
        if (subscription !== undefined) {
            const subscribeHash = this.safeString (subscription, 'subscribeHash');
            delete client.subscriptions['subscription:' + id];
            client.resolve (message, subscribeHash);
        }
    }

    handleAuthentication (client: Client, message: any) {
        const id = this.safeString (message, 'id');
        const messageHash = this.safeString (client.subscriptions, 'authentication:' + id);
        if (messageHash !== undefined) {
            delete client.subscriptions['authentication:' + id];
            client.subscriptions[messageHash] = true;
            client.resolve (message, messageHash);
        }
    }

    handleUnsubscription (client: Client, message: any) {
        const id = this.safeString (message, 'id');
        const unsubscription = this.safeDict (client.subscriptions, 'unsubscription:' + id);
        if (unsubscription !== undefined) {
            const messageHash = this.safeString (unsubscription, 'messageHash');
            const unsubscribeHash = this.safeString (unsubscription, 'unsubscribeHash');
            delete client.subscriptions['unsubscription:' + id];
            if (messageHash !== undefined) {
                this.cleanUnsubscription (client, messageHash, unsubscribeHash);
                this.handleUnsubscriptionCache (messageHash);
            }
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
            if (messageHash !== undefined) {
                this.cleanUnsubscription (client, messageHash, unsubscribeHash);
                this.handleUnsubscriptionCache (messageHash);
            }
            client.resolve (message, unsubscribeHash);
            return;
        }
    }

    handleUnsubscriptionCache (messageHash: Str) {
        if (messageHash === undefined) {
            return;
        }
        if (messageHash.indexOf ('trade:') === 0) {
            const symbol = messageHash.replace ('trade:', '');
            if (symbol in this.trades) {
                delete this.trades[symbol];
            }
        } else if (messageHash.indexOf ('orderbook:') === 0) {
            const symbol = messageHash.replace ('orderbook:', '');
            if (symbol in this.orderbooks) {
                delete this.orderbooks[symbol];
            }
        } else if (messageHash.indexOf ('ohlcv:') === 0) {
            const parts = messageHash.split (':');
            const timeframe = this.safeString (parts, 1);
            const symbol = this.safeString (parts, 2);
            if ((symbol !== undefined) && (timeframe !== undefined) && (symbol in this.ohlcvs) && (timeframe in this.ohlcvs[symbol])) {
                delete this.ohlcvs[symbol][timeframe];
            }
        } else if (messageHash.indexOf ('ticker:') === 0) {
            const symbol = messageHash.replace ('ticker:', '');
            if (symbol in this.tickers) {
                delete this.tickers[symbol];
            }
        } else if (messageHash === 'ticker') {
            const symbols = Object.keys (this.tickers);
            for (let i = 0; i < symbols.length; i++) {
                delete this.tickers[symbols[i]];
            }
        } else if (messageHash.indexOf ('bidask:') === 0) {
            const symbol = messageHash.replace ('bidask:', '');
            if (symbol in this.bidsasks) {
                delete this.bidsasks[symbol];
            }
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

    override ping (client: Client) {
        const gatewayUrl = this.urls['api']['ws']['gateway'];
        if (client.url === gatewayUrl) {
            // the v2 gateway is kept alive with protocol-level ping frames,
            // returning undefined makes the client send one instead of a message
            return undefined;
        }
        return {
            'method': 'ping',
            'id': this.requestId (),
            'client_time': this.numberToString (this.milliseconds ()),
        };
    }

    handlePong (client: Client, message: any) {
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

    handleErrorMessage (client: Client, message: any): Bool {
        const error = this.safeValue (message, 'error');
        const status = this.safeString (message, 'status');
        if ((error === undefined) && (status !== 'failure')) {
            return false;
        }
        const feedback = new ExchangeError (this.id + ' ' + this.json (message));
        const id = this.safeString (message, 'id');
        if (id !== undefined) {
            const executeHash = 'execute:' + id;
            const executeSubscription = this.safeValue (client.subscriptions, executeHash);
            if (executeSubscription !== undefined) {
                delete client.subscriptions[executeHash];
                client.reject (feedback, executeHash);
                return true;
            }
        }
        const subscription = this.safeDict (client.subscriptions, 'subscription:' + id);
        if (subscription !== undefined) {
            const subscribeHash = this.safeString (subscription, 'subscribeHash');
            delete client.subscriptions['subscription:' + id];
            client.reject (feedback, subscribeHash);
        } else {
            client.reject (feedback);
        }
        return true;
    }

    override handleMessage (client: Client, message: any) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const id = this.safeString (message, 'id');
        const hasResult = ('result' in message);
        const result = this.safeValue (message, 'result');
        const method = this.safeString (result, 'method');
        if (method === 'pong') {
            // pong replies carry both 'id' and 'result' so they must be routed
            // before the subscription-ack branch below swallows them
            this.handlePong (client, message);
            return;
        }
        const requestType = this.safeString (message, 'request_type');
        if (requestType !== undefined) {
            // v2 gateway execute responses carry 'request_type' and the echoed request id
            this.handleExecuteResponse (client, message);
            return;
        }
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
            if (result === undefined) {
                this.handleUnsubscription (client, message);
                return;
            }
            this.handleSubscription (client, message);
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
