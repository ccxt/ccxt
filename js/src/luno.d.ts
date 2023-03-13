import { Exchange } from './base/Exchange.js';
export default class luno extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<any[]>;
    fetchAccounts(params?: {}): Promise<any[]>;
    parseBalance(response: any): object;
    fetchBalance(params?: {}): Promise<object>;
    fetchOrderBook(symbol: any, limit?: any, params?: {}): Promise<import("./base/ws/OrderBook.js").OrderBook>;
    parseOrderStatus(status: any): string;
    parseOrder(order: any, market?: any): any;
    fetchOrder(id: any, symbol?: any, params?: {}): Promise<any>;
    fetchOrdersByState(state?: any, symbol?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    fetchOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    fetchOpenOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    fetchClosedOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    parseTicker(ticker: any, market?: any): import("./base/types.js").Ticker;
    fetchTickers(symbols?: any, params?: {}): Promise<any>;
    fetchTicker(symbol: any, params?: {}): Promise<import("./base/types.js").Ticker>;
    parseTrade(trade: any, market: any): import("./base/types.js").Trade;
    fetchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Trade[]>;
    fetchMyTrades(symbol?: any, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Trade[]>;
    fetchTradingFee(symbol: any, params?: {}): Promise<{
        info: any;
        symbol: any;
        maker: number;
        taker: number;
    }>;
    createOrder(symbol: any, type: any, side: any, amount: any, price?: any, params?: {}): Promise<{
        info: any;
        id: any;
    }>;
    cancelOrder(id: any, symbol?: any, params?: {}): Promise<any>;
    fetchLedgerByEntries(code?: any, entry?: number, limit?: number, params?: {}): Promise<object[]>;
    fetchLedger(code?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    parseLedgerComment(comment: any): {
        type: string;
        referenceId: any;
    };
    parseLedgerEntry(entry: any, currency?: any): {
        id: string;
        direction: any;
        account: string;
        referenceId: any;
        referenceAccount: any;
        type: string;
        currency: any;
        amount: number;
        timestamp: any;
        datetime: string;
        before: string;
        after: string;
        status: any;
        fee: any;
        info: any;
    };
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): void;
}
