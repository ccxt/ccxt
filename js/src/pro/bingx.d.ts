import bingxRest from '../bingx.js';
import type { Int, OHLCV, Str, Strings, OrderBook, Order, Trade, Balances, Ticker, Tickers } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bingx extends bingxRest {
    describe(): any;
    /**
     * @method
     * @name bingx#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://bingx-api.github.io/docs/#/en-us/spot/socket/market.html#Subscribe%20to%2024-hour%20Price%20Change
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/socket/market.html#Subscribe%20to%2024-hour%20price%20changes
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/socket/market.html#Subscribe%20to%2024-Hour%20Price%20Change
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleTicker(client: Client, message: any): void;
    parseWsTicker(message: any, market?: any): Ticker;
    /**
     * @method
     * @name bingx#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/socket/market.html#Subscribe%20to%2024-hour%20price%20changes%20of%20all%20trading%20pairs
     * @param {string[]} symbols unified symbol of the market to watch the tickers for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name bingx#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/socket/market.html#Subscribe%20Market%20Depth%20Data%20of%20all%20trading%20pairs
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name bingx#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/socket/market.html#Subscribe%20K-Line%20Data%20of%20all%20trading%20pairs
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCVForSymbols(symbolsAndTimeframes: string[][], since?: Int, limit?: Int, params?: {}): Promise<import("../base/types.js").Dictionary<import("../base/types.js").Dictionary<OHLCV[]>>>;
    getOrderBookLimitByMarketType(marketType: string, limit?: Int): number;
    getMessageHash(unifiedChannel: string, symbol?: Str, extra?: Str): string;
    /**
     * @method
     * @name bingx#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://bingx-api.github.io/docs/#/spot/socket/market.html#Subscribe%20to%20tick-by-tick
     * @see https://bingx-api.github.io/docs/#/swapV2/socket/market.html#Subscribe%20the%20Latest%20Trade%20Detail
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/socket/market.html#Subscription%20transaction%20by%20transaction
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    /**
     * @method
     * @name bingx#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://bingx-api.github.io/docs/#/en-us/spot/socket/market.html#Subscribe%20Market%20Depth%20Data
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/socket/market.html#Subscribe%20Market%20Depth%20Data
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/socket/market.html#Subscribe%20to%20Limited%20Depth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleDelta(bookside: any, delta: any): void;
    handleOrderBook(client: Client, message: any): void;
    parseWsOHLCV(ohlcv: any, market?: any): OHLCV;
    handleOHLCV(client: Client, message: any): void;
    /**
     * @method
     * @name bingx#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://bingx-api.github.io/docs/#/en-us/spot/socket/market.html#K-line%20Streams
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/socket/market.html#Subscribe%20K-Line%20Data
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/socket/market.html#Subscribe%20to%20Latest%20Trading%20Pair%20K-Line
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name bingx#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://bingx-api.github.io/docs/#/en-us/spot/socket/account.html#Subscription%20order%20update%20data
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/socket/account.html#Order%20update%20push
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/socket/account.html#Order%20update%20push
     * @param {string} [symbol] unified market symbol of the market orders are made in
     * @param {int} [since] the earliest time in ms to watch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bingx#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://bingx-api.github.io/docs/#/en-us/spot/socket/account.html#Subscription%20order%20update%20data
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/socket/account.html#Order%20update%20push
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/socket/account.html#Order%20update%20push
     * @param {string} [symbol] unified market symbol of the market the trades are made in
     * @param {int} [since] the earliest time in ms to watch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bingx#watchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://bingx-api.github.io/docs/#/en-us/spot/socket/account.html#Subscription%20account%20balance%20push
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/socket/account.html#Account%20balance%20and%20position%20update%20push
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/socket/account.html#Account%20balance%20and%20position%20update%20push
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    setBalanceCache(client: Client, type: any, subType: any, subscriptionHash: any, params: any): void;
    loadBalanceSnapshot(client: any, messageHash: any, type: any, subType: any): Promise<void>;
    handleErrorMessage(client: any, message: any): boolean;
    keepAliveListenKey(params?: {}): Promise<void>;
    authenticate(params?: {}): Promise<void>;
    pong(client: any, message: any): Promise<void>;
    handleOrder(client: any, message: any): void;
    handleMyTrades(client: Client, message: any): void;
    handleBalance(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
}
