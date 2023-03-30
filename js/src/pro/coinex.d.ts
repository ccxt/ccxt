import coinexRest from '../coinex.js';
import { Int } from '../base/types.js';
export default class coinex extends coinexRest {
    describe(): any;
    requestId(): any;
    handleTicker(client: any, message: any): void;
    parseWSTicker(ticker: any, market?: any): import("../base/types.js").Ticker;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: any, message: any): void;
    handleTrades(client: any, message: any): void;
    parseWSTrade(trade: any, market?: any): import("../base/types.js").Trade;
    handleOHLCV(client: any, message: any): void;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    watchTickers(symbols?: string[], params?: {}): any;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBook(client: any, message: any): void;
    watchOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOrders(client: any, message: any): void;
    parseWSOrder(order: any): any;
    parseWSOrderStatus(status: any): string;
    handleMessage(client: any, message: any): any;
    handleAuthenticationMessage(client: any, message: any): any;
    handleSubscriptionStatus(client: any, message: any): void;
    authenticate(params?: {}): any;
}
