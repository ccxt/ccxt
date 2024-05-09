import Exchange from './abstract/kuna.js';
import type { Balances, Currencies, Currency, Dict, Int, Market, Num, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
/**
 * @class kuna
 * @augments Exchange
 * @description Use the public-key as your apiKey
 */
export default class kuna extends Exchange {
    describe(): any;
    fetchTime(params?: {}): Promise<number>;
    fetchCurrencies(params?: {}): Promise<Currencies>;
    parseCurrencies(currencies: any, params?: {}): {};
    parseCurrency(currency: any): {
        info: any;
        id: string;
        code: string;
        type: any;
        margin: any;
        name: string;
        active: any;
        deposit: any;
        withdraw: any;
        fee: any;
        precision: string;
        limits: {
            amount: {
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
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchL3OrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: any, market?: Market): Trade;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    parseOrderStatus(status: any): string;
    parseOrder(order: any, market?: Market): Order;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrdersByStatus(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawal(id: string, code?: Str, params?: {}): Promise<Transaction>;
    createDepositAddress(code: string, params?: {}): Promise<{
        info: string;
        currency: string;
        network: any;
        address: string;
        tag: any;
    }>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        info: string;
        currency: string;
        network: any;
        address: string;
        tag: any;
    }>;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        info: string;
        currency: string;
        network: any;
        address: string;
        tag: any;
    };
    parseTransactionStatus(status: any): string;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDeposit(id: string, code?: Str, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    nonce(): number;
    encodeParams(params: any): string;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
