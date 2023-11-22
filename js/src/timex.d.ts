import Exchange from './abstract/timex.js';
import { Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
/**
 * @class timex
 * @extends Exchange
 */
export default class timex extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<import("./base/types.js").MarketInterface[]>;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    getCurrencyByAddress(address: any): any;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<Order>;
    editOrder(id: string, symbol: any, type: any, side: any, amount?: any, price?: any, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<any>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTradingFee(fee: any, market?: Market): {
        info: any;
        symbol: string;
        maker: number;
        taker: number;
    };
    fetchTradingFee(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        maker: number;
        taker: number;
    }>;
    parseMarket(market: any): Market;
    parseCurrency(currency: any): {
        id: string;
        code: string;
        info: any;
        type: any;
        name: string;
        active: any;
        deposit: any;
        withdraw: any;
        fee: any;
        precision: number;
        limits: {
            withdraw: {
                min: any;
                max: any;
            };
            amount: {
                min: any;
                max: any;
            };
        };
        networks: {};
    };
    parseTicker(ticker: any, market?: Market): Ticker;
    parseTrade(trade: any, market?: Market): Trade;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    parseOrder(order: any, market?: Market): Order;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(statusCode: any, statusText: any, url: any, method: any, responseHeaders: any, responseBody: any, response: any, requestHeaders: any, requestBody: any): any;
}
