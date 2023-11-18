import Exchange from './abstract/timex.js';
import { Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
/**
 * @class timex
 * @extends Exchange
 */
export default class timex extends Exchange {
    describe(): undefined;
    fetchMarkets(params?: {}): Promise<Market[]>;
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
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    editOrder(id: string, symbol: any, type: any, side: any, amount?: undefined, price?: undefined, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<any>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTradingFee(fee: any, market?: Market): {
        info: any;
        symbol: string;
        maker: import("./base/types.js").Num;
        taker: import("./base/types.js").Num;
    };
    fetchTradingFee(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        maker: import("./base/types.js").Num;
        taker: import("./base/types.js").Num;
    }>;
    parseMarket(market: any): Market;
    parseCurrency(currency: any): {
        id: string;
        code: string;
        info: any;
        type: undefined;
        name: Str;
        active: any;
        deposit: any;
        withdraw: any;
        fee: undefined;
        precision: number;
        limits: {
            withdraw: {
                min: undefined;
                max: undefined;
            };
            amount: {
                min: undefined;
                max: undefined;
            };
        };
        networks: {};
    };
    parseTicker(ticker: any, market?: Market): Ticker;
    parseTrade(trade: any, market?: Market): Trade;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    parseOrder(order: any, market?: Market): Order;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    handleErrors(statusCode: any, statusText: any, url: any, method: any, responseHeaders: any, responseBody: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
