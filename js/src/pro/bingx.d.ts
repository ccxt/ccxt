import bingxRest from '../bingx.js';
import { Int, OHLCV, Str } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bingx extends bingxRest {
    describe(): any;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTrades(client: Client, message: any): void;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleDelta(bookside: any, delta: any): void;
    handleOrderBook(client: Client, message: any): void;
    parseWsOHLCV(ohlcv: any, market?: any): OHLCV;
    handleOHLCV(client: Client, message: any): void;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    watchBalance(params?: {}): Promise<any>;
    handleErrorMessage(client: any, message: any): boolean;
    authenticate(params?: {}): Promise<void>;
    pong(client: any, message: any): Promise<void>;
    handleOrder(client: any, message: any): void;
    handleMyTrades(client: Client, message: any): void;
    handleBalance(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
}
