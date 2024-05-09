import Exchange from './abstract/bitopro.js';
import type { Balances, Currencies, Currency, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFees, Transaction } from './base/types.js';
/**
 * @class bitopro
 * @augments Exchange
 */
export default class bitopro extends Exchange {
    describe(): any;
    fetchCurrencies(params?: {}): Promise<Currencies>;
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: any): Market;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    insertMissingCandles(candles: any, distance: any, since: any, limit: any): any;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    parseOrderStatus(status: any): string;
    parseOrder(order: any, market?: Market): Order;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<any>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTransactionStatus(status: any): string;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawal(id: string, code?: Str, params?: {}): Promise<Transaction>;
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): {
        info: any;
        withdraw: {
            fee: number;
            percentage: boolean;
        };
        deposit: {
            fee: any;
            percentage: any;
        };
        networks: {};
    };
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
