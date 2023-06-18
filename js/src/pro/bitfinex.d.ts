import bitfinexRest from '../bitfinex.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bitfinex extends bitfinexRest {
    describe(): any;
    subscribe(channel: any, symbol: any, params?: {}): Promise<any>;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    handleTrades(client: Client, message: any, subscription: any): any;
    parseTrade(trade: any, market?: any): import("../base/types.js").Trade | {
        info: any[];
        timestamp: number;
        datetime: string;
        symbol: any;
        id: any;
        order: any;
        type: any;
        takerOrMaker: any;
        side: any;
        price: number;
        amount: number;
        cost: any;
        fee: any;
    };
    handleTicker(client: Client, message: any, subscription: any): void;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleOrderBook(client: Client, message: any, subscription: any): void;
    handleHeartbeat(client: Client, message: any): void;
    handleSystemStatus(client: Client, message: any): any;
    handleSubscriptionStatus(client: Client, message: any): any;
    authenticate(params?: {}): Promise<any>;
    handleAuthenticationMessage(client: Client, message: any): void;
    watchOrder(id: any, symbol?: string, params?: {}): Promise<any>;
    watchOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOrders(client: Client, message: any, subscription: any): void;
    parseWsOrderStatus(status: any): string;
    handleOrder(client: Client, order: any): import("../base/types.js").Order;
    handleMessage(client: Client, message: any): any;
}
