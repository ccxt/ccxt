import ripioRest from '../ripio.js';
import { Int } from '../base/types.js';
export default class ripio extends ripioRest {
    describe(): any;
    watchTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTrade(client: any, message: any, subscription: any): any;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    handleTicker(client: any, message: any, subscription: any): any;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    fetchOrderBookSnapshot(client: any, subscription: any): Promise<void>;
    handleOrderBook(client: any, message: any, subscription: any): any;
    handleOrderBookMessage(client: any, message: any, orderbook: any): any;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    ack(client: any, messageId: any): Promise<void>;
    handleMessage(client: any, message: any): any;
}
