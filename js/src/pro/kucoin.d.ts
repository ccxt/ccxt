import kucoinRest from '../kucoin.js';
export default class kucoin extends kucoinRest {
    describe(): any;
    negotiate(privateChannel: any, params?: {}): any;
    negotiateHelper(privateChannel: any, params?: {}): Promise<string>;
    requestId(): any;
    subscribe(url: any, messageHash: any, subscriptionHash: any, subscription: any, params?: {}): Promise<any>;
    watchTicker(symbol: any, params?: {}): Promise<any>;
    handleTicker(client: any, message: any): void;
    watchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOHLCV(client: any, message: any): void;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    handleTrade(client: any, message: any): void;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any): void;
    getCacheIndex(orderbook: any, cache: any): any;
    handleDelta(orderbook: any, delta: any): void;
    handleBidAsks(bookSide: any, bidAsks: any): void;
    handleOrderBookSubscription(client: any, message: any, subscription: any): void;
    handleSubscriptionStatus(client: any, message: any): any;
    handleSystemStatus(client: any, message: any): any;
    watchOrders(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    parseWsOrderStatus(status: any): string;
    parseWsOrder(order: any, market?: any): any;
    handleOrder(client: any, message: any): void;
    watchMyTrades(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleMyTrade(client: any, message: any): void;
    parseWsTrade(trade: any, market?: any): import("../base/types.js").Trade;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: any, message: any): void;
    handleSubject(client: any, message: any): any;
    ping(client: any): {
        id: any;
        type: string;
    };
    handlePong(client: any, message: any): void;
    handleErrorMessage(client: any, message: any): any;
    handleMessage(client: any, message: any): any;
}
