import kucoinfuturesRest from '../kucoinfutures.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class kucoinfutures extends kucoinfuturesRest {
    describe(): any;
    negotiate(privateChannel: any, params?: {}): any;
    negotiateHelper(privateChannel: any, params?: {}): Promise<string>;
    requestId(): any;
    subscribe(url: any, messageHash: any, subscriptionHash: any, subscription: any, params?: {}): Promise<any>;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    handleTicker(client: Client, message: any): any;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTrade(client: Client, message: any): any;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleDelta(orderbook: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBook(client: Client, message: any): void;
    getCacheIndex(orderbook: any, cache: any): any;
    handleOrderBookSubscription(client: Client, message: any, subscription: any): void;
    handleSubscriptionStatus(client: Client, message: any): any;
    handleSystemStatus(client: Client, message: any): any;
    watchOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseWsOrderStatus(status: any): string;
    parseWsOrder(order: any, market?: any): import("../base/types.js").Order;
    handleOrder(client: Client, message: any): void;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: Client, message: any): void;
    handleBalanceSubscription(client: Client, message: any, subscription: any): void;
    fetchBalanceSnapshot(client: any, message: any): Promise<void>;
    handleSubject(client: Client, message: any): any;
    ping(client: any): {
        id: any;
        type: string;
    };
    handlePong(client: Client, message: any): any;
    handleErrorMessage(client: Client, message: any): any;
    handleMessage(client: Client, message: any): any;
}
