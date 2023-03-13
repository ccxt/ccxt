import { Exchange } from './base/Exchange.js';
export default class coinspot extends Exchange {
    describe(): any;
    parseBalance(response: any): object;
    fetchBalance(params?: {}): Promise<object>;
    fetchOrderBook(symbol: any, limit?: any, params?: {}): Promise<import("./base/ws/OrderBook.js").OrderBook>;
    parseTicker(ticker: any, market?: any): import("./base/types.js").Ticker;
    fetchTicker(symbol: any, params?: {}): Promise<import("./base/types.js").Ticker>;
    fetchTickers(symbols?: any, params?: {}): Promise<any>;
    fetchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseTrade(trade: any, market?: any): import("./base/types.js").Trade;
    createOrder(symbol: any, type: any, side: any, amount: any, price?: any, params?: {}): Promise<any>;
    cancelOrder(id: any, symbol?: any, params?: {}): Promise<any>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
