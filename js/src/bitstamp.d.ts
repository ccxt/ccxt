import Exchange from './abstract/bitstamp.js';
import { Int, OrderSide } from './base/types.js';
export default class bitstamp extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<any[]>;
    constructCurrencyObject(id: any, code: any, name: any, precision: any, minCost: any, originalPayload: any): {
        id: any;
        code: any;
        info: any;
        type: string;
        name: any;
        active: boolean;
        deposit: any;
        withdraw: any;
        fee: number;
        precision: number;
        limits: {
            amount: {
                min: number;
                max: any;
            };
            price: {
                min: number;
                max: any;
            };
            cost: {
                min: any;
                max: any;
            };
            withdraw: {
                min: any;
                max: any;
            };
        };
        networks: {};
    };
    fetchMarketsFromCache(params?: {}): Promise<any>;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<import("./base/types.js").OrderBook>;
    parseTicker(ticker: any, market?: any): import("./base/types.js").Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<import("./base/types.js").Ticker>;
    getCurrencyIdFromTransaction(transaction: any): string;
    getMarketFromTrade(trade: any): any;
    parseTrade(trade: any, market?: any): import("./base/types.js").Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseOHLCV(ohlcv: any, market?: any): number[];
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").OHLCV[]>;
    parseBalance(response: any): import("./base/types.js").Balances;
    fetchBalance(params?: {}): Promise<import("./base/types.js").Balances>;
    fetchTradingFee(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: any;
        maker: number;
        taker: number;
    }>;
    parseTradingFee(fee: any, market?: any): {
        info: any;
        symbol: any;
        maker: number;
        taker: number;
    };
    parseTradingFees(fees: any): {
        info: any;
    };
    fetchTradingFees(params?: {}): Promise<{
        info: any;
    }>;
    fetchTransactionFees(codes?: any, params?: {}): Promise<{}>;
    parseTransactionFees(response: any, codes?: any): {};
    fetchDepositWithdrawFees(codes?: any, params?: {}): Promise<{}>;
    parseDepositWithdrawFees(response: any, codes?: any, currencyIdKey?: any): {};
    createOrder(symbol: string, type: any, side: OrderSide, amount: any, price?: any, params?: {}): Promise<any>;
    cancelOrder(id: string, symbol?: string, params?: {}): Promise<any>;
    cancelAllOrders(symbol?: string, params?: {}): Promise<any>;
    parseOrderStatus(status: any): string;
    fetchOrderStatus(id: string, symbol?: string, params?: {}): Promise<string>;
    fetchOrder(id: string, symbol?: string, params?: {}): Promise<any>;
    fetchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    fetchTransactions(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchWithdrawals(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseTransaction(transaction: any, currency?: any): {
        info: any;
        id: string;
        txid: string;
        type: any;
        currency: any;
        network: any;
        amount: number;
        status: string;
        timestamp: number;
        datetime: string;
        address: string;
        addressFrom: any;
        addressTo: string;
        tag: any;
        tagFrom: any;
        tagTo: any;
        updated: any;
        comment: any;
        fee: {
            currency: any;
            cost: any;
            rate: any;
        };
    };
    parseTransactionStatus(status: any): string;
    parseOrder(order: any, market?: any): any;
    parseLedgerEntryType(type: any): string;
    parseLedgerEntry(item: any, currency?: any): {
        id: string;
        info: any;
        timestamp: number;
        datetime: string;
        direction: string;
        account: any;
        referenceId: string;
        referenceAccount: any;
        type: string;
        currency: any;
        amount: number;
        before: any;
        after: any;
        status: string;
        fee: import("./base/types.js").Fee;
    } | {
        id: string;
        info: any;
        timestamp: number;
        datetime: string;
        direction: any;
        account: any;
        referenceId: string;
        referenceAccount: any;
        type: string;
        currency: any;
        amount: number;
        before: any;
        after: any;
        status: string;
        fee: {
            currency: any;
            cost: any;
            rate: any;
        };
    };
    fetchLedger(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchOpenOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Order[]>;
    getCurrencyName(code: any): any;
    isFiat(code: any): boolean;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: string;
        tag: string;
        network: any;
        info: any;
    }>;
    withdraw(code: string, amount: any, address: any, tag?: any, params?: {}): Promise<{
        info: any;
        id: string;
        txid: string;
        type: any;
        currency: any;
        network: any;
        amount: number;
        status: string;
        timestamp: number;
        datetime: string;
        address: string;
        addressFrom: any;
        addressTo: string;
        tag: any;
        tagFrom: any;
        tagTo: any;
        updated: any;
        comment: any;
        fee: {
            currency: any;
            cost: any;
            rate: any;
        };
    }>;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
