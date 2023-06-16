import Exchange from './abstract/oceanex.js';
import { Int, OrderSide, OrderType } from './base/types.js';
export default class oceanex extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<any[]>;
    fetchTicker(symbol: string, params?: {}): Promise<import("./base/types.js").Ticker>;
    fetchTickers(symbols?: string[], params?: {}): Promise<any>;
    parseTicker(data: any, market?: any): import("./base/types.js").Ticker;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<import("./base/types.js").OrderBook>;
    fetchOrderBooks(symbols?: string[], limit?: Int, params?: {}): Promise<{}>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseTrade(trade: any, market?: any): import("./base/types.js").Trade;
    fetchTime(params?: {}): Promise<number>;
    fetchTradingFees(params?: {}): Promise<{}>;
    fetchKey(params?: {}): Promise<any>;
    parseBalance(response: any): import("./base/types.js").Balances;
    fetchBalance(params?: {}): Promise<import("./base/types.js").Balances>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<import("./base/types.js").Order>;
    fetchOrder(id: string, symbol?: string, params?: {}): Promise<import("./base/types.js").Order>;
    fetchOpenOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any[]>;
    fetchClosedOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any[]>;
    fetchOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any[]>;
    parseOHLCV(ohlcv: any, market?: any): number[];
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").OHLCV[]>;
    parseOrder(order: any, market?: any): import("./base/types.js").Order;
    parseOrderStatus(status: any): string;
    createOrders(symbol: string, orders: any, params?: {}): Promise<import("./base/types.js").Order[]>;
    cancelOrder(id: string, symbol?: string, params?: {}): Promise<import("./base/types.js").Order>;
    cancelOrders(ids: any, symbol?: string, params?: {}): Promise<import("./base/types.js").Order[]>;
    cancelAllOrders(symbol?: string, params?: {}): Promise<import("./base/types.js").Order[]>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
