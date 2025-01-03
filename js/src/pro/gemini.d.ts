import geminiRest from '../gemini.js';
import type { Int, Str, Strings, OrderBook, Order, Trade, OHLCV, Tickers } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class gemini extends geminiRest {
    describe(): any;
    /**
     * @method
     * @name gemini#watchTrades
     * @description watch the list of most recent trades for a particular symbol
     * @see https://docs.gemini.com/websocket-api/#market-data-version-2
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name gemini#watchTradesForSymbols
     * @see https://docs.gemini.com/websocket-api/#multi-market-data
     * @description get the list of most recent trades for a list of symbols
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseWsTrade(trade: any, market?: any): Trade;
    handleTrade(client: Client, message: any): void;
    handleTrades(client: Client, message: any): void;
    handleTradesForMultidata(client: Client, trades: any, timestamp: Int): void;
    /**
     * @method
     * @name gemini#fetchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.gemini.com/websocket-api/#candles-data-feed
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: any): any;
    /**
     * @method
     * @name gemini#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.gemini.com/websocket-api/#market-data-version-2
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    /**
     * @method
     * @name gemini#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.gemini.com/websocket-api/#multi-market-data
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name gemini#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://docs.gemini.com/websocket-api/#multi-market-data
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleBidsAsksForMultidata(client: Client, rawBidAskChanges: any, timestamp: Int, nonce: Int): void;
    helperForWatchMultipleConstruct(itemHashName: string, symbols: string[], params?: {}): Promise<any>;
    handleOrderBookForMultidata(client: Client, rawOrderBookChanges: any, timestamp: Int, nonce: Int): void;
    handleL2Updates(client: Client, message: any): void;
    /**
     * @method
     * @name gemini#fetchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.gemini.com/websocket-api/#order-events
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleHeartbeat(client: Client, message: any): any;
    handleSubscription(client: Client, message: any): any;
    handleOrder(client: Client, message: any): void;
    parseWsOrder(order: any, market?: any): Order;
    parseWsOrderStatus(status: any): string;
    parseWsOrderType(type: any): string;
    handleError(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
    authenticate(params?: {}): Promise<void>;
}
