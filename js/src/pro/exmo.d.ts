import exmoRest from '../exmo.js';
export default class exmo extends exmoRest {
    describe(): any;
    requestId(): any;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: any, message: any): void;
    parseSpotBalance(message: any): void;
    parseMarginBalance(message: any): void;
    watchTicker(symbol: any, params?: {}): Promise<any>;
    handleTicker(client: any, message: any): void;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    handleTrades(client: any, message: any): void;
    watchMyTrades(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleMyTrades(client: any, message: any): void;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any): void;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleMessage(client: any, message: any): any;
    handleSubscribed(client: any, message: any): any;
    handleInfo(client: any, message: any): any;
    handleAuthenticationMessage(client: any, message: any): void;
    authenticate(params?: {}): any;
}
