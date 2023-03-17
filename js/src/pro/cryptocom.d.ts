import cryptocomRest from '../cryptocom.js';
export default class cryptocom extends cryptocomRest {
    describe(): any;
    pong(client: any, message: any): Promise<void>;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    handleOrderBookSnapshot(client: any, message: any): void;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    handleTrades(client: any, message: any): void;
    watchMyTrades(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    watchTicker(symbol: any, params?: {}): Promise<any>;
    handleTicker(client: any, message: any): void;
    watchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOHLCV(client: any, message: any): void;
    watchOrders(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOrders(client: any, message: any, subscription?: any): void;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: any, message: any): void;
    watchPublic(messageHash: any, params?: {}): Promise<any>;
    watchPrivate(messageHash: any, params?: {}): Promise<any>;
    handleErrorMessage(client: any, message: any): boolean;
    handleMessage(client: any, message: any): void;
    authenticate(params?: {}): any;
    handlePing(client: any, message: any): void;
    handleAuthenticate(client: any, message: any): void;
}
