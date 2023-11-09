import Exchange from './abstract/btctradeua.js';
import { Balances, Int, Order, OrderBook, OrderSide, OrderType, Ticker, Trade } from './base/types.js';
/**
 * @class btctradeua
 * @extends Exchange
 */
export default class btctradeua extends Exchange {
    describe(): any;
    signIn(params?: {}): Promise<any>;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: any, market?: any): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    convertMonthNameToString(cyrillic: any): string;
    parseExchangeSpecificDatetime(cyrillic: any): number;
    parseTrade(trade: any, market?: any): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<any>;
    cancelOrder(id: string, symbol?: string, params?: {}): Promise<any>;
    parseOrder(order: any, market?: any): Order;
    fetchOpenOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
