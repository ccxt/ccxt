import onetradingRest from '../onetrading.js';
import type { Int, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, OHLCV, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class onetrading extends onetradingRest {
    describe(): any;
    /**
     * @method
     * @name onetrading#watchBalance
     * @see https://developers.bitpanda.com/exchange/#account-history-channel
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalanceSnapshot(client: any, message: any): void;
    /**
     * @method
     * @name onetrading#watchTicker
     * @see https://developers.bitpanda.com/exchange/#market-ticker-channel
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name onetrading#watchTickers
     * @see https://developers.bitpanda.com/exchange/#market-ticker-channel
     * @description watches price tickers, a statistical calculation with the information for all markets or those specified.
     * @param {string} symbols unified symbols of the markets to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an array of [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleTicker(client: Client, message: any): void;
    parseWSTicker(ticker: any, market?: any): Ticker;
    /**
     * @method
     * @name onetrading#watchMyTrades
     * @see https://developers.bitpanda.com/exchange/#account-history-channel
     * @description get the list of trades associated with the user
     * @param {string} symbol unified symbol of the market to fetch trades for. Use 'any' to watch all trades
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name onetrading#watchOrderBook
     * @see https://developers.bitpanda.com/exchange/#market-ticker-channel
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    handleDelta(orderbook: any, delta: any): void;
    handleDeltas(orderbook: any, deltas: any): void;
    /**
     * @method
     * @name onetrading#watchOrders
     * @see https://developers.bitpanda.com/exchange/#account-history-channel
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] can listen to orders using ACCOUNT_HISTORY or TRADING
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleTrading(client: Client, message: any): void;
    parseTradingOrder(order: any, market?: any): Order;
    parseTradingOrderStatus(status: any): string;
    handleOrders(client: Client, message: any): void;
    handleAccountUpdate(client: Client, message: any): void;
    parseWsOrderStatus(status: any): string;
    updateBalance(balance: any): void;
    /**
     * @method
     * @name onetrading#watchOHLCV
     * @see https://developers.bitpanda.com/exchange/#candlesticks-channel
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
    findTimeframe(timeframe: any, timeframes?: any): string;
    handleSubscriptions(client: Client, message: any): any;
    handleHeartbeat(client: Client, message: any): any;
    handleErrorMessage(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
    handlePricePointUpdates(client: Client, message: any): any;
    handleAuthenticationMessage(client: Client, message: any): any;
    watchMany(messageHash: any, request: any, subscriptionHash: any, symbols?: Strings, params?: {}): Promise<any>;
    authenticate(params?: {}): Promise<any>;
}
