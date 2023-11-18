import Exchange from './abstract/alpaca.js';
import { Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Trade } from './base/types.js';
/**
 * @class alpaca
 * @extends Exchange
 */
export default class alpaca extends Exchange {
    describe(): undefined;
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(asset: any): Market;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrder(order: any, market?: Market): Order;
    parseOrderStatus(status: any): Str;
    parseTimeInForce(timeInForce: any): Str;
    parseTrade(trade: any, market?: Market): Trade;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: any;
        method: string;
        body: undefined;
        headers: undefined;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
