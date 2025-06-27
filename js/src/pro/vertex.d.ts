import vertexRest from '../vertex.js';
import type { Int, Str, Strings, OrderBook, Order, Trade, Ticker, Market, Position } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class vertex extends vertexRest {
    describe(): any;
    requestId(url: any): any;
    watchPublic(messageHash: any, message: any): Promise<any>;
    /**
     * @method
     * @name vertex#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://docs.vertexprotocol.com/developer-resources/api/subscriptions/streams
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrade(client: Client, message: any): void;
    /**
     * @method
     * @name vertex#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://docs.vertexprotocol.com/developer-resources/api/subscriptions/streams
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleMyTrades(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: any): Trade;
    /**
     * @method
     * @name vertex#watchTicker
     * @see https://docs.vertexprotocol.com/developer-resources/api/subscriptions/streams
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseWsTicker(ticker: any, market?: any): Ticker;
    handleTicker(client: Client, message: any): any;
    /**
     * @method
     * @name vertex#watchOrderBook
     * @see https://docs.vertexprotocol.com/developer-resources/api/subscriptions/streams
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBookSubscription(client: Client, message: any, subscription: any): void;
    fetchOrderBookSnapshot(client: any, message: any, subscription: any): Promise<void>;
    handleOrderBook(client: Client, message: any): void;
    handleOrderBookMessage(client: Client, message: any, orderbook: any): any;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleSubscriptionStatus(client: Client, message: any): any;
    /**
     * @method
     * @name vertex#watchPositions
     * @see https://docs.vertexprotocol.com/developer-resources/api/subscriptions/streams
     * @description watch all open positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param since
     * @param limit
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    setPositionsCache(client: Client, symbols?: Strings, params?: {}): void;
    loadPositionsSnapshot(client: any, messageHash: any, symbols: any, params: any): Promise<void>;
    handlePositions(client: any, message: any): void;
    parseWsPosition(position: any, market?: any): Position;
    handleAuth(client: Client, message: any): void;
    buildWsAuthenticationSig(message: any, chainId: any, verifyingContractAddress: any): string;
    authenticate(params?: {}): Promise<any>;
    watchPrivate(messageHash: any, message: any, params?: {}): Promise<any>;
    /**
     * @method
     * @name vertex#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.vertexprotocol.com/developer-resources/api/subscriptions/streams
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseWsOrderStatus(status: any): any;
    parseWsOrder(order: any, market?: Market): Order;
    handleOrderUpdate(client: Client, message: any): void;
    handleErrorMessage(client: Client, message: any): boolean;
    handleMessage(client: Client, message: any): void;
}
