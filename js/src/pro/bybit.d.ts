import bybitRest from '../bybit.js';
export default class bybit extends bybitRest {
    describe(): any;
    requestId(): any;
    getUrlByMarketType(symbol?: string, isPrivate?: boolean, method?: any, params?: {}): any;
    cleanParams(params: any): any;
    watchTicker(symbol: any, params?: {}): Promise<any>;
    handleTicker(client: any, message: any): void;
    watchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOHLCV(client: any, message: any): void;
    parseWsOHLCV(ohlcv: any): number[];
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any): void;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    handleTrades(client: any, message: any): void;
    parseWsTrade(trade: any, market?: any): import("../base/types.js").Trade;
    getPrivateType(url: any): "spot" | "unified" | "usdc";
    watchMyTrades(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleMyTrades(client: any, message: any): void;
    watchOrders(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOrder(client: any, message: any, subscription?: any): void;
    parseWsSpotOrder(order: any, market?: any): any;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: any, message: any): void;
    parseWsBalance(balance: any, accountType?: any): void;
    watchTopics(url: any, messageHash: any, topics?: any[], params?: {}): Promise<any>;
    authenticate(url: any, params?: {}): any;
    handleErrorMessage(client: any, message: any): boolean;
    handleMessage(client: any, message: any): void;
    ping(client: any): {
        req_id: any;
        op: string;
    };
    handlePong(client: any, message: any): any;
    handleAuthenticate(client: any, message: any): any;
    handleSubscriptionStatus(client: any, message: any): any;
}
