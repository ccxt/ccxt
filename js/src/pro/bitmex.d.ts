import bitmexRest from '../bitmex.js';
export default class bitmex extends bitmexRest {
    describe(): any;
    watchTicker(symbol: any, params?: {}): Promise<any>;
    handleTicker(client: any, message: any): any;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: any, message: any): void;
    handleTrades(client: any, message: any): void;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    authenticate(params?: {}): Promise<any>;
    handleAuthenticationMessage(client: any, message: any): void;
    watchOrders(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOrders(client: any, message: any): void;
    watchMyTrades(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleMyTrades(client: any, message: any): void;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    watchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOHLCV(client: any, message: any): void;
    watchHeartbeat(params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any): void;
    handleSystemStatus(client: any, message: any): any;
    handleSubscriptionStatus(client: any, message: any): any;
    handleErrorMessage(client: any, message: any): boolean;
    handleMessage(client: any, message: any): any;
}
