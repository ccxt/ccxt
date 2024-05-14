import Exchange from './abstract/btcbox.js';
import type { Balances, Dict, Int, Market, Num, Order, OrderBook, OrderSide, OrderType, Str, Ticker, Trade } from './base/types.js';
/**
 * @class btcbox
 * @augments Exchange
 */
export default class btcbox extends Exchange {
    describe(): any;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    parseOrderStatus(status: any): string;
    parseOrder(order: any, market?: Market): Order;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrdersByType(type: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
    request(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any, config?: {}): Promise<any>;
}
