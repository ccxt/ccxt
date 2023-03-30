import deribitRest from '../deribit.js';
import { Int } from '../base/types.js';
export default class deribit extends deribitRest {
    describe(): any;
    requestId(): any;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: any, message: any): void;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    handleTicker(client: any, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTrades(client: any, message: any): void;
    watchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleMyTrades(client: any, message: any): void;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any): void;
    cleanOrderBook(data: any): any;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    watchOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOrders(client: any, message: any): void;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOHLCV(client: any, message: any): void;
    handleMessage(client: any, message: any): any;
    handleAuthenticationMessage(client: any, message: any): any;
    authenticate(params?: {}): Promise<any>;
}
