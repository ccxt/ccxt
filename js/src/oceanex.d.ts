import Exchange from './abstract/oceanex.js';
import { Balances, Dictionary, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Ticker, Tickers, Trade } from './base/types.js';
/**
 * @class oceanex
 * @extends Exchange
 */
export default class oceanex extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: any): Market;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: string[], params?: {}): Promise<Tickers>;
    parseTicker(data: any, market?: any): Ticker;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchOrderBooks(symbols?: string[], limit?: Int, params?: {}): Promise<Dictionary<OrderBook>>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: any, market?: any): Trade;
    fetchTime(params?: {}): Promise<number>;
    fetchTradingFees(params?: {}): Promise<{}>;
    fetchKey(params?: {}): Promise<any>;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<Order>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOHLCV(ohlcv: any, market?: any): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOrder(order: any, market?: any): Order;
    parseOrderStatus(status: any): string;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<Order[]>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
