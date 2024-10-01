import Exchange from './abstract/alephx.js';
import type { Int, OrderSide, OrderType, Order, Trade, Str, Market, Num, Dict, int } from './base/types.js';
/**
 * @class alephx
 * @augments Exchange
 */
export default class alephx extends Exchange {
    describe(): any;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    orderRequest(method: string, symbol: string, type: string, request: Dict, amount: Num, price?: Num, params?: {}): Dict[];
    parseOrder(order: Dict, market?: Market): Order;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    sign(path: any, api?: any[], method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
