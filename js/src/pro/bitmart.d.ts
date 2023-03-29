import bitmartRest from '../bitmart.js';
export default class bitmart extends bitmartRest {
    describe(): any;
    subscribe(channel: any, symbol: any, params?: {}): Promise<any>;
    subscribePrivate(channel: any, symbol: any, params?: {}): Promise<any>;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    watchTicker(symbol: any, params?: {}): Promise<any>;
    watchOrders(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOrders(client: any, message: any): void;
    parseWsOrder(order: any, market?: any): any;
    handleTrade(client: any, message: any): any;
    handleTicker(client: any, message: any): any;
    watchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOHLCV(client: any, message: any): void;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBookMessage(client: any, message: any, orderbook: any): any;
    handleOrderBook(client: any, message: any): any;
    authenticate(params?: {}): any;
    handleSubscriptionStatus(client: any, message: any): any;
    handleAuthenticate(client: any, message: any): void;
    handleErrorMessage(client: any, message: any): boolean;
    handleMessage(client: any, message: any): any;
}
