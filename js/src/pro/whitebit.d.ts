import whitebitRest from '../whitebit.js';
import { Int } from '../base/types.js';
export default class whitebit extends whitebitRest {
    describe(): any;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOHLCV(client: any, message: any): any;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any): void;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    handleTicker(client: any, message: any): any;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTrades(client: any, message: any): void;
    watchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleMyTrades(client: any, message: any, subscription?: any): void;
    parseWsTrade(trade: any, market?: any): import("../base/types.js").Trade;
    watchOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOrder(client: any, message: any, subscription?: any): void;
    parseWsOrder(order: any, status: any, market?: any): any;
    parseWsOrderType(status: any): string;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: any, message: any): void;
    watchPublic(messageHash: any, method: any, reqParams?: any[], params?: {}): Promise<any>;
    watchMultipleSubscription(messageHash: any, method: any, symbol: any, isNested?: boolean, params?: {}): Promise<any>;
    watchPrivate(messageHash: any, method: any, reqParams?: any[], params?: {}): Promise<any>;
    authenticate(params?: {}): Promise<any>;
    handleAuthenticate(client: any, message: any): any;
    handleErrorMessage(client: any, message: any): any;
    handleMessage(client: any, message: any): void;
    handleSubscriptionStatus(client: any, message: any, id: any): void;
    handlePong(client: any, message: any): any;
    ping(client: any): {
        id: number;
        method: string;
        params: any[];
    };
}
