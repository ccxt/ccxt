import independentreserveRest from '../independentreserve.js';
export default class independentreserve extends independentreserveRest {
    describe(): any;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    handleTrades(client: any, message: any): void;
    parseWsTrade(trade: any, market?: any): import("../base/types.js").Trade;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any): void;
    valueToChecksum(value: any): any;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleHeartbeat(client: any, message: any): any;
    handleSubscriptions(client: any, message: any): any;
    handleMessage(client: any, message: any): any;
}
