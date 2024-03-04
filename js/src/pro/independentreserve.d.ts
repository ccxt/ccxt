import independentreserveRest from '../independentreserve.js';
import type { Int, OrderBook, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class independentreserve extends independentreserveRest {
    describe(): any;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: any): Trade;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    valueToChecksum(value: any): any;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleHeartbeat(client: Client, message: any): any;
    handleSubscriptions(client: Client, message: any): any;
    handleMessage(client: Client, message: any): void;
}
