import Exchange from './abstract/blockchaincom.js';
import { Balances, Int, Order, OrderBook, OrderSide, OrderType, Ticker, Trade, Transaction } from './base/types.js';
/**
 * @class blockchaincom
 * @extends Exchange
 */
export default class blockchaincom extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<any[]>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchL3OrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchL2OrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: any, market?: any): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: string[], params?: {}): Promise<import("./base/types.js").Dictionary<Ticker>>;
    parseOrderState(state: any): string;
    parseOrder(order: any, market?: any): Order;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: string, params?: {}): Promise<{
        id: string;
        info: any;
    }>;
    cancelAllOrders(symbol?: string, params?: {}): Promise<{
        symbol: string;
        info: any;
    }>;
    fetchTradingFees(params?: {}): Promise<{}>;
    fetchCanceledOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrdersByState(state: any, symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseTrade(trade: any, market?: any): Trade;
    fetchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        info: any;
    }>;
    parseTransactionState(state: any): string;
    parseTransaction(transaction: any, currency?: any): Transaction;
    fetchWithdrawalWhitelist(params?: {}): Promise<any[]>;
    fetchWithdrawalWhitelistByCurrency(code: string, params?: {}): Promise<any[]>;
    withdraw(code: string, amount: any, address: any, tag?: any, params?: {}): Promise<Transaction>;
    fetchWithdrawals(code?: string, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawal(id: string, code?: string, params?: {}): Promise<Transaction>;
    fetchDeposits(code?: string, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDeposit(id: string, code?: string, params?: {}): Promise<Transaction>;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrder(id: string, symbol?: string, params?: {}): Promise<Order>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
