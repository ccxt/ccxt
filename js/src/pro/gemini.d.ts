import geminiRest from '../gemini.js';
import type { Int, Str, Strings, OrderBook, Order, Trade, OHLCV, Tickers, Dict, Market } from '../base/types.js';
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
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name gemini#watchTradesForSymbols
     * @see https://docs.gemini.com/websocket-api/#multi-market-data
     * @description get the list of most recent trades for a list of symbols
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    parseWsTrade(trade: any, market?: Market): Trade;
    handleTrade(client: Client, message: Dict): void;
    handleTrades(client: Client, message: Dict): void;
    handleTradesForMultidata(client: Client, trades: any[], timestamp: Int): void;
    /**
     * @method
     * @name gemini#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.gemini.com/websocket-api/#candles-data-feed
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: Dict): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: Dict): Dict;
    /**
     * @method
     * @name gemini#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.gemini.com/websocket-api/#market-data-version-2
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    handleOrderBook(client: Client, message: Dict): void;
    /**
     * @method
     * @name gemini#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.gemini.com/websocket-api/#multi-market-data
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: Dict): Promise<OrderBook>;
    /**
     * @method
     * @name gemini#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://docs.gemini.com/websocket-api/#multi-market-data
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: Dict): Promise<Tickers>;
    handleBidsAsksForMultidata(client: Client, rawBidAskChanges: any[], timestamp: Int, nonce: Int): void;
    helperForWatchMultipleConstruct(itemHashName: string, symbols?: Strings, params?: Dict): Promise<any>;
    handleOrderBookForMultidata(client: Client, rawOrderBookChanges: any[], timestamp: Int, nonce: Int): void;
    handleL2Updates(client: Client, message: Dict): void;
    /**
     * @method
     * @name gemini#fetchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.gemini.com/websocket-api/#order-events
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    handleHeartbeat(client: Client, message: Dict): Dict;
    handleSubscription(client: Client, message: Dict): Dict;
    handleOrder(client: Client, message: any[]): void;
    parseWsOrder(order: any, market?: Market): Order;
    parseWsOrderStatus(status: Str): Str;
    parseWsOrderType(type: Str): Str;
    handleError(client: Client, message: Dict): void;
    handleMessage(client: Client, message: any): void;
    authenticate(params?: Dict): Promise<void>;
}
