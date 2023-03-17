import ndaxRest from '../ndax.js';
export default class ndax extends ndaxRest {
    describe(): any;
    requestId(): any;
    watchTicker(symbol: any, params?: {}): Promise<any>;
    handleTicker(client: any, message: any): void;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    handleTrades(client: any, message: any): void;
    watchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOHLCV(client: any, message: any): void;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any): any;
    handleOrderBookSubscription(client: any, message: any, subscription: any): void;
    handleSubscriptionStatus(client: any, message: any): any;
    handleMessage(client: any, message: any): any;
}
