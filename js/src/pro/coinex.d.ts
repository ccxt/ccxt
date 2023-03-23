import coinexRest from '../coinex.js';
export default class coinex extends coinexRest {
    describe(): any;
    requestId(): any;
    handleTicker(client: any, message: any): void;
    parseWSTicker(ticker: any, market?: any): import("../base/types.js").Ticker;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: any, message: any): void;
    handleTrades(client: any, message: any): void;
    parseWSTrade(trade: any, market?: any): import("../base/types.js").Trade;
    handleOHLCV(client: any, message: any): void;
    watchTicker(symbol: any, params?: {}): Promise<any>;
    watchTickers(symbols?: string[], params?: {}): any;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    watchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBook(client: any, message: any): void;
    checkOrderBookChecksum(orderBook: any): void;
    watchOrders(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOrders(client: any, message: any): void;
    parseWSOrder(order: any): any;
    parseWSOrderStatus(status: any): string;
    handleMessage(client: any, message: any): any;
    handleAuthenticationMessage(client: any, message: any): any;
    handleSubscriptionStatus(client: any, message: any): void;
    authenticate(params?: {}): any;
}
