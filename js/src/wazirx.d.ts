import Exchange from './abstract/wazirx.js';
import { Balances, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade } from './base/types.js';
/**
 * @class wazirx
 * @extends Exchange
 */
export default class wazirx extends Exchange {
    describe(): undefined;
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: any): Market;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchStatus(params?: {}): Promise<{
        status: string;
        updated: undefined;
        eta: undefined;
        url: undefined;
        info: any;
    }>;
    fetchTime(params?: {}): Promise<Int>;
    parseTicker(ticker: any, market?: Market): Ticker;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    parseOrder(order: any, market?: Market): Order;
    parseOrderStatus(status: any): Str;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
