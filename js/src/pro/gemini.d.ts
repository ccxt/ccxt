import geminiRest from '../gemini.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class gemini extends geminiRest {
    describe(): any;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseWsTrade(trade: any, market?: any): import("../base/types.js").Trade;
    handleTrade(client: Client, message: any): void;
    handleTrades(client: Client, message: any): void;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOHLCV(client: Client, message: any): any;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleOrderBook(client: Client, message: any): void;
    handleL2Updates(client: Client, message: any): void;
    watchOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleHeartbeat(client: Client, message: any): any;
    handleSubscription(client: Client, message: any): any;
    handleOrder(client: Client, message: any): void;
    parseWsOrder(order: any, market?: any): any;
    parseWsOrderStatus(status: any): string;
    parseWsOrderType(type: any): string;
    handleError(client: Client, message: any): void;
    handleMessage(client: Client, message: any): any;
    authenticate(params?: {}): Promise<void>;
}
