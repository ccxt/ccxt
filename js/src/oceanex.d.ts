import { Exchange } from './base/Exchange.js';
export default class oceanex extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<any[]>;
    fetchTicker(symbol: any, params?: {}): Promise<import("./base/types.js").Ticker>;
    fetchTickers(symbols?: any, params?: {}): Promise<any>;
    parseTicker(data: any, market?: any): import("./base/types.js").Ticker;
    fetchOrderBook(symbol: any, limit?: any, params?: {}): Promise<import("./base/ws/OrderBook.js").OrderBook>;
    fetchOrderBooks(symbols?: any, limit?: any, params?: {}): Promise<{}>;
    fetchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseTrade(trade: any, market?: any): import("./base/types.js").Trade;
    fetchTime(params?: {}): Promise<number>;
    fetchTradingFees(params?: {}): Promise<{}>;
    fetchKey(params?: {}): Promise<any>;
    parseBalance(response: any): object;
    fetchBalance(params?: {}): Promise<object>;
    createOrder(symbol: any, type: any, side: any, amount: any, price?: any, params?: {}): Promise<any>;
    fetchOrder(id: any, symbol?: any, params?: {}): Promise<any>;
    fetchOpenOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<any[]>;
    fetchClosedOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<any[]>;
    fetchOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<any[]>;
    parseOHLCV(ohlcv: any, market?: any): number[];
    fetchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<object[]>;
    parseOrder(order: any, market?: any): any;
    parseOrderStatus(status: any): string;
    createOrders(symbol: any, orders: any, params?: {}): Promise<object[]>;
    cancelOrder(id: any, symbol?: any, params?: {}): Promise<any>;
    cancelOrders(ids: any, symbol?: any, params?: {}): Promise<object[]>;
    cancelAllOrders(symbol?: any, params?: {}): Promise<object[]>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): void;
}
