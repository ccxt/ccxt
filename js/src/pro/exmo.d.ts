import exmoRest from '../exmo.js';
import type { Int, Str, OrderBook, Trade, Ticker, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class exmo extends exmoRest {
    describe(): any;
    requestId(): any;
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    parseSpotBalance(message: any): void;
    parseMarginBalance(message: any): void;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleTicker(client: Client, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleMyTrades(client: Client, message: any): void;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleMessage(client: Client, message: any): void;
    handleSubscribed(client: Client, message: any): any;
    handleInfo(client: Client, message: any): any;
    handleAuthenticationMessage(client: Client, message: any): void;
    authenticate(params?: {}): Promise<any>;
}
