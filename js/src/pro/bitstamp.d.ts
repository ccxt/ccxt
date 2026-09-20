import bitstampRest from '../bitstamp.js';
import type { Int, Str, OrderBook, Order, Trade, Market, Bool, FundingRate } from '../base/types.js';
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
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name bitstamp#unWatchOrderBook
     * @description unsubscribe from the order book channel
     * @see https://www.bitstamp.net/websocket/v2/
     * @param {string} symbol unified symbol of the market to unwatch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
    /**
     * @ignore
     * @method
     * @description sends an unsubscribe request for a channel and cleans the related caches on confirmation
     * @param {string} channel the raw channel name to unsubscribe from
     * @param {string} subHash the subscription hash whose future and cache entry should be cleaned
     * @param {string} topic the cache topic, one of 'trades', 'orderbook', 'orders' or 'myTrades'
     * @param {string[]} symbols the symbols to clean from the cache
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    unWatchChannel(channel: string, subHash: string, topic: string, symbols: string[], params?: {}): Promise<any>;
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
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bitstamp#unWatchTrades
     * @description unsubscribe from the trades channel
     * @see https://www.bitstamp.net/websocket/v2/
     * @param {string} symbol unified symbol of the market to unwatch the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    unWatchTrades(symbol: string, params?: {}): Promise<any>;
    parseWsTrade(trade: any, market?: Market): Trade;
    handleTrade(client: Client, message: any): void;
    /**
     * @method
     * @name bitstamp#watchFundingRate
     * @description watch the current funding rate
     * @see https://www.bitstamp.net/websocket/v2/
     * @param {string} symbol unified market symbol of a swap market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    watchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    handleFundingRate(client: Client, message: any): void;
    /**
     * @method
     * @name bitstamp#watchOrders
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitstamp#unWatchOrders
     * @description unsubscribe from the orders channel
     * @see https://www.bitstamp.net/websocket/v2/
     * @param {string} symbol unified market symbol of the market the orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    unWatchOrders(symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name bitstamp#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://www.bitstamp.net/websocket/v2/
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bitstamp#unWatchMyTrades
     * @description unsubscribe from the myTrades channel
     * @see https://www.bitstamp.net/websocket/v2/
     * @param {string} symbol unified market symbol of the market the trades were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    unWatchMyTrades(symbol?: Str, params?: {}): Promise<any>;
    handleMyTrades(client: Client, message: any): void;
    parseWsMyTrade(trade: any, market?: Market): Trade;
    handleOrders(client: Client, message: any): void;
    parseWsOrder(order: any, market?: Market): Order;
    handleOrderBookSubscription(client: Client, message: any): void;
    handleSubscriptionStatus(client: Client, message: any): void;
    handleUnsubscriptionStatus(client: Client, message: any): void;
    /**
     * @ignore
     * @method
     * @description refills a fresh ArrayCacheBySymbolById with the entries of the old cache except the given symbols, so unsubscribing one market keeps the cached entries of the others
     * @param {object} newCache an empty ArrayCacheBySymbolById to fill
     * @param {object} cache the old ArrayCacheBySymbolById to prune
     * @param {string[]} symbols the symbols to remove from the cache
     * @returns {object} the new cache holding the remaining entries
     */
    pruneCachedBySymbols(newCache: any, cache: any, symbols: string[]): any;
    handleSubject(client: Client, message: any): void;
    handleErrorMessage(client: Client, message: any): Bool;
    handleMessage(client: Client, message: any): void;
    authenticate(params?: {}): Promise<void>;
    subscribePrivate(subscription: any, messageHash: any, params?: {}): Promise<any>;
}
