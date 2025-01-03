import wazirxRest from '../wazirx.js';
import type { Int, OHLCV, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class wazirx extends wazirxRest {
    describe(): any;
    /**
     * @method
     * @name wazirx#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.wazirx.com/#account-update
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: any): Trade;
    /**
     * @method
     * @name wazirx#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.wazirx.com/#all-market-tickers-stream
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name wazirx#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.wazirx.com/#all-market-tickers-stream
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleTicker(client: Client, message: any): void;
    parseWSTicker(ticker: any, market?: any): Ticker;
    /**
     * @method
     * @name wazirx#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.wazirx.com/#trade-streams
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    /**
     * @method
     * @name wazirx#watchMyTrades
     * @description watch trades by user
     * @see https://docs.wazirx.com/#trade-update
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name wazirx#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.wazirx.com/#kline-candlestick-stream
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: any): void;
    parseWsOHLCV(ohlcv: any, market?: any): OHLCV;
    /**
     * @method
     * @name wazirx#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.wazirx.com/#depth-stream
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBook(client: Client, message: any): void;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrder(client: Client, message: any): void;
    parseWsOrder(order: any, market?: any): Order;
    handleMyTrades(client: Client, message: any): void;
    handleConnected(client: Client, message: any): any;
    handleSubscribed(client: Client, message: any): any;
    handleError(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
    authenticate(params?: {}): Promise<string>;
}
