import poloniexfuturesRest from '../poloniexfutures.js';
import type { Int, Str, OrderBook, Order, Trade, Ticker, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class poloniexfutures extends poloniexfuturesRest {
    describe(): any;
    negotiate(privateChannel: any, params?: {}): Promise<any>;
    negotiateHelper(privateChannel: any, params?: {}): Promise<string>;
    requestId(): any;
    /**
     * @ignore
     * @method
     * @description Connects to a websocket channel
     * @param {string} name name of the channel and suscriptionHash
     * @param {bool} isPrivate true for the authenticated url, false for the public url
     * @param {string} symbol is required for all public channels, not required for private channels (except position)
     * @param {object} subscription subscription parameters
     * @param {object} [params] extra parameters specific to the poloniex api
     * @returns {object} data from the websocket stream
     */
    subscribe(name: string, isPrivate: boolean, symbol?: Str, subscription?: any, params?: {}): Promise<any>;
    onClose(client: any, error: any): void;
    stream(url: any, subscriptionHash: any): Promise<string>;
    handleOrderBookSubscription(client: Client, message: any, subscription: any): void;
    handleSubscriptionStatus(client: Client, message: any): any;
    handleNewStream(client: Client, message: any, subscription: any): void;
    /**
     * @method
     * @name poloniexfutures#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api-docs.poloniex.com/futures/websocket/public#get-real-time-symbol-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name poloniexfutures#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api-docs.poloniex.com/futures/websocket/public#full-matching-engine-datalevel-3
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name poloniexfutures#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api-docs.poloniex.com/futures/websocket/public#level-2-market-data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] not used by poloniexfutures watchOrderBook
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] the method to use. Defaults to /contractMarket/level2 can also be /contractMarket/level3v2 to receive the raw stream of orders
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name poloniexfutures#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://api-docs.poloniex.com/futures/websocket/user-messages#private-messages
     * @param {string} symbol filter by unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] the method to use will default to /contractMarket/tradeOrders. Set to /contractMarket/advancedOrders to watch stop orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name poloniexfutures#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api-docs.poloniex.com/futures/websocket/user-messages#account-balance-events
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleTrade(client: Client, message: any): any;
    parseWsTrade(trade: any, market?: any): Trade;
    parseWsOrderTrade(trade: any, market?: any): Trade;
    handleOrder(client: Client, message: any): any;
    parseOrderStatus(status: string, type: string): string;
    parseWsOrder(order: any, market?: any): Order;
    handleTicker(client: Client, message: any): any;
    handleL3OrderBook(client: Client, message: any): void;
    handleLevel2(client: Client, message: any): void;
    handleL2OrderBook(client: Client, message: any): void;
    handeL2Snapshot(client: Client, message: any): void;
    getSymbolFromTopic(topic: string): string;
    getCacheIndex(orderbook: any, cache: any): any;
    handleDelta(orderbook: any, delta: any): void;
    handleBalance(client: Client, message: any): any;
    parseWsBalance(response: any): Balances;
    handleSystemStatus(client: Client, message: any): any;
    handleSubject(client: Client, message: any): void;
    ping(client: Client): {
        id: any;
        type: string;
    };
    handlePong(client: Client, message: any): any;
    handleErrorMessage(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
    handleAuthenticate(client: any, message: any): any;
}
