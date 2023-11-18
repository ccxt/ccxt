import whitebitRest from '../whitebit.js';
import { Int, Str } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class whitebit extends whitebitRest {
    describe(): undefined;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOHLCV(client: Client, message: any): any;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleOrderBook(client: Client, message: any): void;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    handleTicker(client: Client, message: any): any;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTrades(client: Client, message: any): void;
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleMyTrades(client: Client, message: any, subscription?: undefined): void;
    parseWsTrade(trade: any, market?: undefined): import("../base/types.js").Trade;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOrder(client: Client, message: any, subscription?: undefined): void;
    parseWsOrder(order: any, market?: undefined): import("../base/types.js").Order;
    parseWsOrderType(status: any): Str;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: Client, message: any): void;
    watchPublic(messageHash: any, method: any, reqParams?: never[], params?: {}): Promise<any>;
    watchMultipleSubscription(messageHash: any, method: any, symbol: any, isNested?: boolean, params?: {}): Promise<any>;
    watchPrivate(messageHash: any, method: any, reqParams?: never[], params?: {}): Promise<any>;
    authenticate(params?: {}): Promise<any>;
    handleAuthenticate(client: Client, message: any): any;
    handleErrorMessage(client: Client, message: any): any;
    handleMessage(client: Client, message: any): void;
    handleSubscriptionStatus(client: Client, message: any, id: any): void;
    handlePong(client: Client, message: any): any;
    ping(client: any): {
        id: number;
        method: string;
        params: never[];
    };
}
