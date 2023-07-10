import independentreserveRest from '../independentreserve.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class independentreserve extends independentreserveRest {
    describe(): any;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTrades(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: any): import("../base/types.js").Trade;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleOrderBook(client: Client, message: any): void;
    valueToChecksum(value: any): any;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleHeartbeat(client: Client, message: any): any;
    handleSubscriptions(client: Client, message: any): any;
    handleMessage(client: Client, message: any): any;
}
