import wooRest from '../woo.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class woo extends wooRest {
    describe(): any;
    requestId(url: any): any;
    watchPublic(messageHash: any, message: any): Promise<any>;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleOrderBook(client: Client, message: any): void;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    parseWsTicker(ticker: any, market?: any): import("../base/types.js").Ticker;
    handleTicker(client: Client, message: any): any;
    watchTickers(symbols?: string[], params?: {}): Promise<any>;
    handleTickers(client: Client, message: any): void;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOHLCV(client: Client, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTrade(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: any): import("../base/types.js").Trade;
    checkRequiredUid(error?: boolean): boolean;
    authenticate(params?: {}): any;
    watchPrivate(messageHash: any, message: any, params?: {}): Promise<any>;
    watchOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseWsOrder(order: any, market?: any): import("../base/types.js").Order;
    handleOrderUpdate(client: Client, message: any): void;
    handleOrder(client: Client, message: any): void;
    handleMessage(client: Client, message: any): any;
    ping(client: any): {
        event: string;
    };
    handlePing(client: Client, message: any): {
        event: string;
    };
    handlePong(client: Client, message: any): any;
    handleSubscribe(client: Client, message: any): any;
    handleAuth(client: Client, message: any): void;
}
