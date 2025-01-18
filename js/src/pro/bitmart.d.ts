import bitmartRest from '../bitmart.js';
import type { Int, Market, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, OHLCV, Position, Balances, Dict } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bitmart extends bitmartRest {
    describe(): any;
    subscribe(channel: any, symbol: any, type: any, params?: {}): Promise<any>;
    subscribeMultiple(channel: string, type: string, symbols?: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name bitmart#watchBalance
     * @see https://developer-pro.bitmart.com/en/spot/#private-balance-change
     * @see https://developer-pro.bitmart.com/en/futuresv2/#private-assets-channel
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    setBalanceCache(client: Client, type: any, subscribeHash: any): void;
    loadBalanceSnapshot(client: any, messageHash: any, type: any): Promise<void>;
    handleBalance(client: Client, message: any): void;
    /**
     * @method
     * @name bitmart#watchTrades
     * @see https://developer-pro.bitmart.com/en/spot/#public-trade-channel
     * @see https://developer-pro.bitmart.com/en/futuresv2/#public-trade-channel
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bitmart#watchTradesForSymbols
     * @see https://developer-pro.bitmart.com/en/spot/#public-trade-channel
     * @description get the list of most recent trades for a list of symbols
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    getParamsForMultipleSub(methodName: string, symbols: string[], limit?: Int, params?: {}): any[];
    /**
     * @method
     * @name bitmart#watchTicker
     * @see https://developer-pro.bitmart.com/en/spot/#public-ticker-channel
     * @see https://developer-pro.bitmart.com/en/futuresv2/#public-ticker-channel
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name bitmart#watchTickers
     * @see https://developer-pro.bitmart.com/en/spot/#public-ticker-channel
     * @see https://developer-pro.bitmart.com/en/futuresv2/#public-ticker-channel
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name bitmart#watchBidsAsks
     * @see https://developer-pro.bitmart.com/en/spot/#public-ticker-channel
     * @see https://developer-pro.bitmart.com/en/futuresv2/#public-ticker-channel
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleBidAsk(client: Client, message: any): void;
    parseWsBidAsk(ticker: any, market?: any): Ticker;
    /**
     * @method
     * @name bitmart#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://developer-pro.bitmart.com/en/spot/#private-order-progress
     * @see https://developer-pro.bitmart.com/en/futuresv2/#private-order-channel
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrders(client: Client, message: any): void;
    parseWsOrder(order: Dict, market?: Market): Order;
    parseWsOrderStatus(statusId: any): string;
    parseWsOrderSide(sideId: any): string;
    /**
     * @method
     * @name bitmart#watchPositions
     * @see https://developer-pro.bitmart.com/en/futures/#private-position-channel
     * @description watch all open positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    handlePositions(client: Client, message: any): void;
    parseWsPosition(position: any, market?: Market): Position;
    handleTrade(client: Client, message: any): void;
    handleTradeLoop(entry: any): string;
    parseWsTrade(trade: Dict, market?: Market): Trade;
    handleTicker(client: Client, message: any): void;
    parseWsSwapTicker(ticker: any, market?: Market): Ticker;
    /**
     * @method
     * @name bitmart#watchOHLCV
     * @see https://developer-pro.bitmart.com/en/spot/#public-kline-channel
     * @see https://developer-pro.bitmart.com/en/futuresv2/#public-klinebin-channel
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: any): void;
    /**
     * @method
     * @name bitmart#watchOrderBook
     * @see https://developer-pro.bitmart.com/en/spot/#public-depth-all-channel
     * @see https://developer-pro.bitmart.com/en/spot/#public-depth-increase-channel
     * @see https://developer-pro.bitmart.com/en/futuresv2/#public-depth-channel
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.speed] *futures only* '100ms' or '200ms'
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBookMessage(client: Client, message: any, orderbook: any): any;
    handleOrderBook(client: Client, message: any): void;
    /**
     * @method
     * @name bitmart#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developer-pro.bitmart.com/en/spot/#public-depth-increase-channel
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.depth] the type of order book to subscribe to, default is 'depth/increase100', also accepts 'depth5' or 'depth20' or depth50
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    authenticate(type: any, params?: {}): Promise<any>;
    handleSubscriptionStatus(client: Client, message: any): any;
    handleAuthenticate(client: Client, message: any): void;
    handleErrorMessage(client: Client, message: any): boolean;
    handleMessage(client: Client, message: any): void;
}
