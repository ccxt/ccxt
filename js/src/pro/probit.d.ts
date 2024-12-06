import probitRest from '../probit.js';
import type { Int, Str, OrderBook, Order, Trade, Ticker, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class probit extends probitRest {
    describe(): any;
    /**
     * @method
     * @name probit#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs-en.probit.com/reference/balance-1
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    parseWSBalance(message: any): void;
    /**
     * @method
     * @name probit#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs-en.probit.com/reference/marketdata
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.interval] Unit time to synchronize market information (ms). Available units: 100, 500
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleTicker(client: Client, message: any): void;
    /**
     * @method
     * @name probit#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs-en.probit.com/reference/trade_history
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.interval] Unit time to synchronize market information (ms). Available units: 100, 500
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    /**
     * @method
     * @name probit#watchMyTrades
     * @description get the list of trades associated with the user
     * @see https://docs-en.probit.com/reference/trade_history
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleMyTrades(client: Client, message: any): void;
    /**
     * @method
     * @name probit#watchOrders
     * @description watches information on an order made by the user
     * @see https://docs-en.probit.com/reference/open_order
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {int} [since] timestamp in ms of the earliest order to watch
     * @param {int} [limit] the maximum amount of orders to watch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] choose what channel to use. Can open_order or order_history.
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrders(client: Client, message: any): void;
    /**
     * @method
     * @name probit#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs-en.probit.com/reference/marketdata
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    subscribePrivate(messageHash: any, channel: any, params: any): Promise<any>;
    subscribePublic(methodName: string, symbol: string, dataType: any, filter: any, params?: {}): Promise<any>;
    handleOrderBook(client: Client, message: any, orderBook: any): void;
    handleBidAsks(bookSide: any, bidAsks: any): void;
    handleDelta(orderbook: any, delta: any): void;
    handleErrorMessage(client: Client, message: any): void;
    handleAuthenticate(client: Client, message: any): void;
    handleMarketData(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
    authenticate(params?: {}): Promise<any>;
}
