import Exchange from './abstract/bit2c.js';
import { Balances, Int, Order, OrderSide, OrderType, Ticker, Trade } from './base/types.js';
/**
 * @class bit2c
 * @extends Exchange
 */
export default class bit2c extends Exchange {
    describe(): any;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<import("./base/types.js").OrderBook>;
    parseTicker(ticker: any, market?: any): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTradingFees(params?: {}): Promise<{}>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: string, params?: {}): Promise<any>;
    fetchOpenOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrder(id: string, symbol?: string, params?: {}): Promise<Order>;
    parseOrder(order: any, market?: any): Order;
    fetchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    removeCommaFromValue(str: any): string;
    parseTrade(trade: any, market?: any): Trade;
    isFiat(code: any): boolean;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: any;
        network: any;
        address: string;
        tag: any;
        info: any;
    }>;
    parseDepositAddress(depositAddress: any, currency?: any): {
        currency: any;
        network: any;
        address: string;
        tag: any;
        info: any;
    };
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
