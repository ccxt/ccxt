import Exchange from './abstract/kuna.js';
import { Balances, Currency, Int, Market, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
/**
 * @class kuna
 * @extends Exchange
 * @description Use the public-key as your apiKey
 */
export default class kuna extends Exchange {
    describe(): undefined;
    fetchTime(params?: {}): Promise<Int>;
    fetchCurrencies(params?: {}): Promise<{}>;
    parseCurrencies(currencies: any, params?: {}): {};
    parseCurrency(currency: any): {
        info: any;
        id: Str;
        code: string;
        type: undefined;
        margin: undefined;
        name: Str;
        active: undefined;
        deposit: undefined;
        withdraw: undefined;
        fee: undefined;
        precision: any;
        limits: {
            amount: {
                min: undefined;
                max: undefined;
            };
            withdraw: {
                min: undefined;
                max: undefined;
            };
        };
        networks: {};
    };
    fetchMarkets(params?: {}): Promise<never[]>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchL3OrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: any, market?: Market): Trade;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    parseOrderStatus(status: any): Str;
    parseOrder(order: any, market?: Market): Order;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrdersByStatus(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<Transaction>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawal(id: string, code?: Str, params?: {}): Promise<Transaction>;
    createDepositAddress(code: string, params?: {}): Promise<{
        info: Str;
        currency: string;
        network: undefined;
        address: Str;
        tag: undefined;
    }>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        info: Str;
        currency: string;
        network: undefined;
        address: Str;
        tag: undefined;
    }>;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        info: Str;
        currency: string;
        network: undefined;
        address: Str;
        tag: undefined;
    };
    parseTransactionStatus(status: any): Str;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDeposit(id: string, code?: Str, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    nonce(): number;
    encodeParams(params: any): string;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: undefined;
        method: string;
        body: undefined;
        headers: undefined;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
