import hitbtcRest from '../hitbtc.js';
export default class hitbtc extends hitbtcRest {
    describe(): any;
    watchPublic(symbol: any, channel: any, timeframe?: any, params?: {}): Promise<any>;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    handleOrderBookSnapshot(client: any, message: any): void;
    handleOrderBookUpdate(client: any, message: any): void;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    watchTicker(symbol: any, params?: {}): Promise<any>;
    handleTicker(client: any, message: any): void;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    handleTrades(client: any, message: any): any;
    watchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOHLCV(client: any, message: any): any;
    handleNotification(client: any, message: any): any;
    handleMessage(client: any, message: any): void;
}
