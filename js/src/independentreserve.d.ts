import { Exchange } from './base/Exchange.js';
export default class independentreserve extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<any[]>;
    parseBalance(response: any): object;
    fetchBalance(params?: {}): Promise<object>;
    fetchOrderBook(symbol: any, limit?: any, params?: {}): Promise<import("./base/ws/OrderBook.js").OrderBook>;
    parseTicker(ticker: any, market?: any): import("./base/types.js").Ticker;
    fetchTicker(symbol: any, params?: {}): Promise<import("./base/types.js").Ticker>;
    parseOrder(order: any, market?: any): any;
    parseOrderStatus(status: any): string;
    fetchOrder(id: any, symbol?: any, params?: {}): Promise<any>;
    fetchOpenOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    fetchClosedOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    fetchMyTrades(symbol?: any, since?: any, limit?: number, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseTrade(trade: any, market?: any): import("./base/types.js").Trade;
    fetchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Trade[]>;
    fetchTradingFees(params?: {}): Promise<{}>;
    createOrder(symbol: any, type: any, side: any, amount: any, price?: any, params?: {}): Promise<{
        info: any;
        id: any;
    }>;
    cancelOrder(id: any, symbol?: any, params?: {}): Promise<any>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
