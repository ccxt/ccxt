import Exchange from './abstract/blockchaincom.js';
import type { Balances, Currency, Dict, Int, Market, Num, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFees, Transaction } from './base/types.js';
/**
 * @class blockchaincom
 * @augments Exchange
 */
export default class blockchaincom extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchL3OrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchL2OrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseOrderState(state: any): string;
    parseOrder(order: any, market?: Market): Order;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<{
        id: string;
        info: any;
    }>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<{
        symbol: string;
        info: any;
    }>;
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrdersByState(state: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        info: any;
    }>;
    parseTransactionState(state: any): string;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawal(id: string, code?: Str, params?: {}): Promise<Transaction>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDeposit(id: string, code?: Str, params?: {}): Promise<Transaction>;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
