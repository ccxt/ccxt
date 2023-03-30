import hitbtcRest from '../hitbtc.js';
import { Int } from '../base/types.js';
export default class hitbtc extends hitbtcRest {
    describe(): any;
    watchPublic(symbol: string, channel: any, timeframe?: any, params?: {}): Promise<any>;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleOrderBookSnapshot(client: any, message: any): void;
    handleOrderBookUpdate(client: any, message: any): void;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    handleTicker(client: any, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTrades(client: any, message: any): any;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOHLCV(client: any, message: any): any;
    handleNotification(client: any, message: any): any;
    handleMessage(client: any, message: any): void;
}
