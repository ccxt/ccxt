import bitmartRest from '../bitmart.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bitmart extends bitmartRest {
    describe(): any;
    subscribe(channel: any, symbol: any, params?: {}): Promise<any>;
    subscribePrivate(channel: any, symbol: any, params?: {}): Promise<any>;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    watchOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOrders(client: Client, message: any): void;
    parseWsOrder(order: any, market?: any): import("../base/types.js").Order;
    handleTrade(client: Client, message: any): any;
    handleTicker(client: Client, message: any): any;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOHLCV(client: Client, message: any): void;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBookMessage(client: Client, message: any, orderbook: any): any;
    handleOrderBook(client: Client, message: any): any;
    authenticate(params?: {}): any;
    handleSubscriptionStatus(client: Client, message: any): any;
    handleAuthenticate(client: Client, message: any): void;
    handleErrorMessage(client: Client, message: any): boolean;
    handleMessage(client: Client, message: any): any;
}
