import mexcRest from '../mexc.js';
export default class mexc extends mexcRest {
    describe(): any;
    watchTicker(symbol: any, params?: {}): Promise<any>;
    handleTicker(client: any, message: any): any;
    watchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOHLCV(client: any, message: any): any;
    parseWsOHLCV(ohlcv: any, market?: any): number[];
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any): void;
    handleOrderBookMessage(client: any, message: any, orderbook: any): any;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    handleTrades(client: any, message: any): void;
    watchMyTrades(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleMyTrade(client: any, message: any, subscription?: any): void;
    parseWsTrade(trade: any, market?: any): import("../base/types.js").Trade;
    watchOrders(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOrder(client: any, message: any, subscription?: any): void;
    parseWSOrder(order: any, market?: any): any;
    parseSwapSide(side: any): string;
    parseWsOrderStatus(status: any, market?: any): string;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: any, message: any): void;
    watchSwapPublic(messageHash: any, channel: any, requestParams: any, params?: {}): Promise<any>;
    watchSpotPublic(messageHash: any, channel: any, requestParams: any, params?: {}): Promise<any>;
    watchSpotPrivate(messageHash: any, params?: {}): Promise<any>;
    watchSwapPrivate(messageHash: any, params?: {}): Promise<any>;
    handleErrorMessage(client: any, message: any): any;
    handleAuthenticate(client: any, message: any): any;
    handleMessage(client: any, message: any): void;
    ping(client: any): "ping" | {
        method: string;
    };
    handlePong(client: any, message: any): any;
}
