import huobijpRest from '../huobijp.js';
import { Int } from '../base/types.js';
export default class huobijp extends huobijpRest {
    describe(): any;
    requestId(): any;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    handleTicker(client: any, message: any): any;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTrades(client: any, message: any): any;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOHLCV(client: any, message: any): void;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleOrderBookSnapshot(client: any, message: any, subscription: any): void;
    watchOrderBookSnapshot(client: any, message: any, subscription: any): Promise<any>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBookMessage(client: any, message: any, orderbook: any): any;
    handleOrderBook(client: any, message: any): void;
    handleOrderBookSubscription(client: any, message: any, subscription: any): void;
    handleSubscriptionStatus(client: any, message: any): any;
    handleSystemStatus(client: any, message: any): any;
    handleSubject(client: any, message: any): any;
    pong(client: any, message: any): Promise<void>;
    handlePing(client: any, message: any): void;
    handleErrorMessage(client: any, message: any): any;
    handleMessage(client: any, message: any): void;
}
