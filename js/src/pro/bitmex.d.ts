import bitmexRest from '../bitmex.js';
import { Int } from '../base/types.js';
export default class bitmex extends bitmexRest {
    describe(): any;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    handleTicker(client: any, message: any): any;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: any, message: any): void;
    handleTrades(client: any, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    authenticate(params?: {}): any;
    handleAuthenticationMessage(client: any, message: any): void;
    watchOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOrders(client: any, message: any): void;
    watchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleMyTrades(client: any, message: any): void;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOHLCV(client: any, message: any): void;
    watchHeartbeat(params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any): void;
    handleSystemStatus(client: any, message: any): any;
    handleSubscriptionStatus(client: any, message: any): any;
    handleErrorMessage(client: any, message: any): boolean;
    handleMessage(client: any, message: any): any;
}
