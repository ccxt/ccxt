import coinbaseRest from '../coinbase.js';
import { Strings, Tickers, Ticker, Int, Trade, OrderBook, Order, Str, Dict } from '../base/types.js';
export default class coinbase extends coinbaseRest {
    describe(): any;
    /**
     * @ignore
     * @method
     * @description subscribes to a websocket channel
     * @see https://docs.cloud.coinbase.com/advanced-trade-api/docs/ws-overview#subscribe
     * @param {string} name the name of the channel
     * @param {boolean} isPrivate whether the channel is private or not
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} subscription to a websocket channel
     */
    subscribe(name: string, isPrivate: boolean, symbol?: any, params?: {}): Promise<any>;
    /**
     * @ignore
     * @method
     * @description subscribes to a websocket channel
     * @see https://docs.cloud.coinbase.com/advanced-trade-api/docs/ws-overview#subscribe
     * @param {string} name the name of the channel
     * @param {boolean} isPrivate whether the channel is private or not
     * @param {string[]} [symbols] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} subscription to a websocket channel
     */
    subscribeMultiple(name: string, isPrivate: boolean, symbols?: Strings, params?: {}): Promise<any>;
    createWSAuth(name: string, productIds: string[]): Dict;
    /**
     * @method
     * @name coinbase#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.cloud.coinbase.com/advanced-trade-api/docs/ws-channels#ticker-channel
     * @param {string} [symbol] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name coinbase#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.cloud.coinbase.com/advanced-trade-api/docs/ws-channels#ticker-batch-channel
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleTickers(client: any, message: any): void;
    parseWsTicker(ticker: any, market?: any): Ticker;
    /**
     * @method
     * @name coinbase#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.cloud.coinbase.com/advanced-trade-api/docs/ws-channels#market-trades-channel
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name coinbase#watchTradesForSymbols
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.cloud.coinbase.com/advanced-trade-api/docs/ws-channels#market-trades-channel
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name coinbase#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.cloud.coinbase.com/advanced-trade-api/docs/ws-channels#user-channel
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinbase#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.cloud.coinbase.com/advanced-trade-api/docs/ws-channels#level2-channel
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name coinbase#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.cloud.coinbase.com/advanced-trade-api/docs/ws-channels#level2-channel
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    handleTrade(client: any, message: any): void;
    handleOrder(client: any, message: any): void;
    parseWsOrder(order: any, market?: any): Order;
    handleOrderBookHelper(orderbook: any, updates: any): void;
    handleOrderBook(client: any, message: any): void;
    tryResolveUsdc(client: any, messageHash: any, result: any): void;
    handleSubscriptionStatus(client: any, message: any): any;
    handleHeartbeats(client: any, message: any): any;
    handleMessage(client: any, message: any): void;
}
