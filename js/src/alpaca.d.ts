import Exchange from './abstract/alpaca.js';
import { Int, OrderSide } from './base/types.js';
export default class alpaca extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<any[]>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<import("./base/types.js").OrderBook>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: any): number[];
    createOrder(symbol: string, type: any, side: OrderSide, amount: any, price?: any, params?: {}): Promise<any>;
    cancelOrder(id: string, symbol?: string, params?: {}): Promise<any>;
    fetchOrder(id: string, symbol?: string, params?: {}): Promise<any>;
    fetchOpenOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Order[]>;
    parseOrder(order: any, market?: any): any;
    parseOrderStatus(status: any): string;
    parseTimeInForce(timeInForce: any): string;
    parseTrade(trade: any, market?: any): import("./base/types.js").Trade;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
