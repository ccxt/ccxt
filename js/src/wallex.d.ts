import Exchange from './abstract/wallex.js';
import type { Balances, Dict, Market, Num, NullableDict, Order, OrderSide, OrderType, Str, int } from './base/types.js';
/**
 * @class wallex
 * @augments Exchange
 */
export default class wallex extends Exchange {
    describe(): any;
    /**
     * @method
     * @name wallex#fetchMarkets
     * @description retrieves data on all markets for wallex
     * @see https://developers.wallex.ir
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name wallex#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://developers.wallex.ir
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name wallex#createOrder
     * @description create a trade order
     * @see https://developers.wallex.ir/docs/spot-create-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the base currency you want to trade
     * @param {float} [price] the price at which the order is to be fulfilled, wallex marks it required for every type
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] turns the order into STOP_LIMIT or STOP_MARKET
     * @param {string} [params.clientOrderId] [A-Z0-9_], must be unique
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
