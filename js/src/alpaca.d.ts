import { Exchange } from './base/Exchange.js';
export default class alpaca extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<any[]>;
    fetchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Trade[]>;
    fetchOrderBook(symbol: any, limit?: any, params?: {}): Promise<import("./base/ws/OrderBook.js").OrderBook>;
    fetchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<object[]>;
    parseOHLCV(ohlcv: any, market?: any): number[];
    createOrder(symbol: any, type: any, side: any, amount: any, price?: any, params?: {}): Promise<any>;
    cancelOrder(id: any, symbol?: any, params?: {}): Promise<any>;
    fetchOrder(id: any, symbol?: any, params?: {}): Promise<any>;
    fetchOpenOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
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
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): void;
}
