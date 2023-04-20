import okxRest from '../okx.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class okx extends okxRest {
    describe(): any;
    subscribe(access: any, channel: any, symbol: any, params?: {}): Promise<any>;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTrades(client: Client, message: any): any;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    handleTicker(client: Client, message: any): any;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOHLCV(client: Client, message: any): void;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBookMessage(client: Client, message: any, orderbook: any, messageHash: any): any;
    handleOrderBook(client: Client, message: any): any;
    authenticate(params?: {}): any;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: Client, message: any): void;
    watchOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOrders(client: Client, message: any, subscription?: any): void;
    handleSubscriptionStatus(client: Client, message: any): any;
    handleAuthenticate(client: Client, message: any): void;
    ping(client: any): string;
    handlePong(client: Client, message: any): any;
    handleErrorMessage(client: Client, message: any): any;
    handleMessage(client: Client, message: any): any;
}
