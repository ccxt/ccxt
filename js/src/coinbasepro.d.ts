import Exchange from './abstract/coinbasepro.js';
import type { Int, OrderSide, OrderType, Trade, OHLCV, Order, Balances, Str, Transaction, Ticker, OrderBook, Tickers, Strings, Market, Currency, Num, Account, Currencies, TradingFees, Dict } from './base/types.js';
/**
 * @class coinbasepro
 * @augments Exchange
 */
export default class coinbasepro extends Exchange {
    describe(): any;
    fetchCurrencies(params?: {}): Promise<Currencies>;
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchAccounts(params?: {}): Promise<Account[]>;
    parseAccount(account: any): {
        id: string;
        type: any;
        code: string;
        info: any;
    };
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchTime(params?: {}): Promise<number>;
    parseOrderStatus(status: any): string;
    parseOrder(order: any, market?: Market): Order;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    fetchPaymentMethods(params?: {}): Promise<any>;
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseLedgerEntryType(type: any): string;
    parseLedgerEntry(item: any, currency?: Currency): {
        id: string;
        currency: string;
        account: any;
        referenceAccount: any;
        referenceId: any;
        status: string;
        amount: number;
        before: number;
        after: number;
        fee: any;
        direction: any;
        timestamp: number;
        datetime: string;
        type: string;
        info: any;
    };
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(transaction: any): "ok" | "canceled" | "pending" | "failed";
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    createDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: any;
        tag: string;
        info: any;
    }>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
    request(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any, config?: {}): Promise<any>;
}
