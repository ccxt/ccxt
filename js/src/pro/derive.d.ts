import deriveRest from '../derive.js';
import type { Int, Str, OrderBook, Order, Trade, Ticker, Dict, Bool } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class derive extends deriveRest {
    describe(): any;
    requestId(url: string): number;
    watchPublic(messageHash: string, message: Dict, subscription: Dict): Promise<any>;
    /**
     * @method
     * @name derive#watchOrderBook
     * @see https://docs.derive.xyz/reference/orderbook-instrument_name-group-depth
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    handleOrderBook(client: Client, message: Dict): void;
    /**
     * @method
     * @name derive#watchTicker
     * @see https://docs.derive.xyz/reference/ticker-instrument_name-interval
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: Dict): Promise<Ticker>;
    handleTicker(client: Client, message: Dict): Dict;
    /**
     * @method
     * @name derive#unWatchOrderBook
     * @description unsubscribe from the orderbook channel
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] orderbook limit, default is undefined
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name derive#unWatchTrades
     * @description unsubscribe from the trades channel
     * @param {string} symbol unified symbol of the market to unwatch the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    unWatchTrades(symbol: string, params?: {}): Promise<any>;
    unWatchPublic(messageHash: string, message: Dict, subscription: Dict): Promise<any>;
    handleOrderBookUnSubscription(client: Client, topic: string): void;
    handleTradesUnSubscription(client: Client, topic: string): void;
    handleUnSubscribe(client: Client, message: Dict): Dict;
    /**
     * @method
     * @name derive#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://docs.derive.xyz/reference/trades-instrument_name
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    handleTrade(client: Client, message: Dict): void;
    authenticate(params?: Dict): Promise<any>;
    watchPrivate(messageHash: string, message: Dict, subscription: Dict): Promise<any>;
    /**
     * @method
     * @name derive#watchOrders
     * @see https://docs.derive.xyz/reference/subaccount_id-orders
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    handleOrder(client: Client, message: Dict): void;
    /**
     * @method
     * @name derive#watchMyTrades
     * @see https://docs.derive.xyz/reference/subaccount_id-trades
     * @description watches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    handleMyTrade(client: Client, message: Dict): void;
    handleErrorMessage(client: Client, message: Dict): Bool;
    handleMessage(client: Client, message: Dict): void;
    handleAuth(client: Client, message: Dict): void;
}
