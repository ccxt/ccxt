import Exchange from './abstract/coinbasepro.js';
import type { Int, OrderSide, OrderType, Trade, OHLCV, Order, Balances, Str, Transaction, Ticker, OrderBook, Tickers, Strings, Market, Currency, Num } from './base/types.js';
/**
 * @class coinbasepro
 * @augments Exchange
 */
export default class coinbasepro extends Exchange {
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    createDepositAddress(code: string, params?: {}): Promise<{
        address: any;
        currency: string;
        info: any;
        tag: string;
    }>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    deposit(code: string, amount: any, address: any, params?: {}): Promise<{
        id: any;
        info: any;
    }>;
    describe(): any;
    fetchAccounts(params?: {}): Promise<any[]>;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchMarkets(params?: {}): Promise<any[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchPaymentMethods(params?: {}): Promise<any>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTime(params?: {}): Promise<number>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTradingFees(params?: {}): Promise<{}>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
    parseAccount(account: any): {
        code: string;
        id: string;
        info: any;
        type: any;
    };
    parseBalance(response: any): Balances;
    parseLedgerEntry(item: any, currency?: Currency): {
        account: any;
        after: number;
        amount: number;
        before: number;
        currency: string;
        datetime: string;
        direction: any;
        fee: any;
        id: string;
        info: any;
        referenceAccount: any;
        referenceId: any;
        status: string;
        timestamp: number;
        type: string;
    };
    parseLedgerEntryType(type: any): string;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    parseTransactionStatus(transaction: any): "ok" | "canceled" | "failed" | "pending";
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        body: any;
        headers: any;
        method: string;
        url: string;
    };
    withdraw(code: string, amount: number, address: any, tag?: any, params?: {}): Promise<Transaction>;
}
