import bitfinexRest from '../bitfinex.js';
import type { Int, Str, Trade, OrderBook, Order, Ticker } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bitfinex extends bitfinexRest {
    describe(): any;
    subscribe(channel: any, symbol: any, params?: {}): Promise<any>;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleTrades(client: Client, message: any, subscription: any): void;
    parseTrade(trade: any, market?: any): Trade;
    handleTicker(client: Client, message: any, subscription: any): void;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any, subscription: any): void;
    handleHeartbeat(client: Client, message: any): void;
    handleSystemStatus(client: Client, message: any): any;
    handleSubscriptionStatus(client: Client, message: any): any;
    authenticate(params?: {}): Promise<any>;
    handleAuthenticationMessage(client: Client, message: any): void;
    watchOrder(id: any, symbol?: Str, params?: {}): Promise<any>;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrders(client: Client, message: any, subscription: any): void;
    parseWsOrderStatus(status: any): string;
    handleOrder(client: Client, order: any): Order;
    handleMessage(client: Client, message: any): void;
}
