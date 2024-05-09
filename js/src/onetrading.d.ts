import Exchange from './abstract/onetrading.js';
import type { Balances, Currencies, Currency, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFees, Transaction } from './base/types.js';
/**
 * @class onetrading
 * @augments Exchange
 */
export default class onetrading extends Exchange {
    describe(): any;
    fetchTime(params?: {}): Promise<number>;
    fetchCurrencies(params?: {}): Promise<Currencies>;
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: any): Market;
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    fetchPublicTradingFees(params?: {}): Promise<{}>;
    fetchPrivateTradingFees(params?: {}): Promise<{}>;
    parseFeeTiers(feeTiers: any, market?: Market): {
        maker: any[];
        taker: any[];
    };
    parseTicker(ticker: Dict, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        currency: any;
        address: string;
        tag: string;
        network: any;
        info: any;
    };
    createDepositAddress(code: string, params?: {}): Promise<{
        currency: any;
        address: string;
        tag: string;
        network: any;
        info: any;
    }>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: any;
        address: string;
        tag: string;
        network: any;
        info: any;
    }>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    parseOrderStatus(status: any): string;
    parseOrder(order: any, market?: Market): Order;
    parseTimeInForce(timeInForce: any): string;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<any>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
