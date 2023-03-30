import exmoRest from '../exmo.js';
import { Int } from '../base/types.js';
export default class exmo extends exmoRest {
    describe(): any;
    requestId(): any;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: any, message: any): void;
    parseSpotBalance(message: any): void;
    parseMarginBalance(message: any): void;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    handleTicker(client: any, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTrades(client: any, message: any): void;
    watchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleMyTrades(client: any, message: any): void;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any): void;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleMessage(client: any, message: any): any;
    handleSubscribed(client: any, message: any): any;
    handleInfo(client: any, message: any): any;
    handleAuthenticationMessage(client: any, message: any): void;
    authenticate(params?: {}): any;
}
