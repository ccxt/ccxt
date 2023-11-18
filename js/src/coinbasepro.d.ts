import Exchange from './abstract/coinbasepro.js';
import { Int, OrderSide, OrderType, Trade, OHLCV, Order, Balances, Str, Transaction, Ticker, OrderBook, Tickers, Strings, Market, Currency } from './base/types.js';
/**
 * @class coinbasepro
 * @extends Exchange
 */
export default class coinbasepro extends Exchange {
    describe(): undefined;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchMarkets(params?: {}): Promise<never[]>;
    fetchAccounts(params?: {}): Promise<never[]>;
    parseAccount(account: any): {
        id: Str;
        type: undefined;
        code: string;
        info: any;
    };
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTradingFees(params?: {}): Promise<{}>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchTime(params?: {}): Promise<number | undefined>;
    parseOrderStatus(status: any): Str;
    parseOrder(order: any, market?: Market): Order;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    fetchPaymentMethods(params?: {}): Promise<any>;
    deposit(code: string, amount: any, address: any, params?: {}): Promise<{
        info: any;
        id: any;
    }>;
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<Transaction>;
    parseLedgerEntryType(type: any): Str;
    parseLedgerEntry(item: any, currency?: Currency): {
        id: Str;
        currency: string;
        account: undefined;
        referenceAccount: undefined;
        referenceId: undefined;
        status: string;
        amount: number;
        before: number;
        after: number;
        fee: undefined;
        direction: undefined;
        timestamp: number | undefined;
        datetime: string | undefined;
        type: Str;
        info: any;
    };
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(transaction: any): "canceled" | "pending" | "ok" | "failed";
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    createDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: any;
        tag: Str;
        info: any;
    }>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
    request(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined, config?: {}): Promise<any>;
}
