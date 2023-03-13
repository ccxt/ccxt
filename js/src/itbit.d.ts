import { Exchange } from './base/Exchange.js';
export default class itbit extends Exchange {
    describe(): any;
    fetchOrderBook(symbol: any, limit?: any, params?: {}): Promise<import("./base/ws/OrderBook.js").OrderBook>;
    parseTicker(ticker: any, market?: any): import("./base/types.js").Ticker;
    fetchTicker(symbol: any, params?: {}): Promise<import("./base/types.js").Ticker>;
    parseTrade(trade: any, market?: any): any;
    fetchTransactions(code?: any, since?: any, limit?: any, params?: {}): Promise<any[]>;
    parseTransferStatus(status: any): string;
    fetchMyTrades(symbol?: any, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Trade[]>;
    fetchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseBalance(response: any): object;
    fetchBalance(params?: {}): Promise<object>;
    fetchWallets(params?: {}): Promise<any>;
    fetchWallet(walletId: any, params?: {}): Promise<any>;
    fetchOpenOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    fetchClosedOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    fetchOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    parseOrderStatus(status: any): string;
    parseOrder(order: any, market?: any): any;
    nonce(): number;
    createOrder(symbol: any, type: any, side: any, amount: any, price?: any, params?: {}): Promise<{
        info: any;
        id: any;
    }>;
    fetchOrder(id: any, symbol?: any, params?: {}): Promise<any>;
    cancelOrder(id: any, symbol?: any, params?: {}): Promise<any>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): void;
}
