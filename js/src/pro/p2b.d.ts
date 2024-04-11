import p2bRest from '../p2b.js';
import type { Int, OHLCV, OrderBook, Trade, Ticker } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class p2b extends p2bRest {
    describe(): any;
    subscribe(name: string, messageHash: string, request: any, params?: {}): Promise<any>;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOHLCV(client: Client, message: any): any;
    handleTrade(client: Client, message: any): any;
    handleTicker(client: Client, message: any): any;
    handleOrderBook(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
    handleErrorMessage(client: Client, message: any): boolean;
    ping(client: any): {
        method: string;
        params: any[];
        id: number;
    };
    handlePong(client: Client, message: any): any;
    onError(client: Client, error: any): void;
    onClose(client: Client, error: any): void;
}
