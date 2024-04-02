import { Market } from '../ccxt.js';
import Exchange from './abstract/tradeogre.js';
import type { Int, Num, Order, OrderSide, OrderType, Str, Ticker, IndexType } from './base/types.js';
/**
 * @class tradeogre
 * @augments Exchange
 */
export default class tradeogre extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<import("./base/types.js").OrderBook>;
    parseBidsAsks(bidasks: any, priceKey?: IndexType, amountKey?: IndexType, countOrIdKey?: IndexType): any[];
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseTrade(trade: any, market?: Market): import("./base/types.js").Trade;
    fetchBalance(params?: {}): Promise<import("./base/types.js").Balances>;
    parseBalance(response: any): import("./base/types.js").Balances;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    parseOrder(order: any, market?: Market): Order;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
