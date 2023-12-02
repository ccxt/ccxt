import Exchange from './abstract/coincheck.js';
import { Balances, Currency, Int, Market, Order, OrderBook, OrderSide, OrderType, Str, Ticker, Trade, Transaction } from './base/types.js';
/**
 * @class coincheck
 * @extends Exchange
 */
export default class coincheck extends Exchange {
    describe(): any;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrder(order: any, market?: Market): Order;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTradingFees(params?: {}): Promise<{}>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: any): string;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
