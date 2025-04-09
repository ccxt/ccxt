import bitstampRest from '../bitstamp.js';
import type { Int, Str, OrderBook, Order, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bitstamp extends bitstampRest {
    describe(): any;
    /**
     * @method
     * @name bitstamp#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    handleDelta(orderbook: any, delta: any): void;
    handleBidAsks(bookSide: any, bidAsks: any): void;
    getCacheIndex(orderbook: any, deltas: any): any;
    /**
     * @method
     * @name bitstamp#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseWsTrade(trade: any, market?: any): Trade;
    handleTrade(client: Client, message: any): void;
    /**
     * @method
     * @name bitstamp#watchOrders
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrders(client: Client, message: any): void;
    parseWsOrder(order: any, market?: any): Order;
    handleOrderBookSubscription(client: Client, message: any): void;
    handleSubscriptionStatus(client: Client, message: any): void;
    handleSubject(client: Client, message: any): void;
    handleErrorMessage(client: Client, message: any): any;
    handleMessage(client: Client, message: any): void;
    authenticate(params?: {}): Promise<void>;
    subscribePrivate(subscription: any, messageHash: any, params?: {}): Promise<any>;
}
