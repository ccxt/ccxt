import { Exchange } from './base/Exchange.js';
export default class lbank2 extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<any[]>;
    parseTicker(ticker: any, market?: any): import("./base/types.js").Ticker;
    fetchTicker(symbol: any, params?: {}): Promise<import("./base/types.js").Ticker>;
    fetchTickers(symbols?: string[], params?: {}): Promise<any>;
    fetchOrderBook(symbol: any, limit?: any, params?: {}): Promise<import("./base/types.js").OrderBook>;
    parseTrade(trade: any, market?: any): import("./base/types.js").Trade;
    fetchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseOHLCV(ohlcv: any, market?: any): number[];
    fetchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").OHLCV[]>;
    parseBalance(response: any): import("./base/types.js").Balances;
    fetchBalance(params?: {}): Promise<import("./base/types.js").Balances>;
    parseTradingFee(fee: any, market?: any): {
        info: any;
        symbol: any;
        maker: number;
        taker: number;
    };
    fetchTradingFee(symbol: any, params?: {}): Promise<{}>;
    fetchTradingFees(params?: {}): Promise<{}>;
    createOrder(symbol: any, type: any, side: any, amount: any, price?: any, params?: {}): Promise<any>;
    parseOrderStatus(status: any): string;
    parseOrder(order: any, market?: any): any;
    fetchOrder(id: any, symbol?: string, params?: {}): Promise<any>;
    fetchOrderSupplement(id: any, symbol?: string, params?: {}): Promise<any>;
    fetchOrderDefault(id: any, symbol?: string, params?: {}): Promise<any>;
    fetchMyTrades(symbol?: string, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Trade[]>;
    fetchOrders(symbol?: string, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Order[]>;
    fetchOpenOrders(symbol?: string, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Order[]>;
    cancelOrder(id: any, symbol?: string, params?: {}): Promise<any>;
    cancelAllOrders(symbol?: string, params?: {}): Promise<any>;
    getNetworkCodeForCurrency(currencyCode: any, params: any): string;
    fetchDepositAddress(code: any, params?: {}): Promise<any>;
    fetchDepositAddressDefault(code: any, params?: {}): Promise<{
        currency: any;
        address: string;
        tag: string;
        network: string;
        info: any;
    }>;
    fetchDepositAddressSupplement(code: any, params?: {}): Promise<{
        currency: any;
        address: string;
        tag: string;
        network: string;
        info: any;
    }>;
    withdraw(code: any, amount: any, address: any, tag?: any, params?: {}): Promise<{
        info: any;
        id: string;
    }>;
    parseTransactionStatus(status: any, type: any): string;
    parseTransaction(transaction: any, currency?: any): {
        info: any;
        id: string;
        txid: string;
        timestamp: number;
        datetime: string;
        network: string;
        address: string;
        addressTo: any;
        addressFrom: any;
        tag: any;
        tagTo: any;
        tagFrom: any;
        type: any;
        amount: number;
        currency: any;
        status: string;
        updated: any;
        comment: any;
        internal: boolean;
        fee: any;
    };
    fetchDeposits(code?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    fetchWithdrawals(code?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    fetchTransactionFees(codes?: string[], params?: {}): Promise<any>;
    fetchPrivateTransactionFees(params?: {}): Promise<{
        withdraw: {};
        deposit: {};
        info: any;
    }>;
    fetchPublicTransactionFees(params?: {}): Promise<{
        withdraw: {};
        deposit: {};
        info: any;
    }>;
    fetchDepositWithdrawFees(codes?: string[], params?: {}): Promise<any>;
    fetchPrivateDepositWithdrawFees(codes?: string[], params?: {}): Promise<any>;
    fetchPublicDepositWithdrawFees(codes?: string[], params?: {}): Promise<{}>;
    parsePublicDepositWithdrawFees(response: any, codes?: any): {};
    parseDepositWithdrawFee(fee: any, currency?: any): any;
    sign(path: any, api?: any, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    convertSecretToPem(secret: any): string;
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): void;
}
