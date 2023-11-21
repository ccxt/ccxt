import Exchange from './abstract/bitso.js';
import { Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Trade, Transaction } from './base/types.js';
/**
 * @class bitso
 * @extends Exchange
 */
export default class bitso extends Exchange {
    describe(): any;
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseLedgerEntryType(type: any): string;
    parseLedgerEntry(item: any, currency?: Currency): {
        id: string;
        timestamp: number;
        datetime: string;
        direction: string;
        account: string;
        referenceId: string;
        referenceAccount: string;
        type: string;
        currency: string;
        amount: number;
        before: number;
        after: number;
        status: string;
        fee: any;
        info: object;
    };
    fetchMarkets(params?: {}): Promise<any[]>;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTradingFees(params?: {}): Promise<{}>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: number, params?: {}): Promise<Trade[]>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<any[]>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any[]>;
    parseOrderStatus(status: any): string;
<<<<<<< HEAD
    parseOrder(order: any, market?: any): Order;
<<<<<<< HEAD
    fetchOpenOrders(symbol?: string, since?: Int, limit?: number, params?: {}): Promise<Order[]>;
    fetchOrder(id: string, symbol?: string, params?: {}): Promise<Order>;
<<<<<<< HEAD
    fetchOrderTrades(id: string, symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    fetchDeposit(id: string, code?: string, params?: {}): Promise<{
        id: string;
        txid: string;
        timestamp: number;
        datetime: string;
        network: string;
        addressFrom: string;
        address: string;
        addressTo: string;
        amount: number;
        type: string;
        currency: any;
        status: string;
        updated: any;
        tagFrom: any;
        tag: any;
        tagTo: any;
        comment: any;
        fee: any;
        info: any;
    }>;
    fetchDeposits(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
=======
    fetchOrderTrades(id: string, symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchDeposit(id: string, code?: string, params?: {}): Promise<Transaction>;
    fetchDeposits(code?: string, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
>>>>>>> 1a5931741ea069834b52aa71871d9b8ccba70afe
=======
=======
    parseOrder(order: any, market?: Market): Order;
>>>>>>> 055794d8789e08535c7d6feb0b1c77db77c1f0ea
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: number, params?: {}): Promise<Order[]>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchDeposit(id: string, code?: Str, params?: {}): Promise<Transaction>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
>>>>>>> 5a483c50bd8a5c4ae57e5d31a9de8caed1148cc1
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: string;
        tag: any;
        network: any;
        info: any;
    }>;
    fetchTransactionFees(codes?: any, params?: {}): Promise<{}>;
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<{}>;
    parseDepositWithdrawFees(response: any, codes?: any, currencyIdKey?: any): {};
<<<<<<< HEAD
    withdraw(code: string, amount: any, address: any, tag?: any, params?: {}): Promise<{
        id: string;
        txid: string;
        timestamp: number;
        datetime: string;
        network: string;
        addressFrom: string;
        address: string;
        addressTo: string;
        amount: number;
        type: string;
        currency: any;
        status: string;
        updated: any;
        tagFrom: any;
        tag: any;
        tagTo: any;
        comment: any;
        fee: any;
        info: any;
    }>;
    safeNetwork(networkId: any): string;
    parseTransaction(transaction: any, currency?: any): {
        id: string;
        txid: string;
        timestamp: number;
        datetime: string;
        network: string;
        addressFrom: string;
        address: string;
        addressTo: string;
        amount: number;
        type: string;
        currency: any;
        status: string;
        updated: any;
        tagFrom: any;
        tag: any;
        tagTo: any;
        comment: any;
        fee: any;
        info: any;
    };
=======
    withdraw(code: string, amount: any, address: any, tag?: any, params?: {}): Promise<Transaction>;
    safeNetwork(networkId: any): string;
<<<<<<< HEAD
    parseTransaction(transaction: any, currency?: any): Transaction;
>>>>>>> 1a5931741ea069834b52aa71871d9b8ccba70afe
=======
    parseTransaction(transaction: any, currency?: Currency): Transaction;
>>>>>>> 055794d8789e08535c7d6feb0b1c77db77c1f0ea
    parseTransactionStatus(status: any): string;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
