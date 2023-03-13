import { Exchange } from './base/Exchange.js';
export default class btcturk extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<any[]>;
    parseBalance(response: any): object;
    fetchBalance(params?: {}): Promise<object>;
    fetchOrderBook(symbol: any, limit?: any, params?: {}): Promise<import("./base/ws/OrderBook.js").OrderBook>;
    parseTicker(ticker: any, market?: any): import("./base/types.js").Ticker;
    fetchTickers(symbols?: any, params?: {}): Promise<any>;
    fetchTicker(symbol: any, params?: {}): Promise<any>;
    parseTrade(trade: any, market?: any): import("./base/types.js").Trade;
    fetchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseOHLCV(ohlcv: any, market?: any): number[];
    fetchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<object[]>;
    parseOHLCVs(ohlcvs: any, market?: any, timeframe?: string, since?: any, limit?: any): object[];
    createOrder(symbol: any, type: any, side: any, amount: any, price?: any, params?: {}): Promise<any>;
    cancelOrder(id: any, symbol?: any, params?: {}): Promise<any>;
    fetchOpenOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    fetchOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    parseOrderStatus(status: any): string;
    parseOrder(order: any, market: any): any;
    fetchMyTrades(symbol?: any, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Trade[]>;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): void;
}
