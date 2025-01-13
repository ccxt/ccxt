import upbitRest from '../upbit.js';
import type { Int, Str, Order, OrderBook, Trade, Ticker, Balances, Tickers, Strings } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class upbit extends upbitRest {
    describe(): any;
    watchPublic(symbol: string, channel: any, params?: {}): Promise<any>;
    watchPublicMultiple(symbols: Strings, channel: any, params?: {}): Promise<any>;
    /**
     * @method
     * @name upbit#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://global-docs.upbit.com/reference/websocket-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name upbit#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://global-docs.upbit.com/reference/websocket-ticker
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name upbit#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://global-docs.upbit.com/reference/websocket-trade
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name upbit#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://global-docs.upbit.com/reference/websocket-trade
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name upbit#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://global-docs.upbit.com/reference/websocket-orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleTicker(client: Client, message: any): void;
    handleOrderBook(client: Client, message: any): void;
    handleTrades(client: Client, message: any): void;
    authenticate(params?: {}): Promise<import("../base/ws/WsClient.js").default>;
    watchPrivate(symbol: any, channel: any, messageHash: any, params?: {}): Promise<any>;
    /**
     * @method
     * @name upbit#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://global-docs.upbit.com/reference/websocket-myorder
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name upbit#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://global-docs.upbit.com/reference/websocket-myorder
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseWsOrderStatus(status: Str): string;
    parseWsOrder(order: any, market?: any): Order;
    parseWsTrade(trade: any, market?: any): Trade;
    handleMyOrder(client: Client, message: any): void;
    handleMyTrade(client: Client, message: any): void;
    handleOrder(client: Client, message: any): void;
    /**
     * @method
     * @name upbit#watchBalance
     * @see https://global-docs.upbit.com/reference/websocket-myasset
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
}
