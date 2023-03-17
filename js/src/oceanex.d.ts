import { Exchange } from './base/Exchange.js';
export default class oceanex extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<any[]>;
    fetchTicker(symbol: any, params?: {}): Promise<import("./base/types.js").Ticker>;
    fetchTickers(symbols?: string[], params?: {}): Promise<any>;
    parseTicker(data: any, market?: any): import("./base/types.js").Ticker;
    fetchOrderBook(symbol: any, limit?: any, params?: {}): Promise<import("./base/types.js").OrderBook>;
    fetchOrderBooks(symbols?: string[], limit?: any, params?: {}): Promise<{}>;
    fetchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseTrade(trade: any, market?: any): import("./base/types.js").Trade;
    fetchTime(params?: {}): Promise<number>;
    fetchTradingFees(params?: {}): Promise<{}>;
    fetchKey(params?: {}): Promise<any>;
    parseBalance(response: any): import("./base/types.js").Balances;
    fetchBalance(params?: {}): Promise<import("./base/types.js").Balances>;
    createOrder(symbol: any, type: any, side: any, amount: any, price?: any, params?: {}): Promise<any>;
    fetchOrder(id: any, symbol?: string, params?: {}): Promise<any>;
    fetchOpenOrders(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any[]>;
    fetchClosedOrders(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any[]>;
    fetchOrders(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any[]>;
    parseOHLCV(ohlcv: any, market?: any): number[];
    fetchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").OHLCV[]>;
    parseOrder(order: any, market?: any): any;
    parseOrderStatus(status: any): string;
    createOrders(symbol: any, orders: any, params?: {}): Promise<import("./base/types.js").Order[]>;
    cancelOrder(id: any, symbol?: string, params?: {}): Promise<any>;
    cancelOrders(ids: any, symbol?: string, params?: {}): Promise<import("./base/types.js").Order[]>;
    cancelAllOrders(symbol?: string, params?: {}): Promise<import("./base/types.js").Order[]>;
    sign(path: any, api?: any, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): void;
}
