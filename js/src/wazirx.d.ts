import { Exchange } from './base/Exchange.js';
export default class wazirx extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<any[]>;
    fetchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<object[]>;
    parseOHLCV(ohlcv: any, market?: any): number[];
    fetchOrderBook(symbol: any, limit?: any, params?: {}): Promise<import("./base/ws/OrderBook.js").OrderBook>;
    fetchTicker(symbol: any, params?: {}): Promise<import("./base/types.js").Ticker>;
    fetchTickers(symbols?: any, params?: {}): Promise<{}>;
    fetchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseTrade(trade: any, market?: any): import("./base/types.js").Trade;
    fetchStatus(params?: {}): Promise<{
        status: string;
        updated: any;
        eta: any;
        url: any;
        info: any;
    }>;
    fetchTime(params?: {}): Promise<number>;
    parseTicker(ticker: any, market?: any): import("./base/types.js").Ticker;
    parseBalance(response: any): object;
    fetchBalance(params?: {}): Promise<object>;
    fetchOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    fetchOpenOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    cancelAllOrders(symbol?: any, params?: {}): Promise<any>;
    cancelOrder(id: any, symbol?: any, params?: {}): Promise<any>;
    createOrder(symbol: any, type: any, side: any, amount: any, price?: any, params?: {}): Promise<any>;
    parseOrder(order: any, market?: any): any;
    parseOrderStatus(status: any): string;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): void;
}
