import zbRest from '../zb.js';
export default class zb extends zbRest {
    describe(): any;
    watchPublic(url: any, messageHash: any, symbol: any, method: any, limit?: any, params?: {}): Promise<any>;
    watchTicker(symbol: any, params?: {}): Promise<any>;
    parseWsTicker(ticker: any, market?: any): import("../base/types.js").Ticker;
    handleTicker(client: any, message: any, subscription: any): any;
    watchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOHLCV(client: any, message: any, subscription: any): any;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    handleTrades(client: any, message: any, subscription: any): void;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    parseWsTrade(trade: any, market?: any): import("../base/types.js").Trade;
    handleOrderBook(client: any, message: any, subscription: any): void;
    handleOrderBookMessage(client: any, message: any, orderbook: any): any;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleMessage(client: any, message: any): any;
    handleErrorMessage(client: any, message: any): any;
}
