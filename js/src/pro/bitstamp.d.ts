import bitstampRest from '../bitstamp.js';
import type { Int, Str, OrderBook, Order, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bitstamp extends bitstampRest {
    describe(): any;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    handleDelta(orderbook: any, delta: any): void;
    handleBidAsks(bookSide: any, bidAsks: any): void;
    getCacheIndex(orderbook: any, deltas: any): any;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseWsTrade(trade: any, market?: any): Trade;
    handleTrade(client: Client, message: any): void;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrders(client: Client, message: any): void;
    parseWsOrder(order: any, market?: any): Order;
    handleOrderBookSubscription(client: Client, message: any): void;
    handleSubscriptionStatus(client: Client, message: any): void;
    handleSubject(client: Client, message: any): void;
    handleErrorMessage(client: Client, message: any): any;
    handleMessage(client: Client, message: any): void;
    authenticate(params?: {}): Promise<void>;
    subscribePrivate(subscription: any, messageHash: any, params?: {}): Promise<any>;
}
