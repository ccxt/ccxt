import htxRest from '../htx.js';
import type { Int, Str, Strings, OrderBook, Order, Trade, Ticker, OHLCV, Position, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class htx extends htxRest {
    describe(): any;
    requestId(): any;
    /**
     * @method
     * @name huobi#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=7ec53561-7773-11ed-9966-0242ac110003
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=28c33ab2-77ae-11ed-9966-0242ac110003
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleTicker(client: Client, message: any): any;
    /**
     * @method
     * @name huobi#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=7ec53b69-7773-11ed-9966-0242ac110003
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=28c33c21-77ae-11ed-9966-0242ac110003
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=28c33cfe-77ae-11ed-9966-0242ac110003
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): any;
    /**
     * @method
     * @name huobi#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=7ec53241-7773-11ed-9966-0242ac110003
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=28c3346a-77ae-11ed-9966-0242ac110003
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=28c33563-77ae-11ed-9966-0242ac110003
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: any): void;
    /**
     * @method
     * @name huobi#watchOrderBook
     * @see https://huobiapi.github.io/docs/dm/v1/en/#subscribe-market-depth-data
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#subscribe-incremental-market-depth-data
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-subscribe-incremental-market-depth-data
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBookSnapshot(client: Client, message: any, subscription: any): void;
    watchOrderBookSnapshot(client: any, message: any, subscription: any): Promise<any>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBookMessage(client: Client, message: any): void;
    handleOrderBook(client: Client, message: any): void;
    handleOrderBookSubscription(client: Client, message: any, subscription: any): void;
    /**
     * @method
     * @name huobi#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=7ec53dd5-7773-11ed-9966-0242ac110003
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    getOrderChannelAndMessageHash(type: any, subType: any, market?: any, params?: {}): any[];
    /**
     * @method
     * @name huobi#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=7ec53c8f-7773-11ed-9966-0242ac110003
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrder(client: Client, message: any): void;
    parseWsOrder(order: any, market?: any): Order;
    parseOrderTrade(trade: any, market?: any): Trade;
    /**
     * @method
     * @name huobi#watchPositions
     * @see https://www.huobi.com/en-in/opend/newApiPages/?id=8cb7de1c-77b5-11ed-9966-0242ac110003
     * @see https://www.huobi.com/en-in/opend/newApiPages/?id=8cb7df0f-77b5-11ed-9966-0242ac110003
     * @see https://www.huobi.com/en-in/opend/newApiPages/?id=28c34a7d-77ae-11ed-9966-0242ac110003
     * @see https://www.huobi.com/en-in/opend/newApiPages/?id=5d5156b5-77b6-11ed-9966-0242ac110003
     * @description watch all open positions. Note: huobi has one channel for each marginMode and type
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param since
     * @param limit
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    handlePositions(client: any, message: any): void;
    /**
     * @method
     * @name huobi#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=7ec52e28-7773-11ed-9966-0242ac110003
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=10000084-77b7-11ed-9966-0242ac110003
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=8cb7dcca-77b5-11ed-9966-0242ac110003
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=28c34995-77ae-11ed-9966-0242ac110003
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    handleSubscriptionStatus(client: Client, message: any): void;
    handleSystemStatus(client: Client, message: any): any;
    handleSubject(client: Client, message: any): void;
    pong(client: any, message: any): Promise<void>;
    handlePing(client: Client, message: any): void;
    handleAuthenticate(client: Client, message: any): void;
    handleErrorMessage(client: Client, message: any): any;
    handleMessage(client: Client, message: any): void;
    handleMyTrade(client: Client, message: any, extendParams?: {}): void;
    parseWsTrade(trade: any, market?: any): Trade;
    getUrlByMarketType(type: any, isLinear?: boolean, isPrivate?: boolean, isFeed?: boolean): any;
    subscribePublic(url: any, symbol: any, messageHash: any, method?: any, params?: {}): Promise<any>;
    subscribePrivate(channel: any, messageHash: any, type: any, subtype: any, params?: {}, subscriptionParams?: {}): Promise<any>;
    authenticate(params?: {}): Promise<any>;
}
