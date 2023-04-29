import Exchange from './abstract/coinmate.js';
import { Int, OrderSide } from './base/types.js';
export default class coinmate extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<any[]>;
    parseBalance(response: any): import("./base/types.js").Balances;
    fetchBalance(params?: {}): Promise<import("./base/types.js").Balances>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<import("./base/types.js").OrderBook>;
    fetchTicker(symbol: string, params?: {}): Promise<{
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
    fetchTransactions(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
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
    withdraw(code: string, amount: any, address: any, tag?: any, params?: {}): Promise<{
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
    fetchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseTrade(trade: any, market?: any): import("./base/types.js").Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    fetchTradingFee(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: any;
        maker: number;
        taker: number;
        percentage: boolean;
        tierBased: boolean;
    }>;
    fetchOpenOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Order[]>;
    fetchOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Order[]>;
    parseOrderStatus(status: any): string;
    parseOrderType(type: any): string;
    parseOrder(order: any, market?: any): any;
    createOrder(symbol: string, type: any, side: OrderSide, amount: any, price?: any, params?: {}): Promise<any>;
    fetchOrder(id: string, symbol?: string, params?: {}): Promise<any>;
    cancelOrder(id: string, symbol?: string, params?: {}): Promise<{
        info: any;
    }>;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
