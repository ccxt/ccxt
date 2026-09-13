import bithumbRest from '../bithumb.js';
import type { Int, OrderBook, Ticker, Trade, Strings, Tickers, Dict, Bool, Order, Str, Market, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bithumb extends bithumbRest {
    describe(): any;
    pong(client: Client, message: any): Promise<void>;
    handlePing(client: Client, message: any): void;
    handlePong(client: Client, message: any): void;
    /**
     * @method
     * @name bithumb#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EB%B9%97%EC%8D%B8-%EA%B1%B0%EB%9E%98%EC%86%8C-%EC%A0%95%EB%B3%B4-%EC%88%98%EC%8B%A0
     * @see https://apidocs.bithumb.com/reference/%ED%98%84%EC%9E%AC%EA%B0%80-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tickTypes] generation 1 only, the tick type to subscribe to, '24H' by default (30M, 1H, 12H, 24H, MID)
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {object} a [ticker structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name bithumb#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EB%B9%97%EC%8D%B8-%EA%B1%B0%EB%9E%98%EC%86%8C-%EC%A0%95%EB%B3%B4-%EC%88%98%EC%8B%A0
     * @see https://apidocs.bithumb.com/reference/%ED%98%84%EC%9E%AC%EA%B0%80-ticker
     * @param {string[]} symbols unified symbols of the markets to fetch tickers for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tickTypes] generation 1 only, the tick type to subscribe to, '24H' by default (30M, 1H, 12H, 24H, MID)
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure} indexed by market symbols
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleTicker(client: Client, message: any): void;
    parseWsTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name bithumb#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EB%B9%97%EC%8D%B8-%EA%B1%B0%EB%9E%98%EC%86%8C-%EC%A0%95%EB%B3%B4-%EC%88%98%EC%8B%A0
     * @see https://apidocs.bithumb.com/reference/%ED%98%B8%EA%B0%80-orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    handleDelta(orderbook: any, delta: any): void;
    handleDeltas(orderbook: any, deltas: any): void;
    /**
     * @method
     * @name bithumb#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EB%B9%97%EC%8D%B8-%EA%B1%B0%EB%9E%98%EC%86%8C-%EC%A0%95%EB%B3%B4-%EC%88%98%EC%8B%A0
     * @see https://apidocs.bithumb.com/reference/%EC%B2%B4%EA%B2%B0-trade
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {object[]} a list of [trade structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: any, message: any): void;
    parseWsTrade(trade: any, market?: Market): Trade;
    handleErrorMessage(client: Client, message: any): Bool;
    /**
     * @method
     * @name bithumb#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://apidocs.bithumb.com/v2.1.5/reference/%EB%82%B4-%EC%9E%90%EC%82%B0-myasset
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    /**
     * @ignore
     * @method
     * @name bithumb#buildGen2SubscriptionRequest
     * @description builds the SUBSCRIBE frame for the generation 2 private socket - the venue replaces
     * the socket's whole subscription list with every SUBSCRIBE frame, so the frame always carries the
     * union of everything subscribed so far, otherwise a second stream (e.g. watchOrders after
     * watchBalance) would silently cancel the first one
     * @param {string} subscriptionType the venue subscription type ('myAsset' / 'myOrder')
     * @param {object} subscription the subscription entry for that type
     * @returns {object[]} the SUBSCRIBE frame to send
     */
    buildGen2SubscriptionRequest(subscriptionType: string, subscription: Dict): any[];
    authenticate(params?: {}): Promise<import("../base/ws/WsClient.js").default>;
    /**
     * @method
     * @name bithumb#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://apidocs.bithumb.com/v2.1.5/reference/%EB%82%B4-%EC%A3%BC%EB%AC%B8-%EB%B0%8F-%EC%B2%B4%EA%B2%B0-myorder
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.codes] market codes to filter orders
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrders(client: Client, message: any): void;
    parseWsOrder(order: any, market?: Market): Order;
    handleMessage(client: Client, message: any): void;
}
