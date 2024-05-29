import Exchange from './abstract/idex.js';
import type { Balances, Currencies, Currency, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFees, Transaction, int } from './base/types.js';
/**
 * @class idex
 * @augments Exchange
 */
export default class idex extends Exchange {
    describe(): any;
    priceToPrecision(symbol: any, price: any): string;
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseSide(book: any, side: any): any[];
    fetchCurrencies(params?: {}): Promise<Currencies>;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrdersHelper(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseOrderStatus(status: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    associateWallet(walletAddress: any, params?: {}): Promise<any>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    fetchDeposit(id: string, code?: Str, params?: {}): Promise<Transaction>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchStatus(params?: {}): Promise<{
        status: string;
        updated: any;
        eta: any;
        url: any;
        info: any;
    }>;
    fetchTime(params?: {}): Promise<number>;
    fetchWithdrawal(id: string, code?: Str, params?: {}): Promise<Transaction>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchTransactionsHelper(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: Str): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    calculateRateLimiterCost(api: any, method: any, path: any, params: any, config?: {}): any;
    fetchDepositAddress(code?: Str, params?: {}): Promise<{
        info: any;
        currency: any;
        address: string;
        tag: any;
        network: string;
    }>;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        info: any;
        currency: any;
        address: string;
        tag: any;
        network: string;
    };
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    remove0xPrefix(hexData: any): any;
    hashMessage(message: any): string;
    signHash(hash: any, privateKey: any): {
        r: string;
        s: string;
        v: number;
    };
    signMessage(message: any, privateKey: any): {
        r: string;
        s: string;
        v: number;
    };
    signMessageString(message: any, privateKey: any): string;
}
