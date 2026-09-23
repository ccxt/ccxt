import Exchange from './abstract/nobitex.js';
import type { Dict, Int, Market, Num, NullableDict, Order, OrderBook, OrderSide, OrderType, Str, Ticker, int } from './base/types.js';
/**
 * @class nobitex
 * @augments Exchange
 */
export default class nobitex extends Exchange {
    describe(): any;
    /**
     * @method
     * @name nobitex#fetchMarkets
     * @description retrieves data on all markets for nobitex
     * @see https://apidocs.nobitex.ir
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name nobitex#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://apidocs.nobitex.ir
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name nobitex#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://apidocs.nobitex.ir
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name nobitex#createOrder
     * @description create a trade order
     * @see https://apidocs.nobitex.ir/spot_trade/api-%D9%85%D8%B9%D8%A7%D9%85%D9%84%D8%A7%D8%AA-%D8%A7%D8%B3%D9%BE%D8%A7%D8%AA-%D9%86%D9%88%D8%A8%DB%8C%D8%AA%DA%A9%D8%B3
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the base currency you want to trade
     * @param {float} [price] required for limit orders, optional for market orders where it caps the execution price
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] turns the order into stop_limit or stop_market
     * @param {string} [params.clientOrderId] up to 32 chars of [A-Za-z0-9-], unique among open orders
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    parseOrder(order: Dict, market?: Market): Order;
    sign(path: any, api?: any, method?: string, params?: {}, headers?: NullableDict, body?: Str): {
        url: string;
        method: string;
        body: Str;
        headers: Dict;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): undefined;
}
