import { Exchange } from './base/Exchange.js';
export default class bitforex extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<any[]>;
    parseTrade(trade: any, market?: any): import("./base/types.js").Trade;
    fetchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseBalance(response: any): object;
    fetchBalance(params?: {}): Promise<object>;
    parseTicker(ticker: any, market?: any): import("./base/types.js").Ticker;
    fetchTicker(symbol: any, params?: {}): Promise<import("./base/types.js").Ticker>;
    parseOHLCV(ohlcv: any, market?: any): number[];
    fetchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<object[]>;
    fetchOrderBook(symbol: any, limit?: any, params?: {}): Promise<import("./base/ws/OrderBook.js").OrderBook>;
    parseOrderStatus(status: any): any;
    parseSide(sideId: any): "buy" | "sell";
    parseOrder(order: any, market?: any): any;
    fetchOrder(id: any, symbol?: any, params?: {}): Promise<any>;
    fetchOpenOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    fetchClosedOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    createOrder(symbol: any, type: any, side: any, amount: any, price?: any, params?: {}): Promise<{
        info: any;
        id: string;
    }>;
    cancelOrder(id: any, symbol?: any, params?: {}): Promise<{
        info: any;
        success: any;
    }>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): void;
}
