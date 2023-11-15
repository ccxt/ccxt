import Exchange from './abstract/p2b.js';
import { Int, OHLCV, Order, OrderSide, OrderType, Ticker, Tickers } from './base/types.js';
/**
 * @class p2b
 * @extends Exchange
 */
export default class p2b extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<any[]>;
    fetchTickers(symbols?: string[], params?: {}): Promise<Tickers>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: any, market?: any): Ticker;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<import("./base/types.js").OrderBook>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseTrade(trade: any, market?: any): import("./base/types.js").Trade;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: any): OHLCV;
    fetchBalance(params?: {}): Promise<import("./base/types.js").Balances>;
    parseBalance(response: any): import("./base/types.js").Balances;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: string, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrderTrades(id: string, symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    fetchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    fetchClosedOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrder(order: any, market?: any): Order;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
