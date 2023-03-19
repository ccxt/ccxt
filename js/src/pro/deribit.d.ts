import deribitRest from '../deribit.js';
export default class deribit extends deribitRest {
    describe(): any;
    requestId(): any;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: any, message: any): void;
    watchTicker(symbol: any, params?: {}): Promise<any>;
    handleTicker(client: any, message: any): void;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    handleTrades(client: any, message: any): void;
    watchMyTrades(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleMyTrades(client: any, message: any): void;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any): void;
    cleanOrderBook(data: any): any;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    watchOrders(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOrders(client: any, message: any): void;
    watchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOHLCV(client: any, message: any): void;
    handleMessage(client: any, message: any): any;
    handleAuthenticationMessage(client: any, message: any): any;
    authenticate(params?: {}): Promise<any>;
}
