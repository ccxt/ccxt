import kucoinfuturesRest from '../kucoinfutures.js';
export default class kucoinfutures extends kucoinfuturesRest {
    describe(): any;
    negotiate(privateChannel: any, params?: {}): any;
    negotiateHelper(privateChannel: any, params?: {}): Promise<string>;
    requestId(): any;
    subscribe(url: any, messageHash: any, subscriptionHash: any, subscription: any, params?: {}): Promise<any>;
    watchTicker(symbol: any, params?: {}): Promise<any>;
    handleTicker(client: any, message: any): any;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    handleTrade(client: any, message: any): any;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    handleDelta(orderbook: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBook(client: any, message: any): void;
    getCacheIndex(orderbook: any, cache: any): any;
    handleOrderBookSubscription(client: any, message: any, subscription: any): void;
    handleSubscriptionStatus(client: any, message: any): any;
    handleSystemStatus(client: any, message: any): any;
    watchOrders(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    parseWsOrderStatus(status: any): string;
    parseWsOrder(order: any, market?: any): any;
    handleOrder(client: any, message: any): void;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: any, message: any): void;
    handleBalanceSubscription(client: any, message: any, subscription: any): void;
    fetchBalanceSnapshot(client: any, message: any): Promise<void>;
    handleSubject(client: any, message: any): any;
    ping(client: any): {
        id: any;
        type: string;
    };
    handlePong(client: any, message: any): any;
    handleErrorMessage(client: any, message: any): any;
    handleMessage(client: any, message: any): any;
}
