import ripioRest from '../ripio.js';
export default class ripio extends ripioRest {
    describe(): any;
    watchTrades(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleTrade(client: any, message: any, subscription: any): any;
    watchTicker(symbol: any, params?: {}): Promise<any>;
    handleTicker(client: any, message: any, subscription: any): any;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    fetchOrderBookSnapshot(client: any, subscription: any): Promise<void>;
    handleOrderBook(client: any, message: any, subscription: any): any;
    handleOrderBookMessage(client: any, message: any, orderbook: any): any;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    ack(client: any, messageId: any): Promise<void>;
    handleMessage(client: any, message: any): any;
}
