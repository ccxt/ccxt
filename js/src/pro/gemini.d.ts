import geminiRest from '../gemini.js';
import { Int } from '../base/types.js';
export default class gemini extends geminiRest {
    describe(): any;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseWsTrade(trade: any, market?: any): import("../base/types.js").Trade;
    handleTrade(client: any, message: any): void;
    handleTrades(client: any, message: any): void;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOHLCV(client: any, message: any): any;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any): void;
    handleL2Updates(client: any, message: any): void;
    watchOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleHeartbeat(client: any, message: any): any;
    handleSubscription(client: any, message: any): any;
    handleOrder(client: any, message: any): void;
    parseWsOrder(order: any, market?: any): any;
    parseWsOrderStatus(status: any): string;
    parseWsOrderType(type: any): string;
    handleError(client: any, message: any): void;
    handleMessage(client: any, message: any): any;
    authenticate(params?: {}): Promise<void>;
}
