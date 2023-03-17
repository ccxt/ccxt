import bitstampRest from '../bitstamp.js';
export default class bitstamp extends bitstampRest {
    describe(): any;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any): void;
    handleDelta(orderbook: any, delta: any): void;
    handleBidAsks(bookSide: any, bidAsks: any): void;
    getCacheIndex(orderbook: any, deltas: any): any;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    parseWsTrade(trade: any, market?: any): import("../base/types.js").Trade;
    handleTrade(client: any, message: any): void;
    watchOrders(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOrders(client: any, message: any): void;
    parseWsOrder(order: any, market?: any): any;
    handleOrderBookSubscription(client: any, message: any): void;
    handleSubscriptionStatus(client: any, message: any): void;
    handleSubject(client: any, message: any): void;
    handleErrorMessage(client: any, message: any): any;
    handleMessage(client: any, message: any): void;
    authenticate(params?: {}): Promise<any>;
    subscribePrivate(subscription: any, messageHash: any, params?: {}): Promise<any>;
}
