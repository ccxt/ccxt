import huobijpRest from '../huobijp.js';
import type { Int, OrderBook, Trade, Ticker, OHLCV } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class huobijp extends huobijpRest {
    describe(): any;
    requestId(): any;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleTicker(client: Client, message: any): any;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): any;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: any): void;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBookSnapshot(client: Client, message: any, subscription: any): void;
    watchOrderBookSnapshot(client: any, message: any, subscription: any): Promise<any>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBookMessage(client: Client, message: any, orderbook: any): any;
    handleOrderBook(client: Client, message: any): void;
    handleOrderBookSubscription(client: Client, message: any, subscription: any): void;
    handleSubscriptionStatus(client: Client, message: any): any;
    handleSystemStatus(client: Client, message: any): any;
    handleSubject(client: Client, message: any): any;
    pong(client: any, message: any): Promise<void>;
    handlePing(client: Client, message: any): void;
    handleErrorMessage(client: Client, message: any): any;
    handleMessage(client: Client, message: any): void;
}
