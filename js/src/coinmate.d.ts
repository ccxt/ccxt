import { Exchange } from './base/Exchange.js';
export default class coinmate extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<any[]>;
    parseBalance(response: any): object;
    fetchBalance(params?: {}): Promise<object>;
    fetchOrderBook(symbol: any, limit?: any, params?: {}): Promise<import("./base/ws/OrderBook.js").OrderBook>;
    fetchTicker(symbol: any, params?: {}): Promise<{
        symbol: any;
        timestamp: number;
        datetime: string;
        high: number;
        low: number;
        bid: number;
        bidVolume: any;
        ask: number;
        vwap: any;
        askVolume: any;
        open: any;
        close: number;
        last: number;
        previousClose: any;
        change: any;
        percentage: any;
        average: any;
        baseVolume: number;
        quoteVolume: any;
        info: any;
    }>;
    fetchTransactions(code?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    parseTransactionStatus(status: any): string;
    parseTransaction(transaction: any, currency?: any): {
        id: string;
        timestamp: number;
        datetime: string;
        currency: any;
        amount: number;
        type: string;
        txid: string;
        network: string;
        address: string;
        addressTo: any;
        addressFrom: any;
        tag: string;
        tagTo: any;
        tagFrom: any;
        status: string;
        fee: {
            cost: number;
            currency: any;
        };
        info: any;
    };
    withdraw(code: any, amount: any, address: any, tag?: any, params?: {}): Promise<{
        id: string;
        timestamp: number;
        datetime: string;
        currency: any;
        amount: number;
        type: string;
        txid: string;
        network: string;
        address: string;
        addressTo: any;
        addressFrom: any;
        tag: string;
        tagTo: any;
        tagFrom: any;
        status: string;
        fee: {
            cost: number;
            currency: any;
        };
        info: any;
    }>;
    fetchMyTrades(symbol?: any, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseTrade(trade: any, market?: any): import("./base/types.js").Trade;
    fetchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Trade[]>;
    fetchTradingFee(symbol: any, params?: {}): Promise<{
        info: any;
        symbol: any;
        maker: number;
        taker: number;
        percentage: boolean;
        tierBased: boolean;
    }>;
    fetchOpenOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    fetchOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    parseOrderStatus(status: any): string;
    parseOrderType(type: any): string;
    parseOrder(order: any, market?: any): any;
    createOrder(symbol: any, type: any, side: any, amount: any, price?: any, params?: {}): Promise<{
        info: any;
        id: string;
    }>;
    fetchOrder(id: any, symbol?: any, params?: {}): Promise<any>;
    cancelOrder(id: any, symbol?: any, params?: {}): Promise<{
        info: any;
    }>;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): void;
}
