import { Market } from '../ccxt.js';
import Exchange from './abstract/p2b.js';
import type { Dict, Int, Num, OHLCV, Order, OrderSide, OrderType, Str, Strings, Ticker, Tickers, int } from './base/types.js';
/**
 * @class p2b
 * @augments Exchange
 */
export default class p2b extends Exchange {
    describe(): any;
    /**
     * @method
     * @name p2b#fetchMarkets
     * @description retrieves data on all markets for bigone
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name p2b#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://futures-docs.poloniex.com/#get-real-time-ticker-of-all-symbols
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name p2b#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: any, market?: Market): Ticker;
    /**
     * @method
     * @name p2b#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#depth-result
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} [params.interval] 0 (default), 0.00000001, 0.0000001, 0.000001, 0.00001, 0.0001, 0.001, 0.01, 0.1, 1
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<import("./base/types.js").OrderBook>;
    /**
     * @method
     * @name p2b#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#history
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] 1-100, default=50
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} params.lastId order id
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseTrade(trade: Dict, market?: Market): import("./base/types.js").Trade;
    /**
     * @method
     * @name p2b#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#kline
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe 1m, 1h, or 1d
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] 1-500, default=50
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.offset] default=0, with this value the last candles are returned
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name p2b#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#all-balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<import("./base/types.js").Balances>;
    parseBalance(response: any): import("./base/types.js").Balances;
    /**
     * @method
     * @name p2b#createOrder
     * @description create a trade order
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#create-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type must be 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} price the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name p2b#cancelOrder
     * @description cancels an open order
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name p2b#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#open-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {int} [params.offset] 0-10000, default=0
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name p2b#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#deals-by-order-id
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] 1-100, default=50
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {int} [params.offset] 0-10000, default=0
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    /**
     * @method
     * @name p2b#fetchMyTrades
     * @description fetch all trades made by the user, only the transaction records in the past 3 month can be queried, the time between since and params["until"] cannot be longer than 24 hours
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#deals-history-by-market
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for, default = params["until"] - 86400000
     * @param {int} [limit] 1-100, default=50
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for, default = current timestamp or since + 86400000
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {int} [params.offset] 0-10000, default=0
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    /**
     * @method
     * @name p2b#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user, the time between since and params["untnil"] cannot be longer than 24 hours
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#orders-history-by-market
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for, default = params["until"] - 86400000
     * @param {int} [limit] 1-100, default=50
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for, default = current timestamp or since + 86400000
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {int} [params.offset] 0-10000, default=0
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrder(order: Dict, market?: Market): Order;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
