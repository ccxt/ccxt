import bitfinex1Rest from '../bitfinex1.js';
import type { Int, Str, Trade, OrderBook, Order, Ticker } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bitfinex1 extends bitfinex1Rest {
    describe(): any;
    subscribe(channel: any, symbol: any, params?: {}): Promise<any>;
    /**
     * @method
     * @name bitfinex#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.bitfinex.com/v1/reference/ws-public-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bitfinex#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.bitfinex.com/v1/reference/ws-public-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleTrades(client: Client, message: any, subscription: any): void;
    parseTrade(trade: any, market?: any): Trade;
    handleTicker(client: Client, message: any, subscription: any): void;
    /**
     * @method
     * @name bitfinex#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.bitfinex.com/v1/reference/ws-public-order-books
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any, subscription: any): void;
    handleHeartbeat(client: Client, message: any): void;
    handleSystemStatus(client: Client, message: any): any;
    handleSubscriptionStatus(client: Client, message: any): any;
    authenticate(params?: {}): Promise<any>;
    handleAuthenticationMessage(client: Client, message: any): void;
    watchOrder(id: any, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name bitfinex#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.bitfinex.com/v1/reference/ws-auth-order-updates
     * @see https://docs.bitfinex.com/v1/reference/ws-auth-order-snapshots
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrders(client: Client, message: any, subscription: any): void;
    parseWsOrderStatus(status: any): string;
    handleOrder(client: Client, order: any): Order;
    handleMessage(client: Client, message: any): void;
}
