import zbRest from '../zb.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class zb extends zbRest {
    describe(): any;
    watchPublic(url: any, messageHash: any, symbol: any, method: any, limit?: Int, params?: {}): Promise<any>;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    parseWsTicker(ticker: any, market?: any): import("../base/types.js").Ticker;
    handleTicker(client: Client, message: any, subscription: any): any;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOHLCV(client: Client, message: any, subscription: any): any;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTrades(client: Client, message: any, subscription: any): void;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    parseWsTrade(trade: any, market?: any): import("../base/types.js").Trade;
    handleOrderBook(client: Client, message: any, subscription: any): void;
    handleOrderBookMessage(client: Client, message: any, orderbook: any): any;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleMessage(client: Client, message: any): any;
    handleErrorMessage(client: Client, message: any): any;
}
