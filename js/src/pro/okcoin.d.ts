import okcoinRest from '../okcoin.js';
export default class okcoin extends okcoinRest {
    describe(): any;
    subscribe(channel: any, symbol: any, params?: {}): Promise<any>;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    watchOrders(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOrders(client: any, message: any, subscription?: any): void;
    watchTicker(symbol: any, params?: {}): Promise<any>;
    handleTrade(client: any, message: any): any;
    handleTicker(client: any, message: any): any;
    watchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOHLCV(client: any, message: any): void;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBookMessage(client: any, message: any, orderbook: any): any;
    handleOrderBook(client: any, message: any): any;
    authenticate(params?: {}): Promise<any>;
    watchBalance(params?: {}): Promise<any>;
    subscribeToUserAccount(negotiation: any, params?: {}): Promise<any>;
    handleBalance(client: any, message: any): void;
    handleSubscriptionStatus(client: any, message: any): any;
    handleAuthenticate(client: any, message: any): any;
    ping(client: any): string;
    handlePong(client: any, message: any): any;
    handleErrorMessage(client: any, message: any): any;
    handleMessage(client: any, message: any): any;
}
