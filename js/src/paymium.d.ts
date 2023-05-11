import Exchange from './abstract/paymium.js';
import { Int, OrderSide } from './base/types.js';
export default class paymium extends Exchange {
    describe(): any;
    parseBalance(response: any): import("./base/types.js").Balances;
    fetchBalance(params?: {}): Promise<import("./base/types.js").Balances>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<import("./base/types.js").OrderBook>;
    parseTicker(ticker: any, market?: any): import("./base/types.js").Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<import("./base/types.js").Ticker>;
    parseTrade(trade: any, market?: any): import("./base/types.js").Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    createDepositAddress(code: string, params?: {}): Promise<{
        info: any;
        currency: any;
        address: string;
        tag: any;
        network: any;
    }>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        info: any;
        currency: any;
        address: string;
        tag: any;
        network: any;
    }>;
    fetchDepositAddresses(codes?: any, params?: {}): Promise<{}>;
    parseDepositAddress(depositAddress: any, currency?: any): {
        info: any;
        currency: any;
        address: string;
        tag: any;
        network: any;
    };
    createOrder(symbol: string, type: any, side: OrderSide, amount: any, price?: any, params?: {}): Promise<any>;
    cancelOrder(id: string, symbol?: string, params?: {}): Promise<any>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<{
        info: any;
        id: string;
        timestamp: number;
        datetime: string;
        currency: any;
        amount: number;
        fromAccount: any;
        toAccount: string;
        status: string;
    }>;
    parseTransfer(transfer: any, currency?: any): {
        info: any;
        id: string;
        timestamp: number;
        datetime: string;
        currency: any;
        amount: number;
        fromAccount: any;
        toAccount: string;
        status: string;
    };
    parseTransferStatus(status: any): string;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
