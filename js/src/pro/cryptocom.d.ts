import cryptocomRest from '../cryptocom.js';
import { Int } from '../base/types.js';
export default class cryptocom extends cryptocomRest {
    describe(): any;
    pong(client: any, message: any): Promise<void>;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleOrderBookSnapshot(client: any, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTrades(client: any, message: any): void;
    watchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    handleTicker(client: any, message: any): void;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOHLCV(client: any, message: any): void;
    watchOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOrders(client: any, message: any, subscription?: any): void;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: any, message: any): void;
    watchPublic(messageHash: any, params?: {}): Promise<any>;
    watchPrivate(messageHash: any, params?: {}): Promise<any>;
    handleErrorMessage(client: any, message: any): boolean;
    handleMessage(client: any, message: any): void;
    authenticate(params?: {}): any;
    handlePing(client: any, message: any): void;
    handleAuthenticate(client: any, message: any): void;
}
